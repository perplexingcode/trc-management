<template>
  <tr class="row" @keyup="handleKeyUp($event)" @keydown="handleKeyDown($event)">
    <TableCell
      v-for="col in props.columns"
      :element="col"
      :item="props.item"
      :key="col.key"
      :table-id="props.tableId"
    />
  </tr>
</template>

<script setup>
// >>>----------------------------------------------------------------------------------<<<
// <DEV> TODO
const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  item: {
    type: Object,
    required: true,
  },
  tableId: {
    type: String,
    required: true,
  },
});
// TODO </DEV>
// >>>----------------------------------------------------------------------------------<<<
/*<DEV>
const tableActions = props.action.replaceAll(" ", "").split(",");
console.log(props.item);

function editRow(index, itemsArray, element) {
  rowBeingEdited.value = index;
  isEditing.value = true;
  itemsArray.value.forEach((item) => (item.state.isBeingEdited = false));
  itemsArray.value[index].state.isBeingEdited = true;
  nextTick(() => {
    element.target.focus();
  });
}
function focusRow(index, itemsArray, element) {
  // TODO : Error detected ưhen delete a row
  rowBeingFocused.value = index;
  itemsArray.value.forEach((item) => (item.state.isFocused = false));
  itemsArray.value[index].state.isFocused = true;
}
function upsertRow(index) {
  const rowToUpsert = rows._rawValue[index];
  if (!validateColumns(rowToUpsert)) return;
  upsert(itemName, rowToUpsert);
  rows.value[index].state.isBeingEdited = false;
  document.activeElement.blur();
  emits("rowUpsert", props.itemName);
}
async function deleteRows(id) {
  let deleteRowList = [];
  if (id) {
    deleteRowList.push(id);
    const index = rows.value.findIndex((row) => row.id === id);
    rows.value.splice(index, 1);
  } else {
    for (let i = 0; i < rows.value.length; i++) {
      if (rows.value[i].state.isSelected) {
        deleteRowList.push(rows.value[i].id);
        rows.value.splice(i, 1);
        i--;
      }
    }
  }
  request(backendUrl + "/delete/management_" + itemName, "post", deleteRowList);
}

</DEV>*/
</script>
<style></style>
