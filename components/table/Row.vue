<template>
  <!-- <div
    @dblclick="handleDblClick"
    v-if="!(state.activeRow === item.id && state.isBeingEdited)"
    class="absolute top-0 left-0 w-full h-full z-50 opacity-0"
  ></div> -->
  <tr
    class="row relative"
    @dblclick="handleDblClick"
    @keydown="handleKeyDown($event)"
    @click="state.activeRow = item.id"
    :class="{
      active: state?.activeRow === item.id,
      'is-being-edited': state?.activeRow === item.id && state.isBeingEdited,
    }"
    :id="'t' + item.id"
  >
    <TableCell
      v-if="config.showSelection"
      :element="selectColumn"
      :item="item"
      :table-id="props.tableId"
      @delete-row="deleteRows"
    />
    <td
      v-if="config.showIndex"
      class="index select-none"
      :title="JSON.stringify(item)"
    >
      <span>{{ props.index }}</span>
    </td>
    <TableCell
      v-for="col in config.columns"
      :element="col"
      :item="item"
      :key="col.key"
      :table-id="props.tableId"
      @upsert-row="handleUpsertRowEvent"
      @delete-row="handleDeleteRowEvent"
    />
    <TableCell
      :element="{ type: 'row-action' }"
      :item="item"
      :table-id="props.tableId"
      @delete-row="deleteRows"
    />
  </tr>
</template>

<script setup>
// >>>----------------------------------------------------------------------------------<<<
import { dbDelete, upsert } from '~/static/db.js';
import moment from 'moment';
import { v4 } from 'uuid';

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

const item = props.item;

const state = inject('state-' + props.tableId);
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
  if (item.state.isBeingEdited) return;
  state.activeRow = item.id;
  editRow(item.id, event.target);
}

function handleKeyDown(event) {
  if (!item.state.isBeingEdited) return;
  if (event.key === 'Enter' || event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    upsertRow(item.id);
  }

  /*
  // get parent element then get the second class
  const elementType =
    state.activeCell.classList[2] &&
    state.activeCell.classList[2].replace('cell-', '');
  if (item.state.isBeingEdited) {
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      upsertRow(item.id);
    }
    // Navigate between cells
    if (event.key === 'ArrowUp') {
      if ('text-area'.includes(elementType)) return;
      event.preventDefault();
      event.stopPropagation();
      upsertRow(item.id);
      goUp();
    }
    if (event.key === 'ArrowDown') {
      if ('text-area'.includes(elementType)) return;
      event.preventDefault();
      event.stopPropagation();
      upsertRow(item.id);
      goDown();
    }
    if (event.key === 'ArrowLeft') {
      if ('input,input-name,text-area'.includes(elementType)) return;
      event.preventDefault();
      event.stopPropagation();
      goLeft();
    }
    if (event.key === 'ArrowRight') {
      if ('input,input-name,text-area'.includes(elementType)) return;
      event.preventDefault();
      event.stopPropagation();
      goRight();
    }
  }
  */
}

function handleUpsertRowEvent({ id, table }) {
  upsertRow(id, table);
}
function handleDeleteRowEvent(id) {
  deleteRows(id);
}

// Event actions
function editRow(id, element) {
  state.isEditing = true;
  state.rowBeingEdited = id;

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
  const elementClass = state.activeCell.parentElement.classList[1];
  if (!elementClass.includes('cell-')) return;
  let index = rows.value.findIndex((row) => row.id === item.id);
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
    state.activeCell = element;
  });
}

// change focus to the previous row
function goDown() {
  const elementClass = state.activeCell.parentElement.classList[1];
  if (!elementClass.includes('cell-')) return;
  let index = rows.value.findIndex((row) => row.id === item.id);
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
    state.activeCell = element;
  });
}

function goLeft() {
  const elementClass = state.activeCell.parentElement.classList[1];
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
    '#t' + item.id + ' .cell-' + config.columns[index].key + ' > *',
  );
  // leftElement.setAttribute('tabindex', '999');
  leftElement.classList.add('active');
  leftElement.focus();
  state.activeCell = leftElement;
}

function goRight() {
  const elementClass = state.activeCell.parentElement.classList[1];
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
    '#t' + item.id + ' .cell-' + config.columns[index].key + ' > *',
  );
  rightElement.setAttribute('tabindex', '999');
  rightElement.classList.add('active');
  rightElement.focus();
  state.activeCell = rightElement;
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
console.log(item);


function focusRow(index, itemsArray, element) {
  // TODO : Error detected ưhen delete a row
  rowBeingFocused.value = index;
  itemsArray.value.forEach((item) => (item.state.isFocused = false));
  itemsArray.value[index].state.isFocused = true;
}



</DEV>*/
</script>
<style></style>
