<template>
  <div class="note-cluster w-fit h-fit" :style="style">
    <Note
      v-for="note in notes"
      class="w-fit"
      :key="note.id"
      :name="note.name"
      :box="props.box"
      :cluster="notes"
      :clusterName="props.clusterName || props.box.replace('-cluster', '')"
      :data="note"
      :type="props.type"
    />
    <Note
      :name="props.name || v4()"
      :box="props.box"
      is-new-note
      :cluster="notes"
      :clusterName="props.clusterName || props.box.replace('-cluster', '')"
      class="new mx-auto"
      :type="props.type"
    />
  </div>
  <Json :data="notesT" />
</template>
<script setup>
import { query } from '~~/static/db.js';
import { v4 } from 'uuid';

const props = defineProps({
  box: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
  row: {
    type: Number,
    default: 2,
  },
  col: {
    type: Number,
  },
  type: {
    type: String,
    default: 'atomic',
  },
  clusterName: {
    type: String,
    default: '',
  },
});

const notes = (await query('note', 'box', props.box)).data;
const notesT = computed(() => notes.value.map((note) => note.title));
const row = computed(() => {
  return notes.value.length <= 3 ? 1 : props.row;
});
const col = computed(() => {
  if (props.type == 'row') return 1;
  // calculate col based on notes.length and props.row
  if (!props.col)
    return notes.value.length <= 3
      ? notes.value.length
      : Math.ceil(notes.value.length / props.row);
  return notes.value.length <= 3 ? notes.value.length : props.col;
});
const style = computed(() => {
  return `display: grid; grid-template-columns: repeat(${col.value}, 1fr); grid-template-rows: repeat(${row.value}, 1fr);`;
});
</script>
<style></style>
