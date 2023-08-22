<template>
  <tr
    class="row"
    @dblclick="handleDblClick"
    @keyup="handleKeyUp($event)"
    @keydown="handleKeyDown($event)"
    @click="states.activeRow = props.item.id"
    :class="{
      active: states.activeRow === props.item.id,
      'is-being-edited':
        states.activeRow === props.item.id && states.isBeingEdited,
    }"
  > 
  <TableCell
  :element="selectColumn"
  :item="props.item"
  :table-id="props.tableId"
  @delete-row="deleteRows"
  />
  <td class="index"><span>{{ props.index }}</span></td>
    <TableCell
      v-for="col in config.columns"
      :element="col"
      :item="props.item"
      :key="col.key"
      :table-id="props.tableId"
    />
    <TableCell
      :element="{ type: 'row-action' }"
      :item="props.item"
      :table-id="props.tableId"
      @delete-row="deleteRows"
    />
  </tr>
</template>

<script setup>
// >>>----------------------------------------------------------------------------------<<<
import { dbDelete, upsert } from '~/static/db.js';
import { validateItem } from '~~/static/table';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  tableId: {
    type: String,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const states = inject('states-' + props.tableId);
const rows = inject('rows-' + props.tableId);
const config = inject('config-' + props.tableId);

const selectColumn = {
  name: '',
  key: 'is-selected',
  type: 'is-selected',
  disabled: true,
  isState: true,
  attrs: { type: 'text', suggestion: false },
};

// Handle events
function handleDblClick(event) {
  if (props.item.state.isBeingEdited) return;
  editRow(props.item.id, event.target);
}

function handleKeyDown(event) {
  if (props.item.state.isBeingEdited) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      upsertRow(props.item.id);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopPropagation();
      upsertRow(props.item.id);
      goUp(props.item.id);
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      event.stopPropagation();
      upsertRow(props.item.id);
      goDown(props.item.id);
    }
  }
}

// Event actions
function editRow(id, element) {
  states.isEditing = true;
  states.rowBeingEdited = id;

  // Find row with item.id = id
  const index = rows.value.findIndex((row) => row.id === id);
  rows.value.forEach((item) => (item.state.isBeingEdited = false));
  rows.value[index].state.isBeingEdited = true;
  // Initiallize default values of each column
  config.columns.forEach((col) => {
    if (!col.name || col.isState) return;
    // If cell already has a value, don't overwrite it
    if (rows.value[index][col.key]) return;
    if (col.default !== null && col.default !== undefined) {
      rows.value[index][col.key] = col.default;
    } else {
      rows.value[index][col.key] = '';
    }
  });
  nextTick(() => {
    element.focus();
  });
}

// change focus to the next row
function goUp(id) {
  const index = rows.value.findIndex((row) => row.id === id);
  if (index === 0) return;
  rows.value[index].state.isBeingEdited = false;
  rows.value[index - 1].state.isBeingEdited = true;
  nextTick(() => {
    document.activeElement.focus();
  });
}

// change focus to the previous row
function goDown(id) {
  const index = rows.value.findIndex((row) => row.id === id);
  if (index === rows.value.length - 1) return;
  rows.value[index].state.isBeingEdited = false;
  rows.value[index + 1].state.isBeingEdited = true;
  nextTick(() => {
    document.activeElement.focus();
  });
}

function upsertRow(id) {
  const index = rows.value.findIndex((row) => row.id === id);
  const rowToUpsert = rows._rawValue[index];
  if (!validateItem(rowToUpsert, config.columns)) return;
  upsert(config.itemName, rowToUpsert);
  rows.value[index].state.isBeingEdited = false;
  document.activeElement.blur();
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
  dbDelete(config.dbTable, deleteRowList);
}

// <DEV> TODO
// TODO </DEV>
// >>>----------------------------------------------------------------------------------<<<
/*<DEV>
const tableActions = props.action.replaceAll(" ", "").split(",");
console.log(props.item);


function focusRow(index, itemsArray, element) {
  // TODO : Error detected ưhen delete a row
  rowBeingFocused.value = index;
  itemsArray.value.forEach((item) => (item.state.isFocused = false));
  itemsArray.value[index].state.isFocused = true;
}



</DEV>*/
</script>
<style></style>
