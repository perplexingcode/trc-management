<!-- 
  * Give rows a default value
  * Table: listen for changes in rows and update
 -->

<template>
  <ClientOnly>
    <Section v-if="props.dev" title="Dev zone" :isDefaultShow="false">
      <template #step-0>
        <div id="dev-panel" class="card bg-secondary">
          <Json :data="rows" title="Rows" title-size="md" />
          <Json :data="config" title="Config" title-size="md" />
          <Json :data="states" title="States" title-size="md" />
          <button @click="states.log = ''">Clear log</button>
        </div>
      </template>
    </Section>
    <Suspense>
      <template #default>
        <div class="p-3 table-wrapper" :class="itemName">
          <div class="table--action-panel flex items-center">
            <!-- 
              TODO: Add search and sort
              <div>Search</div>
              <div>Sort</div> -->
            <btn-show-hide
              @click="states.showRows = !states.showRows"
              :is-default-show="states.showRows"
            />
            <img
              @click="downloadCsv"
              class="cursor-pointer btn-circle"
              src="https://img.icons8.com/flat-round/64/downloading-updates--v1.png"
              alt="download button"
              title="Download CSV"
            />
          </div>
          <TableSuggestion
            v-if="config.showSuggestion"
            :newItem="states.newItem"
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
import { deepClone, removeState, deepCompare } from '~/static/utils';
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
  allRows: {},
  initShowRows: { type: Boolean, default: true },
  showSuggestion: {
    type: Boolean,
    default: true,
  },
  tableId: { default: '' },
  action: { default: 'delete,copyId' },
  weighted: { default: false },
  dbTable: { type: String, default: null },
  suggestionSize: {
    type: Number,
    default: 3000,
  },
  maxSuggestionNum: {
    type: Number,
    default: 5,
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
  columns,
  dbTable: props.dbTable || props.itemName,
  addRow: props.addRow,
  showSuggestion: props.showSuggestion,
  suggestionSize: props.suggestionSize,
  maxSuggestionNum: props.maxSuggestionNum,
});

provide('config-' + tableId, config);

const data = reactive({
  suggestionPool: [],
});

provide('data-' + tableId, data);

// STATES
const states = reactive({
  isEditing: false,
  selectedRows: [],
  activeRow: null,
  selectedSuggestion: 0,
  showRows: props.initShowRows,
  showSuggestion: false,
  showSelection: false,
  newItem: {},
  // <Dev>
  events: props.events,
  //
  log: '',
  // </Dev>
});
provide('states-' + tableId, states);

class ItemState {
  constructor() {
    this.isBeingEdited = false;
    this.isSelected = false;
  }
}
let rows = ref([]);
if (props.rows) {
  rows = inject(props.rows, []);
  initItemState(rows);
}
onMounted(async () => {
  await nextTick();
  if (!props.rows) {
    const table = props.dbTable || props.itemName;
    if (!table) {
      console.error('No table name provided');
      return;
    }
    rows.value = (await getAll(props.dbTable)).data._rawValue || [];
    initItemState(rows);
  }
});
provide('rows-' + tableId, rows);
//

function initItemState(rows) {
  for (let i = 0; i < rows.value.length; i++) {
    rows.value[i].state = reactive(new ItemState());
  }
}

//
onMounted(() => {
  // Feat: Handle isEditing
  // Save changes
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      states.isEditing = false;
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

const downloadCsv = () => {
  const data = removeState(deepClone(rows.value));
  // Extract all unique keys from the objects
  const allKeys = Array.from(new Set(data.flatMap((obj) => Object.keys(obj))));

  // Sort the keys alphabetically
  const sortedKeys = allKeys.sort();

  // Creating the CSV content
  const csvContent = [
    sortedKeys.join(','), // Header row
    ...data.map((obj) =>
      sortedKeys
        .map((key) => {
          if (typeof obj[key] === 'string') {
            return obj[key].replaceAll(',', ';');
          }
          return obj[key];
        })
        .join(','),
    ), // Data rows
  ].join('\n');
  const encodedUri =
    'data:text/csv;charset=utf-8,' + encodeURI(csvContent.replaceAll(`"`, ''));
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${props.itemName}.csv`);
  document.body.appendChild(link); // Required for FF
  link.click();
};
// TODO </DEV>
// >>>--------------------------------------------------------------<<<
/*<DEV>

</DEV>*/

/*<DEV> NEO
const emits = defineEmits(["upsert"]);
//
if (props.events) {
  watch(props.events.addRow, () => {
    createRow();
  });
}
//
if (props.weighted) {
  rows.value.sort((a, b) => b.relativeWeight - a.relativeWeight);
}
//
watch(states.isEditing, (newValue, oldValue) => {
  if (oldValue === true && newValue === false) {
    upsertRow(rowBeingEdited.value);
  }
});
let previous = null;
let current = null;

//Use computed rows to watch for changes
//TODO: Implement a undo redo array (first in last out size 10)
const computedRows = computed(() => {
  return deepClone(rows);
});
watch(
  computedRows,
  (newValue, oldValue) => {
    let _previous = deepClone(oldValue._rawValue);
    let _current = deepClone(newValue._rawValue);
    //Delete state
    for (let i = 0; i < _previous.length; i++) {
      delete _previous[i].state;
    }
    for (let i = 0; i < _current.length; i++) {
      delete _current[i].state;
    }
    if (deepCompare(_previous, _current)) return;
    console.log(deepCompare(_previous, _current));
    console.log("pre", _previous);
    console.log("cur", _current);
    previous = oldValue._rawValue;
    current = newValue._rawValue;
  },
  {
    deep: true,
  },
);
if (process.client) {
  window.addEventListener("keydown", (e) => {
    if (e.key === "F2") {
      console.log("previous", previous);
      rows.value = previous;
    }
  });
}
</DEV>*/
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
