<template>
  <ClientOnly>
    <div class="note" :id="'t' + note.id" v-if="alive">
      <NoteCreate
        v-if="props.isNewNote"
        @create-note="createNote"
        :box="props.box"
        :name="props.name"
        :type="props.type"
      />
      <div v-else>
        <NoteAtom v-if="props.type == 'atomic'" :note-id="note.id" />
        <NoteDefault
          v-if="props.type == 'default'"
          class="flex items-center"
          :note-id="note.id"
        />
        <NoteRow v-if="props.type == 'row'" :note-id="note.id" />
      </div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { v4 } from 'uuid';
import { dbDelete, query, upsert } from '~~/static/db';
import { createTimestamp } from '~~/static/time';
import { deepClone, cloudOverride } from '~~/static/utils';
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
    default: false,
  },
  showVersionHistory: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    required: false,
  },
  type: {
    type: String,
    default: 'default',
  },
  isNewNote: {
    type: Boolean,
    default: false,
  },
  cluster: {},
  clusterName: {
    type: String,
    default: '',
  },
});

const note = reactive({});

function initNote() {
  note.id = v4();
  note.name = props.name;
  note.title = '';
  note.box = props.box;
  note.text = '';
  if (props.cluster !== undefined) note.cluster = props.clusterName;
  else note.cluster = '';
  note.lastUpdated = createTimestamp();
  note.versionHistory = new FILOArray();
}
initNote();

const state = reactive({
  isEditing: false,
  showAction: false,
  showMore: false,
  viewVersion: 0,
  showEditTitle: false,
  newTitle: note?.title || '',
  showNote: false,
  showDetail: props.showDetail,
  showVersionHistory: props.showVersionHistory,
  noteInfo: computed(
    () =>
      `Title: ${note.title}\nBox: ${note.box}\nName: ${note.name}\nCluster: ${
        note.cluster || 'none'
      }\nLast updated: ${note.lastUpdated}\nText: ${note.text}\n`,
  ),
});

const events = reactive({
  deleteNote: false,
  applyChange: false,
});

provide('note-' + note.id, note);
provide('state-' + note.id, state);
provide('events-' + note.id, events);

onMounted(async () => {
  await nextTick();
  Object.setPrototypeOf(note.versionHistory, FILOArray.prototype);
  if (props.data) {
    cloudOverride(note, props.data);
    Object.setPrototypeOf(note.versionHistory, FILOArray.prototype);
    state.viewVersion = note.versionHistory.stack.length - 1;
    return;
  }
  if (props.isNewNote) return;

  let cloudNote = await query('note', 'name', props.name);
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
    cloudOverride(note, cloudNote);
    Object.setPrototypeOf(note.versionHistory, FILOArray.prototype);
    state.viewVersion = note.versionHistory.stack.length - 1;
    // wait 0.5s to make sure all notes are loaded
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    console.error(error);
  }
});

const computedEvents = computed(() => {
  return deepClone(events);
});
watch(computedEvents, (oldVal, newVal) => {
  if (newVal.deleteNote !== oldVal.deleteNote) deleteNote();
  if (newVal.applyChange !== oldVal.applyChange) applyChange();
});

function createNote() {
  props.cluster.push(note);
  upsert('note', note);
  note.id = v4();
}

const alive = ref(true);
function deleteNote() {
  if (confirm('Are you sure you want to delete this note?')) {
    dbDelete('note', note.id);
    alive.value = false;
  }
}

// Alert save changes
if (process.client) {
  window.addEventListener('beforeunload', function (events) {
    if (state.isEditing) {
      events.preventDefault();
      events.returnValue = '';
      return '';
    }
  });
}

const applyChange = () => {
  if (note.text == note.versionHistory[state.viewVersion]) {
    return;
  }
  upsert('note_backup', {
    id: v4(),
    noteId: note.id,
    text: note.text,
    name: note.name || v4(),
    box: note.box || v4(),
    cluster: note.cluster || '',
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
