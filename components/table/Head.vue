<template>
  <thead v-if="config.columns.length">
    <TableNewRow v-if="config.addRow" :table-id="props.tableId" />
    <tr class="cols-name">
      <!-- Select column -->
      <th v-if="config.showSelection"></th>
      <!-- Draggable -->
      <th v-if="config.draggable"></th>
      <!-- Index column -->
      <th v-if="config.showIndex"></th>
      <th
        v-for="(col, key, ab) in config.columns.filter((col) => !col?.hidden)"
        :key="col"
        class="col-name"
        :class="col.key + ' ' + col?.class"
      >
        {{ col.name }}
      </th>
    </tr>
  </thead>
</template>
<script setup>
const props = defineProps({
  tableId: {
    type: String,
    required: true,
  },
});

const config = inject('config-' + props.tableId);
// >>>----------------------------------------------------------------------------------<<<
// <<DEV>> TODO

// TODO <</DEV>>
// >>>----------------------------------------------------------------------------------<<<
</script>
<style></style>
