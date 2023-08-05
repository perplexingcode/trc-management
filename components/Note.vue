<template>
  <div class="note flex flex-col h-fit">
    <div class="note-main rounded">
      <h3 v-show="!state.showEditTitle" @dblclick="changeTitle">
        {{ note.title }}
      </h3>
      <input
        v-show="state.showEditTitle"
        v-model="newTitle"
        @keydown.enter="updateTitle"
      />
      <textarea
        onfocus='this.style.height = "";this.style.height = this.scrollHeight + "px"'
        v-model="note.text"
        :class="{ isEditing: state.isEditing }"
        @input="state.isEditing = true"
        @keydown="handleKeydown($event)"
        @blur="applyChange()"
      />
    </div>
    <div class="note-detail" v-if="props.showDetail">
      <btn-show-hide
        class="m-auto"
        @click="state.showMore = !state.showMore"
        :is-default-show="false"
      />
      <div class="detail" v-show="state.showMore">
        <div class="note-action flex justify-center">
          <button @click="changeNoteName">Rename</button>
          <button v-if="!note.title" @click="state.showEditTitle = true">
            Add title
          </button>
        </div>
        <div class="flex justify-between">
          <button
            v-show="state.showMore"
            @click="state.viewVersion == 0 || state.viewVersion--"
            class="rounded-full w-8 h-8"
          >
            &lt;
          </button>

          <button
            v-show="state.showMore"
            @click="
              state.viewVersion == note.versionHistory.stack.length - 1 ||
                state.viewVersion++
            "
            class="rounded-full w-8 h-8"
          >
            &gt;
          </button>
        </div>
        <div v-show="state.showMore" class="flex p-2 items-center">
          <div
            v-for="(item, index) in note.versionHistory.stack"
            :key="item.id"
            class="w-4 h-4 bg-gray-500"
            :class="{
              'bg-yellow-500': index == state.viewVersion,
              'mr-2': index != note.versionHistory.stack.length - 1,
            }"
          ></div>
        </div>
        <textarea
          v-show="state.showMore"
          :value="note.versionHistory.stack[state.viewVersion]?.text"
          disabled
        />
        <p
          v-show="
            state.showMore &&
            note.versionHistory.stack[state.viewVersion]?.timestamp
          "
          class="text-xs text-center"
        >
          {{ note.versionHistory.stack[state.viewVersion]?.timestamp }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { v4 } from 'uuid';
import { dbDelete, upsert } from '~~/static/db';
import { createTimestamp } from '~~/static/time';
import { syncReactive } from '~~/static/utils';
import FILOArray from '~~/static/class/FILOArrayNote';

// define props
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  box: {
    type: String,
    required: false,
  },
  showDetail: {
    type: Boolean,
    default: true,
  },
  data: {
    type: Object,
    required: false,
  },
});

const state = reactive({
  isEditing: false,
  showMore: false,
  viewVersion: 0,
  showEditTitle: false,
});

const note = reactive({
  id: v4(),
  text: '',
  lastUpdated: '',
  box: props.box,
  name: props.name,
  title: '',
  versionHistory: new FILOArray(),
});

const newTitle = ref(note?.title || '');

function changeTitle() {
  state.showEditTitle = true;
}
function updateTitle() {
  state.showEditTitle = false;
  note.title = newTitle.value;
  upsert('note', note);
}

const { backendUrl } = useRuntimeConfig();
onMounted(async () => {
  await nextTick();
  Object.setPrototypeOf(note.versionHistory, FILOArray.prototype);
  if (props.data) {
    syncReactive(note, props.data);
    Object.setPrototypeOf(note.versionHistory, FILOArray.prototype);
    state.viewVersion = note.versionHistory.stack.length - 1;
    return;
  }
  let cloudNote = await useFetch(
    backendUrl + '/query' + '/management_note' + '/name/' + props.name,
  );
  cloudNote = cloudNote.data._rawValue?.[0];
  // if (!cloudNote) {
  //   note.id = v4();
  //   note.text = '';
  //   note.box = props.box;
  //   note.name = props.name;
  //   note.lastUpdated = createTimestamp();
  //   note.versionHistory = new FILOArray();
  //   upsert('management_note', note);
  //   return;
  // }
  try {
    syncReactive(note, cloudNote);
    Object.setPrototypeOf(note.versionHistory, FILOArray.prototype);
    state.viewVersion = note.versionHistory.stack.length - 1;
    // wait 0.5s to make sure all notes are loaded
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    console.error(error);
  }
});

// Alert save changes
if (process.client) {
  window.addEventListener('beforeunload', function (event) {
    if (state.isEditing) {
      event.preventDefault();
      event.returnValue = '';
      return '';
    }
  });
}
const handleKeydown = (event) => {
  if (event.shiftKey && event.keyCode === 13) {
    event.preventDefault();
    applyChange();
  }
};

const applyChange = () => {
  if (note.text == note.versionHistory[state.viewVersion]) {
    return;
  }
  upsert('note_backup', {
    id: v4(),
    text: note.text,
    name: note.name || v4(),
    box: note.box || v4(),
    timestamp: createTimestamp(),
  });
  note.lastUpdated = createTimestamp();
  note.versionHistory.push(note.text);
  upsert('note', note);
  state.isEditing = false;
  state.viewVersion = note.versionHistory.stack.length - 1;
};

function changeNoteName() {
  const newName = prompt('Please enter new name', note.name);
  // if (newName == null || newName == '') {
  //   return;
  // }
  note.name = newName;
  dbDelete('note', note.id);
  upsert('note', note);
}
</script>

<style scoped>
.isEditing {
  @apply rounded outline outline-2 outline-yellow-200;
}
textarea {
  @apply rounded outline outline-2 outline-gray-200;
  min-height: 100px;
  width: 100%;
  margin-bottom: 10px;
}
</style>
