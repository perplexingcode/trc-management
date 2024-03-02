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
          </div>
          <TableSuggestion
            v-if="config.showSuggestion"
            :newItem="state.newItem"
            :table-id="tableId"
          />
          <table :class="'table-' + itemName">
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
import { getAll } from '~~/static/db';
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
});

provide('config-' + tableId, config);

const data = reactive({
  suggestionPool: [],
});

provide('data-' + tableId, data);

// state
const state = reactive({
  isEditing: false,
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
});
provide('rows-' + tableId, rows);
//

function initItemState(rows) {
  // bug here
  for (let i = 0; i < rows.value.length; i++) {
    rows.value[i].state = reactive(deepClone(itemState));
  }
}

//
onMounted(() => {
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
</style>
