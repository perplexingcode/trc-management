<template>
  <tbody>
    <TableRow
      v-for="item in props.rows"
      :key="item.id"
      :columns="props.columns"
      :item="item"
      :table-id="props.tableId"
    />
  </tbody>
</template>
<script setup>
// >>>----------------------------------------------------------------------------------<<<
// <DEV> TODO
const props = defineProps({
  rows: {
    type: Array,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
  },
  tableId: {
    type: String,
    required: true,
  },
});

// TODO </DEV>
// >>>----------------------------------------------------------------------------------<<<
// <DEV> NEO
// const tableActions = props.action.replaceAll(" ", "").split(",");
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

// console.log(props.rows);
// let tableBody = computed(() =>
//   h(
//     "tbody",
//     rows.value.map((item, index) => {
//       return h(
//         "tr",
//         {
//           id: "row-" + item.id,
//           class: [
//             "table-row",
//             {
//               "is-selected": item.state.isSelected,
//               "is-being-edited": item.state.isBeingEdited,
//               "is-focused": item.state.isFocused,
//             },
//           ],
//           onDblclick: (e) => {
//             editRow(index, rows, e);
//           },
//           onClick: (e) => {
//             focusRow(index, rows, e);
//           },
//         },
//         columns
//           .map((col) => {
//             // Insert exception render here
//             return renderElement(col, item, false);
//           })
//           // Insert at the end of the row
//           .concat(
//             h(
//               "td",
//               {
//                 class: "cell-action flex",
//                 onClick: () => {
//                   states.activeRow = item.id;
//                 },
//               },
//               h(
//                 "div",
//                 {
//                   class: "flex",
//                 },
//                 [
//                   h(GetId, {
//                     isImg: true,
//                     class: { "d-none": !tableActions.includes("copyId") },
//                     value: item.id,
//                   }),
//                   h("img", {
//                     // TODO: Update src logic
//                     src: "https://management-img.s3.ap-southeast-1.amazonaws.com/minus.png",
//                     title: "Double click to delete row",
//                     class: [
//                       "btn action delete cursor-pointer",
//                       { "d-none": !tableActions.includes("delete") },
//                     ],
//                     onDblclick: (e) => {
//                       deleteRows(item.id);
//                     },
//                   }),
//                 ],
//               ),
//             ),
//           ),
//       );
//     }),
//   ),
// );
// async function deleteRows(id) {
//   let deleteRowList = [];
//   if (id) {
//     deleteRowList.push(id);
//     const index = rows.value.findIndex((row) => row.id === id);
//     rows.value.splice(index, 1);
//   } else {
//     for (let i = 0; i < rows.value.length; i++) {
//       if (rows.value[i].state.isSelected) {
//         deleteRowList.push(rows.value[i].id);
//         rows.value.splice(i, 1);
//         i--;
//       }
//     }
//   }
//   request(backendUrl + "/delete/management_" + itemName, "post", deleteRowList);
// }
// </DEV>
</script>
<style></style>
