<!-- 
  * Give rows a default value
  * Table: listen for changes in rows and update
 -->

<template>
  <ClientOnly>
    <div v-if="props.dev" id="dev-panel" class="card bg-secondary">
      <h2 class="text-xl">Dev zone</h2>
      <Json :value="rows" title="Rows" title-size="md" />
      <p>Log: {{ states.log }}</p>
      <p>isEditing: {{ isEditing }}</p>
      <p>Selected rows: {{ props.selectedRows }}</p>
      <p>Selected suggestion: {{ selectedSuggestion }}</p>
      <p>Rows: {{ rows }}</p>
      <p>{{ newItem }}</p>
      <img src="~/assets/img/icon/add.png" />
    </div>
    <Suspense>
      <template #default>
        <div class="p-3 table-wrapper" :class="itemName">
          <div
            v-if="
              states.isShownSuggestions &&
              states.suggestionItems !== null &&
              props.showSuggestions &&
              states.isShownSuggestions
            "
            class="modal suggestions"
          >
            <div
              v-for="(item, index) in states.suggestionItems"
              :key="item[0]"
              class="suggestion flex row"
              @click="importSuggestion(index)"
              :class="{ selected: index === selectedSuggestion }"
            >
              <div
                v-for="col in item"
                :key="col[0]"
                class="suggestion-col flex"
                :class="col[0]"
              >
                <div class="name">{{ col[1] }}</div>
                <div
                  class="value"
                  :style="{
                    width: `${(col[3] < 20 ? col[3] : 20) * 11}` + 'px',
                  }"
                >
                  {{ col[2] }}
                </div>
              </div>
            </div>
          </div>
          <div class="table--action-panel flex items-center">
            <!-- <div>Search</div>
              <div>Sort</div> -->
            <btn-show-hide
              @click="states.isShownRows = !states.isShownRows"
              :is-default-show="states.isShownRows"
            />
            <img
              @click="downloadCsv"
              class="cursor-pointer btn-circle"
              src="https://img.icons8.com/flat-round/64/downloading-updates--v1.png"
              alt="download button"
              title="Download CSV"
            />
          </div>
          <table :class="'table-' + itemName">
            <TableHead :columns="columns" :table-id="tableId" />
            <TableBody :columns="columns" :rows="rows" :table-id="tableId" />
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
import { deepClone, removeState, deepCompare } from "~/static/utils";
import { getAll } from "~~/static/db";
import { v4 } from "uuid";
// >>>----------------------------------------------------------------------------------<<<
// <DEV> TODO
// #SETUP
//Table data
const props = defineProps({
  rows: {},
  itemName: {},
  columns: {},
  dev: { type: Boolean, default: false },
  addRow: {},
  newItem: {},
  events: {},
  allRows: {},
  isDefaultShowRows: { default: true },
  showSuggestions: {
    default: true,
  },
  tableId: { default: "" },
  action: { default: "delete,copyId" },
  weighted: { default: false },
  dbTable: { type: String, default: null },
});

// STATES
const states = reactive({
  isEditing: false,
  selectedRows: [],
  activeRow: null,
  selectedSuggestion: 0,
  suggestionItems: null,
  isShownRows: props.isDefaultShowRows,
  isShownSuggestions: true,
  isShownSelection: false,
  // <Dev>
  log: "",
  // </Dev>
});

// <Dev> temp
const tableId = props.tableId || v4();
provide(tableId, states);

// </Dev>
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
  if (props.dbTable) {
    rows.value = (await getAll(props.dbTable)).data._rawValue || [];
    initItemState(rows);
  }
});
//

function initItemState(rows) {
  for (let i = 0; i < rows.value.length; i++) {
    rows.value[i].state = reactive(new ItemState());
  }
}

const columns =
  typeof props.columns == "string" ? inject(props.columns, []) : props.columns;
const itemName = props.itemName;

//
onMounted(() => {
  // Feat: Handle isEditing
  // Save changes
  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      isEditing.value = false;
    }
  });

  // Alert save changes
  window.addEventListener("beforeunload", function (event) {
    if (isEditing.value) {
      event.preventDefault();
      event.returnValue = "";
      return "";
    }
  });
});
// TODO </DEV>
// >>>--------------------------------------------------------------<<<
/*<DEV>
const downloadCsv = () => {
  const data = removeState(deepClone(rows.value));
  // Extract all unique keys from the objects
  const allKeys = Array.from(new Set(data.flatMap((obj) => Object.keys(obj))));

  // Sort the keys alphabetically
  const sortedKeys = allKeys.sort();

  // Creating the CSV content
  const csvContent = [
    sortedKeys.join(","), // Header row
    ...data.map((obj) =>
      sortedKeys
        .map((key) => {
          if (typeof obj[key] === "string") {
            return obj[key].replaceAll(",", ";");
          }
          return obj[key];
        })
        .join(","),
    ), // Data rows
  ].join("\n");
  const encodedUri =
    "data:text/csv;charset=utf-8," + encodeURI(csvContent.replaceAll(`"`, ""));
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${itemName}.csv`);
  document.body.appendChild(link); // Required for FF
  link.click();
};
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

<style scoped>
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
