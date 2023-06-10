<template>
  <main class="m-5">
    <div>
      <div class="action-panel flex items-center">
        <div class="grid grid-cols-auto items-center gap-1 mt-5">
          <input
            v-model="newNote.name"
            @keydown.enter="addNewNote"
            placeholder="Note name"
            class="col-start-1"
          />
          <input
            v-model="newNote.box"
            @keydown.enter="addNewNote"
            placeholder="Box"
            class="col-start-1"
          />
          <button
            class="btn-circle col-start-2 row-start-1"
            @click="addNewNote"
          >
            +
          </button>
          <button class="btn-circle col-start-2" @click="deleteNote">-</button>
          <label class="col-start-3 row-start-1">Create note</label>
          <label class="col-start-3 row-start-2">Delete note</label>
        </div>
      </div>
      <div class="notes grid gap-3 mt-3">
        <div v-for="note in notes" :key="note" class="note">
          <h2 class="text-center text-xl font-bold">{{ note.name }}</h2>
          <h5
            v-if="note.box && note.name != note.box"
            class="text-center text-sm font-bold"
          >
            ({{ note.box }})
          </h5>
          <Note :name="note.name" :box="note.box" />
        </div>
      </div>
    </div>
  </main>
</template>
<script setup>
import { upsert } from '~~/static/db';
import { createTimestamp } from '~~/static/time';
import { unwrap } from '~~/static/utils';
import { v4 } from 'uuid';
import { request } from '~~/static/request';

const vars = inject('vars');
const backendUrl = vars.backendUrl;
const notes = ref([]);
// REFACTOR : use class instead of object
// class Note {
//   constructor(name, box) {
//     this.name = name;
//     this.box = box;
//   }
//   reset() {
//     this.name = '';
//     this.box = '';
//   }
// }
const newNote = reactive({
  id: v4(),
  text: '',
  name: '',
  box: '',
  versionHistory: {},
});
onMounted(async () => {
  await nextTick();
  const cloudNotes = (await useFetch(backendUrl + '/all/management_note')).data
    ._rawValue;
  notes.value = cloudNotes;
});
function addNewNote() {
  if (newNote.name) {
    newNote.createdAt = createTimestamp();
    newNote.lastUpdated = createTimestamp();
    notes.value.push(unwrap(newNote));
    newNote.id = v4();
    newNote.name = '';
    newNote.box = '';
    upsert('management_note', newNote);
  }
}

function deleteNote() {
  if (newNote.name) {
    // get note Id
    const noteId = notes.value.find((note) => note.name == newNote.name).id;
    request(backendUrl + '/delete/management_note', 'post', [noteId]);
    notes.value = notes.value.filter((note) => note.name != newNote.name);
  }
}
</script>
<style>
.notes {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
</style>
