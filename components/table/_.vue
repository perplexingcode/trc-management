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

          <table :class="'table-' + itemName" class="draggable">
            <TableHead :table-id="tableId" />
            <TableBody :table-id="tableId" />
          </table>
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
  newItemTags: { default: '' },
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
  draggable: {
    isDragging: false,
    draggedItem: null,
    dropItem: null,
  },
  // <Dev>
  events: props.events,
  //
  log: '',
  // </Dev>
});
provide('state-' + tableId, state);

let rows = inject(props.rows, []);

let events = props.events ? props.events : reactive({});

provide('events-' + tableId, events);

onMounted(async () => {
  await nextTick();
  if (!(props.rows && typeof props.rows === 'string'))
    console.error('Table rows must be provided with provide-inject');
});
provide('rows-' + tableId, rows);

const table = ref(null);
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
