<template>
  <!-- <div
    @dblclick="handleDblClick"
    v-if="!(state.activeRow === item.id && state.isBeingEdited)"
    class="absolute top-0 left-0 w-full h-full z-50 opacity-0"
  ></div> -->

  <tr
    class="row relative"
    ref="row"
    @dblclick="handleDblClick"
    @keydown="handleKeyDown($event)"
    @click="state.activeRow = item.id"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragover="handleDragOver"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    :class="{
      active: state?.activeRow === item.id,
      'is-being-edited': state?.activeRow === item.id && state.isBeingEdited,
      dragging: item.state?.isDragging,
      drop: state.draggable.dropRow === item,
      'opacity-10': _state.dragEnter,
      'bg-gray-300': !_state.dragEnter,
    }"
    :id="'t' + item.id"
    :draggable="state.draggable.isDragging"
  >
    <TableCell
      v-if="config.showSelection"
      :element="selectColumn"
      :item="item"
      :table-id="props.tableId"
      @delete-row="deleteRows"
    />
    <td
      v-if="config.draggable"
      @mouseenter="state.draggable.isDragging = true"
      @mouseleave="state.draggable.isDragging = false"
      class="grab select-none"
    >
      <TableSvgGrab class="grab-icon w-4 h-4" />
    </td>
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
import { deepClone } from '~~/static/utils';

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

const _state = reactive({
  dragEnter: false,
});

const itemState = {
  isBeingEdited: false,
  isSelected: false,
};
onMounted(() => {
  if (!props.item.state) {
    const index = rows.value.findIndex((row) => row.id === item.id);
    rows.value[index].state = deepClone(itemState);
  }
});

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

const row = ref(null);

function handleDragStart(event) {
  state.draggable.draggedRow = item;
  item.state.isDragging = true;
}

function handleDragEnd(event) {
  item.state.isDragging = false;
  state.draggable.draggedRow = null;
}

function handleDragOver(event) {
  if (state.draggable.draggedRow === item) return;
  state.draggable.dropRow = item;
  event.preventDefault();
}

function handleDragEnter(event) {
  _state.dragEnter = true;
}

function handleDragLeave(event) {
  _state.dragEnter = false;
}

function handleDrop(event) {
  _state.dragEnter = false;
  const draggedRow = state.draggable.draggedRow;
  const dropRow = state.draggable.dropRow;
  const draggedRowIndex = rows.value.findIndex(
    (row) => row.id === draggedRow.id,
  );
  const dropRowIndex = rows.value.findIndex((row) => row.id === dropRow.id);
  rows.value.splice(draggedRowIndex, 1);
  rows.value.splice(dropRowIndex, 0, draggedRow);
  state.draggable.dropRow = null;
  state.draggable.draggedRow = null;
  // change index
  for (let i = 0; i < rows.value.length; i++) {
    rows.value[i].index = i;
    upsert(config.dbTable, rows.value[i]);
  }
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
