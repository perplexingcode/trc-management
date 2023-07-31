<template>
  <input v-model="date" />
  <button @click="loadData()">Load Data</button>
  <EffectRerender ref="dataTable">
    <Table
      v-if="isLoadedData"
      rows="dataRows"
      columns="moveColumns"
      item-name="move"
      add-row
    />
  </EffectRerender>
</template>
<script setup>
import { getAll, query } from "~~/static/db";

const isLoadedData = ref(false);
const date = ref("");
const dataTable = ref(null);
let rows = ref(null);
const loadData = async () => {
  if (date.value === "") {
    rows.value = (await getAll("move")).data.value;
    dataTable.value.rerender();
    isLoadedData.value = true;
    return;
  }
  await nextTick();
  rows.value = (await query("move", "date", date.value)).data.value;
  dataTable.value.rerender();
  isLoadedData.value = true;
};

provide("dataRows", rows);
</script>
<style></style>
