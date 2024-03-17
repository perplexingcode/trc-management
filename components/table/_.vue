<!-- 
  * Give rows a default value
  * Table: listen for changes in rows and update
 -->

<template>
  <ClientOnly>
    <Suspense>
      <template #default>
        <div class="p-3 table-wrapper" :class="itemName" :id="'t' + tableId">
          <div class="table--action-panel flex items-center">
            <!-- 
                TODO: Add search and sort
                <div>Search</div>
                <div>Sort</div> -->
            <TableBtnShowHide
              @click="state.showRows = !state.showRows"
              :is-default-show="state.showRows"
              class="btn-circle h-6 w-6"
            />
            <img
              @click="downloadCsv"
              class="cursor-pointer btn-circle w-6 h-6"
              src="https://img.icons8.com/flat-round/64/downloading-updates--v1.png"
              alt="download button"
              title="Download CSV"
            />
          </div>
          <TableSuggestion
            v-if="config.showSuggestion"
            :newItem="state.newItem"
            :table-id="tableId"
          />
          <TableEffectRerender ref="table">
            <table :class="'table-' + itemName" class="draggable">
              <TableHead :table-id="tableId" />
              <TableBody :table-id="tableId" />
            </table>
          </TableEffectRerender>
        </div>
      </template>
      <template #fallback>
        <div>Loading...</div>
      </template>
    </Suspense>
  </ClientOnly>
</template>

<script setup>
import { deepClone, removeState } from '~/static/utils';
import { getAll, upsert } from '~~/static/db';
import { v4 } from 'uuid';
// >>>----------------------------------------------------------------------------------<<<
// <DEV> TODO
// #SETUP
//Table data
const props = defineProps({
  rows: {},
  itemName: {},
  columns: {},
  dev: { type: Boolean, default: false },
  addRow: { type: Boolean, default: true },
  events: {},
  newItemTags: { type: String, default: '' },
  initShowRows: { type: Boolean, default: true },
  showSuggestion: {
    type: Boolean,
    default: true,
  },
  tableId: { default: '' },
  action: { default: 'delete,copyId' },
  weighted: { default: false },
  dbTable: { type: String, default: null },
  suggestionTable: { type: String, default: null },
  suggestionSize: {
    type: Number,
    default: 3000,
  },
  maxSuggestionNum: {
    type: Number,
    default: 5,
  },
  showIndex: {
    type: Boolean,
    default: true,
  },
  showSelection: {
    type: Boolean,
    default: true,
  },
  draggable: {
    type: Boolean,
    default: false,
  },
});

const tableId = props.tableId || v4();
let columns;
if (typeof props.columns === 'string') {
  columns = inject(props.columns);
} else {
  columns = props.columns;
}

const config = reactive({
  action: props.action.split(','),
  itemName: props.itemName,
  showIndex: props.showIndex,
  showSelection: props.showSelection,
  columns,
  dbTable: props.dbTable || props.itemName,
  addRow: props.addRow,
  showSuggestion: props.showSuggestion,
  suggestionTable: props.suggestionTable,
  suggestionSize: props.suggestionSize,
  maxSuggestionNum: props.maxSuggestionNum,
  draggable: props.draggable,
});

provide('config-' + tableId, config);

const data = reactive({
  suggestionPool: [],
});

provide('data-' + tableId, data);

// state
const state = reactive({
  isEditing: false,
  isDragging: false,
  selectedRows: [],
  activeRow: null,
  activeCell: null,
  selectedSuggestion: 0,
  showRows: props.initShowRows,
  showSuggestion: false,
  showSelection: false,
  newItem: {},
  newItemTags: props.newItemTags,
  // <Dev>
  events: props.events,
  //
  log: '',
  // </Dev>
});
provide('state-' + tableId, state);

const itemState = {
  isBeingEdited: false,
  isSelected: false,
};
let rows = inject(props.rows, []);

let events = props.events ? props.events : reactive({});

provide('events-' + tableId, events);

onMounted(async () => {
  await nextTick();
  if (!(props.rows && typeof props.rows === 'string'))
    console.error('Table rows must be provided with provide-inject');
  initItemState(rows);
  if (config.draggable) {
    for (let i = 0; i < rows.value.length; i++) {
      if (rows.value[i].index === undefined) rows.value[i].index = i;
    }
    // sort rows by index
    rows.value.sort((a, b) => a.index - b.index);
  }
});
provide('rows-' + tableId, rows);

//

