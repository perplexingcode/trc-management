<template>
  <div class="action-panel flex items-center">
    <div class="grid grid-cols-auto items-center gap-1 mt-5">
      <input
        v-model="newNote.name"
        @keydown.enter="addNewNote"
        placeholder="Note name"
        class="col-start-1"
      />
      <input :value="props.box" class="col-start-1" disabled />
      <button class="btn-circle col-start-2 row-start-1" @click="addNewNote">
        +
      </button>
      <button class="btn-circle col-start-2" @click="deleteNote">-</button>
      <label class="col-start-3 row-start-1">Create note</label>
      <label class="col-start-3 row-start-2">Delete note</label>
    </div>
  </div>
  <div class="notes flex flex-col">
    <Note v-for="note in notes" :key="note.id" :note="note" />
  </div>
</template>

<script setup>
import { v4 } from "uuid";
import { upsert } from "~~/static/db";
import { createTimestamp } from "~~/static/time";
import { unwrap } from "~~/static/utils";
import { request } from "~~/static/request";
import FILOArray from "~~/static/class/FILOArrayNote";

const notes = ref([]);
const newNote = reactive({
  id: v4(),
  text: "",
  name: "",
  box: props.box,
  versionHistory: new FILOArray(),
});
// define props
const props = defineProps({
  box: {
    type: String,
    required: true,
  },
});

const { backendUrl } = useRuntimeConfig();
onMounted(async () => {
  const cloudNotes = await useFetch(
    backendUrl + "/query" + "/management_note" + "/box/" + props.box,
  );
  notes.value = cloudNotes.data;
});

async function addNewNote() {
  await nextTick();
  //if note already exists, return
  const noteNames = notes.value.map((note) => note.name);
  if (noteNames.includes(newNote.name)) {
    alert("Cannot add duplicate note.");
    return;
  }

  if (newNote.name) {
    newNote.createdAt = createTimestamp();
    newNote.lastUpdated = createTimestamp();
    notes.value.unshift(unwrap(newNote));
    newNote.id = v4();
    upsert("management_note", newNote);
    newNote.box = "";
    newNote.name = "";
  }
}
function deleteNote() {
  if (newNote.name) {
    // get note Id
    const noteId = notes.value.find((note) => note.name == newNote.name).id;
    request(backendUrl + "/delete/management_note", "post", [noteId]);
    notes.value = notes.value.filter((note) => note.name != newNote.name);
  }
}
</script>
