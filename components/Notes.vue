<template>
  <div class="notes flex flex-col">
    <textarea
      v-for="(note, index) in notes"
      v-model="notes[index].text"
      :key="note.text"
      :id="note.id"
      :class="{ isEditing: note.isEditing }"
      @change="note.isEditing = true"
      @keyup.enter="upsertNote(note)"
    />
    <button @click="addNote">Add note</button>
  </div>
  <p>{{ notes }}</p>
</template>

<script setup>
import { v4 } from 'uuid';
import { upsert } from '~~/static/db';
const notes = ref([]);

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
    backendUrl + '/query' + '/management_note' + '/box/' + props.box
  );
  notes.value = cloudNotes.data;
});

const upsertNote = (note) => {
  upsert('management_note', note);
  note.isEditing = false;
};

const addNote = () => {
  console.log(notes.value);
  notes.value.unshift({
    text: '',
    isEditing: true,
    id: v4(),
    box: props.box,
    timestamp: createTimestamp(),
  });
  document.querySelector(`#${notes.value[0].id}`).focus();
};

const createTimestamp = () => {
  return `\n${
    new Date(new Date().getTime() + 7 * 60 * 60 * 1000)
      .toISOString()
      .replace(/[TZ]/g, ' ')
      .trim()
      .split('.')[0]
  }`;
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
