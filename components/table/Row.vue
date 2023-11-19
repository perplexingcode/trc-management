<template>
  <tr
    class="row"
    @dblclick="handleDblClick"
    @keydown="handleKeyDown($event)"
    @click="states.activeRow = props.item.id"
    :class="{
      active: states.activeRow === props.item.id,
      'is-being-edited':
        states.activeRow === props.item.id && states.isBeingEdited,
    }"
    :id="'t' + props.item.id"
  >
    <TableCell
      :element="selectColumn"
      :item="props.item"
      :table-id="props.tableId"
      @delete-row="deleteRows"
    />
    <td class="index" :title="JSON.stringify(props.item)">
      <span>{{ props.index }}</span>
    </td>
    <TableCell
      v-for="col in config.columns"
      :element="col"
      :item="props.item"
      :key="col.key"
      :table-id="props.tableId"
      @upsert-row="handleUpsertRowEvent"
      @delete-row="handleDeleteRowEvent"
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
import moment from 'moment';

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
  // get parent element then get the second class
  const elementType =
    states.activeCell.classList[2] &&
    states.activeCell.classList[2].replace('cell-', '');
  if (props.item.state.isBeingEdited) {
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      upsertRow(props.item.id);
    }
    // Navigate between cells
    if (event.key === 'ArrowUp') {
      if ('text-area'.includes(elementType)) return;
      event.preventDefault();
      event.stopPropagation();
      upsertRow(props.item.id);
      goUp();
    }
    if (event.key === 'ArrowDown') {
      if ('text-area'.includes(elementType)) return;
      event.preventDefault();
      event.stopPropagation();
      upsertRow(props.item.id);
      goDown();
    }
    if (event.key === 'ArrowLeft') {
      if ('input,input-name,text-area'.includes(elementType)) return;
      alert('cam mom', elementType, states.activeCell);
      console.log(elementType, states.activeCell);
      event.preventDefault();
      event.stopPropagation();
      goLeft();
    }
    if (event.key === 'ArrowRight') {
      if ('input,input-name,text-area'.includes(elementType)) return;
      alert('cam mom', elementType, states.activeCell);
      console.log(elementType, states.activeCell);
      event.preventDefault();
      event.stopPropagation();
      goRight();
    }
  }
}

function handleUpsertRowEvent({ id, table }) {
  upsertRow(id, table);
}
function handleDeleteRowEvent(id) {
  deleteRows(id);
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
function goUp() {
  const elementClass = states.activeCell.parentElement.classList[1];
  if (!elementClass.includes('cell-')) return;
  let index = rows.value.findIndex((row) => row.id === props.item.id);
  rows.value[index].state.isBeingEdited = false;
  if (index === 0) index = rows.value.length;
  rows.value[index - 1].state.isBeingEdited = true;
  const nextRowId = rows.value[index - 1].id;
  nextTick(() => {
    const element = document.querySelector(
      '#t' + nextRowId + ' .' + elementClass + ' > *',
    );
    element.classList.add('active');
    element.focus();
    states.activeCell = element;
  });
}

// change focus to the previous row
function goDown() {
  const elementClass = states.activeCell.parentElement.classList[1];
  if (!elementClass.includes('cell-')) return;
  let index = rows.value.findIndex((row) => row.id === props.item.id);
  rows.value[index].state.isBeingEdited = false;
  if (index + 1 === rows.value.length) index = -1;
  rows.value[index + 1].state.isBeingEdited = true;
  const nextRowId = rows.value[index + 1].id;
  nextTick(() => {
    const element = document.querySelector(
      '#t' + nextRowId + ' .' + elementClass + ' > *',
    );
    element.classList.add('active');
    element.focus();
    states.activeCell = element;
  });
}

function goLeft() {
  const elementClass = states.activeCell.parentElement.classList[1];
  if (!elementClass.includes('cell-')) return;
  let index = config.columns.findIndex(
    (col) => col.key === elementClass.replace('cell-', ''),
  );
  if (index == 0) return;
  while (true) {
    if (index == -1) return;
    index = index - 1;
    if (config.columns[index]?.hidden === true) continue;
    break;
  }
  const leftElement = document.querySelector(
    '#t' + props.item.id + ' .cell-' + config.columns[index].key + ' > *',
  );
  // leftElement.setAttribute('tabindex', '999');
  leftElement.classList.add('active');
  leftElement.focus();
  states.activeCell = leftElement;
}

function goRight() {
  const elementClass = states.activeCell.parentElement.classList[1];
  if (!elementClass.includes('cell-')) return;
  let index = config.columns.findIndex(
    (col) => col.key === elementClass.replace('cell-', ''),
  );
  if (index == config.columns.length - 1) return;
  while (true) {
    index = index + 1;
    if (config.columns[index]?.hidden === true) continue;
    break;
  }
  const rightElement = document.querySelector(
    '#t' + props.item.id + ' .cell-' + config.columns[index].key + ' > *',
  );
  rightElement.setAttribute('tabindex', '999');
  rightElement.classList.add('active');
  rightElement.focus();
  states.activeCell = rightElement;
}

function upsertRow(id, table) {
  const index = rows.value.findIndex((row) => row.id === id);
  const rowToUpsert = rows._rawValue?.[index] || rows.value[index];
  // if (!validateItem(rowToUpsert, config.columns)) return;
  rowToUpsert.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
  upsert(table || config.dbTable, rowToUpsert);
  rows.value[index].state.isBeingEdited = false;
  document.activeCell.blur();
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
