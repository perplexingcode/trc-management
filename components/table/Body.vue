<template>
  <tbody v-show="state?.showRows">
    <TableRow
      v-for="(item, index) in rows"
      :key="item.id"
      :item="item"
      :table-id="props.tableId"
      :index="index + 1"
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

const state = inject('state-' + props.tableId);
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
//     state.selectedRows = _selectedRows;
//   },
//   { deep: true },
// );
// </DEV>
</script>
<style></style>