function initItemState(rows) {
  // bug here
  for (let i = 0; i < rows.value.length; i++) {
    rows.value[i].state = reactive(deepClone(itemState));
  }
}
const table = ref(null);
const draggedItem = ref(null);
//
onMounted(async () => {
  // Feat: Handle isEditing
  // Save changes
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      state.isEditing = false;
    }
  });

  // Alert save changes
  window.addEventListener('beforeunload', function (event) {
    if (isEditing.value) {
      event.preventDefault();
      event.returnValue = '';
      return '';
    }
  });

  if (process.client) {
    await nextTick();

    const listItems = document.querySelectorAll('.draggable .row');

    for (let i = 0; i < listItems.length; i++) {
      const item = listItems[i];

      item.addEventListener('dragstart', function () {
        draggedItem.value = item;
        draggedItem.value.classList.add('dragging');
        setTimeout(() => {
          // item.style.display = 'none';
        }, 0);
      });

      item.addEventListener('dragend', function () {
        draggedItem.value.classList.remove('dragging');
        setTimeout(() => {
          // draggedItem.value.style.display = 'inline-block';
          draggedItem.value = null;
        }, 0);
      });

      item.addEventListener('dragover', function (e) {
        // style drop item
        const dropItem = this;
        if (draggedItem.value !== dropItem) {
          dropItem.classList.add('drop');
        }

        e.preventDefault();
      });

      item.addEventListener('dragenter', function (e) {
        e.preventDefault();
        this.style.backgroundColor = 'rgba(0,0,0,0.1)';
      });

      item.addEventListener('dragleave', function (e) {
        this.style.backgroundColor = '#f9f9f9';
      });

      item.addEventListener('drop', function (e) {
        this.style.backgroundColor = '#f9f9f9';
        // abort
        if (draggedItem.value === this) {
          return;
        }
        if (this !== draggedItem.value) {
          let allItems = document.querySelectorAll('.draggable .row');
          const draggedIndex = Array.from(allItems).indexOf(draggedItem.value);
          const droppedIndex = Array.from(allItems).indexOf(this);

          if (draggedIndex < droppedIndex) {
            // change rows
            const row = rows.value[draggedIndex];
            rows.value.splice(draggedIndex, 1);
            rows.value.splice(droppedIndex, 0, row);

            upsert(config.dbTable, row);
          } else {
            const row = rows.value[draggedIndex];
            rows.value.splice(draggedIndex, 1);
            rows.value.splice(droppedIndex, 0, row);
            upsert(config.dbTable, row);
          }

          // change index
          for (let i = 0; i < rows.value.length; i++) {
            rows.value[i].index = i;
            upsert(config.dbTable, rows.value[i]);
          }
        }
      });
    }
  }
});
</script>

<style>
.table-row.is-being-edited {
  background-color: #f5f5f5;
}

input.cat,
input.prj,
input.grp {
  width: 8rem;
}

table {
  border-collapse: collapse;
}

tr {
  height: 36px;
}
.cols-name th,
td {
  border: solid 1px #ccc2;
  text-align: center;
}
input.name {
  width: 16rem;
}

input.date {
  width: 6.5rem;
}

input.duration {
  width: 4rem;
  text-align: center;
}

input.cat,
input.prj,
input.grp {
  width: 8rem;
}
input.weight {
  width: 4rem;
}

table {
  border-collapse: collapse;
  padding: 1rem;
  outline: 1px solid #000;
}

tr {
  height: 36px;
}
.cols-name th,
td {
  border: solid 1px #ccc2;
  text-align: center;
}

ul#menu-desktop-guest {
  position: fixed;
  top: 5rem;
  left: 0rem;
  background: #eef2ff10;
}

/* Draggable */

.draggable .row {
  margin: 10px;
  padding: 5px;
  border: 1px solid #ccc;
  list-style: none;
  background-color: #f9f9f9;
}

.draggable .row.dragging {
  opacity: 0.5;
}

/* Style drop item */
.draggable .row.drop {
  background-color: #f9f9f9;
}

.grab {
  cursor: url('https://www.google.com/intl/en_ALL/mapfiles/openhand.cur'),
    all-scroll;
  cursor: -webkit-grab;
  cursor: -moz-grab;
  cursor: -o-grab;
  cursor: -ms-grab;
  cursor: grab;
}

.grab:active {
  cursor: url('https://www.google.com/intl/en_ALL/mapfiles/closedhand.cur'),
    all-scroll;
  cursor: -webkit-grabbing;
  cursor: -moz-grabbing;
  cursor: -o-grabbing;
  cursor: -ms-grabbing;
  cursor: grabbing;
}
</style>
