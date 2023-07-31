<template>
  <thead v-if="props.columns.length">
    <TableNewRow
      v-if="props.addRow"
      :columns="props.columns"
      :table-id="props.tableId"
    />
    <tr class="cols-name">
      <th v-for="col in props.columns" :key="col">
        {{ col.name }}
      </th>
    </tr>
  </thead>
</template>
<script setup>
import { deepClone, removeState, dir, deepCompare } from "~/static/utils";
import { v4 } from "uuid";
import { upsert, getAll, dbDelete } from "~/static/db";
import { durationValidate } from "~~/static/time";
import GetId from "~~/components/GetId.vue";
// >>>----------------------------------------------------------------------------------<<<
// <<DEV>> TODO
const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  newItem: {
    type: Object,
    required: false,
  },
  suggestions: {
    type: Array,
    required: false,
    default: () => ref([]),
  },
  addRow: {
    type: Boolean,
    required: false,
    default: true,
  },
  tableId: {
    type: String,
    required: true,
  },
});
// TODO <</DEV>>
// >>>----------------------------------------------------------------------------------<<<
</script>
<style></style>
