<template>
  <div class="note flex flex-col h-fit">
    <h3>{{ title }}</h3>
    <textarea
      onfocus='this.style.height = "";this.style.height = this.scrollHeight + "px"'
      v-model="note.text"
      :class="{ isEditing }"
      @input="isEditing = true"
      @keydown="handleKeydown($event)"
      @blur="applyChange()"
    />

    <div class="version-history">
      <div class="flex justify-between">
        <button v-show="showVersion" @click="viewVersion == 0 || viewVersion--">
          &lt;
        </button>
        <btn-show-hide
          v-if="props.showVersionHistory"
          class="m-auto"
          @click="showVersion = !showVersion"
          :is-default-show="false"
        />
        <button
          v-show="showVersion"
          @click="
            viewVersion == note.versionHistory.stack.length - 1 || viewVersion++
          "
        >
          &gt;
        </button>
      </div>
      <div v-show="showVersion" class="flex p-2">
        <div
          v-for="(item, index) in note.versionHistory.stack"
          :key="item.id"
          class="w-4 h-4 bg-gray-500"
          :class="{
            'bg-yellow-500': index == viewVersion,
            'mr-2': index != note.versionHistory.stack.length - 1,
          }"
        ></div>
      </div>
      <textarea
        v-show="showVersion"
        :value="note.versionHistory.stack[viewVersion]?.text"
        disabled
      />
      <p
        v-show="
          showVersion && note.versionHistory.stack[viewVersion]?.timestamp
        "
        class="text-xs text-center"
      >
        {{ note.versionHistory.stack[viewVersion]?.timestamp }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { v4 } from 'uuid';
import { upsert } from '~~/static/db';
import { createTimestamp } from '~~/static/time';
import { syncReactive } from '~~/static/utils';
import FILOArray from '~~/static/class/FILOArray';

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
  title: {
    type: String,
    required: false,
  },
  showVersionHistory: {
    type: Boolean,
    required: false,
    default: true,
  },
  data: {
    type: Object,
    required: false,
  },
});

const showVersion = ref(false);
const viewVersion = ref(0);

const note = reactive({
  id: '',
  text: '',
  lastUpdated: '',
  box: '',
  name: '',
  versionHistory: new FILOArray(),
});

const { backendUrl } = useRuntimeConfig();
onMounted(async () => {
  await nextTick();
  Object.setPrototypeOf(note.versionHistory, FILOArray.prototype);
  if (props.data) {
    syncReactive(note, props.data);
    Object.setPrototypeOf(note.versionHistory, FILOArray.prototype);
    viewVersion.value = note.versionHistory.stack.length - 1;
    return;
  }
  let cloudNote = await useFetch(
    backendUrl + '/query' + '/management_note' + '/name/' + props.name
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
    viewVersion.value = note.versionHistory.stack.length - 1;
    // wait 0.5s to make sure all notes are loaded
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    console.error(error);
  }
});

const isEditing = ref(false);
// Alert save changes
window.addEventListener('beforeunload', function (event) {
  if (isEditing.value) {
    event.preventDefault();
    event.returnValue = '';
    return '';
  }
});

const handleKeydown = (event) => {
  if (event.shiftKey && event.keyCode === 13) {
    event.preventDefault();
    applyChange();
  }
};

const applyChange = () => {
  if (note.text == note.versionHistory[viewVersion]) {
    return;
  }
  note.lastUpdated = createTimestamp();
  note.versionHistory.push(note.text);
  upsert('management_note', note);
  isEditing.value = false;
  viewVersion.value = note.versionHistory.stack.length - 1;
};
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
