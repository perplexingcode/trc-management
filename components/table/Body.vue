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

watch(
  rows,
  // if rows.length goes from 0 to 1, rerender table
  (newRows, oldRows) => {
    if (config.draggable && oldRows.length === 0 && newRows.length !== 0) {
      for (let i = 0; i < rows.value.length; i++) {
        if (rows.value[i].index === undefined) rows.value[i].index = i;
      }
      // sort rows by index
      rows.value.sort((a, b) => a.index - b.index);
    }
  },
  { deep: true },
);

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
