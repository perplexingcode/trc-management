<template>
  <tbody v-show="states.showRows">
    <TableRow
      v-for="item in rows"
      :key="item.id"
      :item="item"
      :table-id="props.tableId"
    />
  </tbody>
</template>
<script setup>
// >>>----------------------------------------------------------------------------------<<<
// <DEV> TODO
const props = defineProps({
  tableId: {
    type: String,
    required: true,
  },
});

const states = inject('states-' + props.tableId);
const rows = inject('rows-' + props.tableId);
const config = inject('config-' + props.tableId);

// TODO </DEV>
// >>>----------------------------------------------------------------------------------<<<
// <DEV> NEO
// watch(
//   props.rows,
//   () => {
//     let _selectedRows = [];
//     rows.value.forEach((row) => {
//       if (row.state.isSelected) {
//         _selectedRows.push(row.id);
//       }
//     });
//     states.selectedRows = _selectedRows;
//   },
//   { deep: true },
// );
// </DEV>
</script>
<style></style>
