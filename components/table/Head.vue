<template>
  <thead v-if="config.columns.length">
    <TableNewRow v-if="config.addRow" :table-id="props.tableId" />
    <tr class="cols-name">
      <th></th>
      <!-- Select column -->
      <th v-for="col in config.columns" :key="col">
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
