<template>
  <div>
    <div class="action-panel flex items-center">
      <input v-model="newBox" @keydown.enter="addNewBox" />
      <button class="btn-circle" @click="addNewBox">+</button>
    </div>
    <div class="note-boxes">
      <div v-for="box in boxes" :key="box" class="note-box">
        <h2 class="text-center text-xl font-bold">{{ box }}</h2>
        <Note :box="box" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { upsert } from '~~/static/db';

const vars = inject('vars');
const backendUrl = vars.backendUrl;
const boxes = ref([]);
const newBox = ref('');

onMounted(async () => {
  nextTick(async () => {
    const resp = (await useFetch(backendUrl + '/id/management_var/noteBoxes'))
      .data._rawValue;
    boxes.value = JSON.parse(resp.value);
  });
});
function addNewBox() {
  if (newBox.value) {
    boxes.value.push(newBox.value);
    newBox.value = '';
    upsert('management_var', {
      id: 'noteBoxes',
      value: JSON.stringify(boxes.value),
    });
  }
}
</script>
<style>
.note-boxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 1rem;
}
</style>
