<template>
  <ClientOnly>
    <div v-if="props.dev" id="dev-panel" class="card bg-secondary">
      <h2>Dev zone</h2>
      <p>Log: {{ log }}</p>
      <p>isEditing: {{ isEditing }}</p>
      <p>Selected rows: {{ selectedRows }}</p>
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
              newItem.name &&
              suggestionItems !== null &&
              props.showSuggestions &&
              isShownSuggestions
            "
            class="modal suggestions"
          >
            <div
              v-for="(item, index) in suggestionItems"
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
              @click="showRows = !showRows"
              :is-default-show="showRows"
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
            <thead v-if="columns.length">
              <new-row
                v-if="props.addRow === 'true'"
                @keydown="newRowKeydown($event)"
              />
              <tr class="cols-name">
                <th v-for="col in columns" :key="col">
                  {{ col.name }}
                </th>
              </tr>
            </thead>
            <table-body v-if="rows.length" v-show="showRows" />
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
import { request } from '~/static/request';
import { deepClone, removeState, dir, deepCompare } from '~/static/utils';
import { v4 } from 'uuid';
import { upsert } from '~/static/db';
import { durationValidate } from '~~/static/time';

// CONSTANTS
const backendUrl = useRuntimeConfig().backendUrl;
const MAX_SUGGESTION_ROW = 5;

// STATES
const isShownSuggestions = ref(true);

let log = ref('');

// #SETUP
//Table data
const props = defineProps({
  rows: {},
  itemName: {},
  columns: {},
  dev: { default: false },
  addRow: {},
  newItem: {},
  events: {},
  allRows: {},
  isDefaultShowRows: { default: true },
  showSuggestions: {
    default: true,
  },
});

// DEV
const emits = defineEmits(['upsert']);

const rows = inject(props.rows, []);
for (let i = 0; i < rows.value.length; i++) {
  rows.value[i].state = reactive({
    isBeingEdited: false,
    isSelected: false,
  });
}

const downloadCsv = () => {
  const data = removeState(deepClone(rows.value));
  console.log(data);
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
          console.log(obj[key]);
          if (typeof obj[key] === 'string') {
            return obj[key].replaceAll(',', ';');
          }
          return obj[key];
        })
        .join(',')
    ), // Data rows
  ].join('\n');
  const encodedUri =
    'data:text/csv;charset=utf-8,' + encodeURI(csvContent.replaceAll(`"`, ''));
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${itemName}.csv`);
  console.log(csvContent);
  document.body.appendChild(link); // Required for FF
  link.click();
};

const showRows = ref(props.isDefaultShowRows);

const columns = inject(props.columns, []);
const itemName = props.itemName;

// << DEVELOPMENT

if (itemName == 'queued-move') {
  for (let i = 0; i < rows.value.length; i++) {
    rows.value[i].weight = +rows.value[i].weight;
    switch (rows.value[i].priority) {
      case '1-Urgent':
        rows.value[i].relativeWeight = rows.value[i].weight + 999;
        break;
      case '2-Necessary':
        rows.value[i].relativeWeight = rows.value[i].weight + 500;
        break;
      case '3-Important':
        rows.value[i].relativeWeight = rows.value[i].weight + 250;
        break;
      case '4-Recommended':
        rows.value[i].relativeWeight = rows.value[i].weight + 100;
        break;
      case '5-Optional':
        rows.value[i].relativeWeight = rows.value[i].weight;
        break;
      default:
        rows.value[i].relativeWeight = rows.value[i].weight;
        break;
    }
    // console.log(rows.value[i].name, rows.value[i].relativeWeight);
  }
  rows.value.sort((a, b) => b.relativeWeight - a.relativeWeight);
}

// DEV >>

onMounted(() => {
  // Save changes
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      isEditing.value = false;
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

// #DATA
const isEditing = ref(false);
let rowBeingEdited = ref(null);
let rowBeingFocused = ref(null);
class State {
  isBeingEdited = false;
  isSelected = false;
}

watch(isEditing, (newValue, oldValue) => {
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
    console.log('pre', _previous);
    console.log('cur', _current);
    previous = oldValue._rawValue;
    current = newValue._rawValue;
  },
  {
    deep: true,
  }
);
if (process.client) {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F2') {
      console.log('previous', previous);
      rows.value = previous;
    }
  });
}

// #LOGIC
const hTd = function (hClass, ...args) {
  return h('td', { class: ['cell', hClass] }, h(...args));
};

let id = ref(v4());
// Add new row
//If new item is passed as prop, use it
let newItem = props.newItem;
props.newItem
  ? (props.newItem.state = reactive({ isBeingEdited: null, isSelected: null }))
  : null;
//If not, create a new one
const createNewItemObj = () => {
  const item = {};
  columns.forEach((col) => {
    if (!col.name || col.noSave) return;
    col.default !== null && col.default !== undefined
      ? (item[col.key] = col.default)
      : (item[col.key] = '');
  });
  item.state = new State();
  item.id = id;
  item.state.isBeingEdited = null;
  item.state.isSelected = null;
  item.state.isFocused = null;
  return item;
};

const resetNewItem = () => {
  columns.forEach((col) => {
    if (!col.name || col.noSave) return;
    col.default !== null && col.default !== undefined
      ? (newItem[col.key] = col.default)
      : (newItem[col.key] = '');
  });
};

newItem ||= reactive(createNewItemObj());
const allRows = inject(props.allRows || props.rows);
const suggestionItems = computed(() => {
  if (!newItem.name) return null;
  //Filter all rows that resemble new item input
  const allSuggestions = allRows.value.filter((row) => {
    let match = false;
    for (let key in row) {
      if (row.name.toLowerCase().startsWith(newItem.name.toLowerCase())) {
        match = true;
        break;
      }
    }
    return match;
  });

  if (allSuggestions.length === 0) return null;
  //Remove duplicates
  const uniqueSuggestions = allSuggestions.filter(
    (item, index, self) => index === self.findIndex((t) => t.name === item.name)
  );
  //Return only the first several items
  let suggestions = uniqueSuggestions.slice(0, MAX_SUGGESTION_ROW);

  const columnKeys = columns.map((col) => col.key);
  suggestions = suggestions.map((suggestion) => {
    return (
      Object.entries(suggestion)
        .sort((a, b) => {
          return columnKeys.indexOf(a[0]) - columnKeys.indexOf(b[0]);
        })
        // Create item containing key for classes, name and value for display
        .map(([key, value]) => {
          //Ignore columns that don't have a name
          const name = columns.find((col) => col.key === key)?.name;
          if (!name) return null;

          //   columns.find((col) => col.key === key)?.attrs?.suggestion
          // );
          //Ignore columns that don't need suggestions
          const isSuggestion = columns.find((col) => col.key === key)?.attrs
            ?.suggestion;
          if (isSuggestion === false) return null;
          return [key, name, value];
        })
        .filter((value) => {
          return value !== null;
        })
    );
  });
  const maxLengths = [];
  for (let i = 0; i < suggestions[0].length; i++) {
    maxLengths[i] = 0;
    for (let n = 0; n < suggestions.length; n++) {
      try {
        suggestions[n][i][2].length > maxLengths[i]
          ? (maxLengths[i] = suggestions[n][i][2].length)
          : null;
      } catch (e) {
        console.error(e);
      }
    }
  }
  suggestions.forEach((suggestion) => {
    for (let i = 0; i < suggestions[0].length; i++) {
      suggestion[i] ? (suggestion[i][3] = maxLengths[i]) : null;
    }
  });

  return suggestions;
});

const selectedSuggestion = ref(null);
watch(suggestionItems, () => {
  selectedSuggestion.value = null;
});
function newRowKeydown(e) {
  if (suggestionItems.value === null) return;
  let selected = selectedSuggestion.value;
  const max = suggestionItems.value.length - 1;
  //up
  if (e.keyCode === 38) {
    if (selected === null || selected === 0) selectedSuggestion.value = max;
    if (selected > 0) selectedSuggestion.value--;
    e.preventDefault();
  }
  //down
  if (e.keyCode === 40) {
    if (selected === null || selected === max) selectedSuggestion.value = 0;
    if (selected < max) selectedSuggestion.value++;
    e.preventDefault();
  }
}

function importSuggestion(index) {
  const suggestion = suggestionItems.value[index];
  for (let i = 0; i < suggestion.length; i++) {
    const key = suggestion[i][0];
    const value = suggestion[i][2];
    newItem[key] = value;
  }
  selectedSuggestion.value = null;
}

if (props.events) {
  watch(props.events.addRow, () => {
    createRow();
  });
}

const nonTextKeys = [
  8, // backspace
  9, // tab
  13, // enter
  16, // shift
  17, // ctrl
  18, // alt
  19, // pause/break
  20, // caps lock
  27, // escape
  32, // space
  33, // page up
  34, // page down
  35, // end
  36, // home
  37, // left arrow
  38, // up arrow
  39, // right arrow
  40, // down arrow
  45, // insert
  46, // delete
  91, // left window key
  92, // right window key
  93, // select key
  112, // f1
  113, // f2
  114, // f3
  115, // f4
  116, // f5
  117, // f6
  118, // f7
  119, // f8
  120, // f9
  121, // f10
  122, // f11
  123, // f12
  144, // num lock
  145, // scroll lock
  224, // meta key
];

const showIsSelected = ref(false);
let newRow = computed(() =>
  h(
    'tr',
    {
      class: 'new-row',
      id: 'row-' + newItem.id,
      onKeyup: (e) => {
        if (e.key === 'Enter') {
          if (selectedSuggestion.value) {
            importSuggestion(selectedSuggestion.value);
            return;
          }
          createRow();
        }
      },
    },
    columns
      .map((col) => {
        switch (col.type) {
          case 'is-selected':
            return h(
              'td',
              { class: 'cell-select' },
              h('img', {
                src: dir('assets/img/icon/add.png'),
                class: [
                  'add-row',
                  {
                    hidden: !(selectedRows.value[0] || showIsSelected.value),
                  },
                ],
                onClick: (e) => {
                  importSuggestion(selectedSuggestion.value);
                },
                onHover: (e) => {
                  showIsSelected.value = true;
                },
                onBlur: (e) => {
                  showIsSelected.value = false;
                },
              })
            );
          case 'action':
            return hTd(
              'cell-action',
              'button',
              {
                class: 'add-row',
                onClick: (e) => {
                  createRow();
                },
              },
              'Create row'
            );

          case 'input':
            return hTd(
              'cell' + col.key,
              'input',
              {
                type: col.attrs.type,
                class: col.key,
                value: newItem[col.key],
                required: col.attrs.required,
                disabled: col.disabled,
                onInput: (e) => {
                  if (col.key === 'duration')
                    e.target.value = durationValidate(e.target.value);
                  newItem[col.key] = e.target.value;
                },
              },
              col.attrs.placeholder
            );
          case 'input-name':
            let autofill = '';
            const suggestions = allRows.value.map((m) => m.name);
            watch(
              () => newItem[col.key],
              (input) => {
                if (!input) {
                  autofill = '';
                  return;
                }
                const match = suggestions.find((suggestion) =>
                  suggestion.toLowerCase().startsWith(input.toLowerCase())
                );
                match
                  ? (autofill = match.slice(input.length))
                  : (autofill = '');
              },
              { immediate: true }
            );
            return h('td', { class: ['cell' + col.key, 'input-name'] }, [
              h('input', {
                type: 'text',
                class: col.key,
                value: newItem[col.key],
                required: col.attrs.required,
                disabled: col.disabled,
                onKeydown: (e) => {
                  if (e.keyCode === 39) {
                    newItem[col.key] = newItem[col.key] + autofill;
                  }
                  if (
                    e.keyCode === 9 &&
                    autofill &&
                    newItem[col.key] !== autofill
                  ) {
                    newItem[col.key] = newItem[col.key] + autofill;
                  }
                },
                onInput: (e) => {
                  newItem[col.key] = e.target.value;
                  isShownSuggestions.value = true;
                },
                onFocus: (e) => {
                  e.target.setSelectionRange(
                    e.target.value.length,
                    e.target.value.length
                  );
                },
                onBlur: (e) => {
                  setTimeout(() => {
                    isShownSuggestions.value = false;
                  }, 120);
                },
              }),
              h('div', { class: 'suggestion' }, [
                h('em', newItem[col.key]),
                autofill,
              ]),
            ]);
        }
        return renderElement(col, newItem, true);
      })
      .concat(
        h('td', { class: 'cell-action' }, [
          h('img', {
            // TODO: Update src logic
            src: 'https://management-img.s3.ap-southeast-1.amazonaws.com/minus.png',
            title: 'Reset new row',
            class: 'action-reset-new-row cursor-pointer',
            onClick: (e) => {
              resetNewItem();
            },
          }),
        ])
      )
  )
);

let tableBody = computed(() =>
  h(
    'tbody',
    rows.value.map((item, index) => {
      return h(
        'tr',
        {
          id: 'row-' + item.id,
          class: [
            'table-row',
            {
              'is-selected': item.state.isSelected,
              'is-being-edited': item.state.isBeingEdited,
              'is-focused': item.state.isFocused,
            },
          ],
          onDblclick: (e) => {
            editRow(index, rows, e);
          },
          onClick: (e) => {
            focusRow(index, rows, e);
          },
        },
        columns
          .map((col) => {
            // Insert exception render here
            return renderElement(col, item, false);
          })
          // Insert at the end of the row
          .concat(
            h('td', { class: 'cell-action' }, [
              h('img', {
                // TODO: Update src logic
                src: 'https://management-img.s3.ap-southeast-1.amazonaws.com/minus.png',
                title: 'Delete row',
                class: 'action-delete cursor-pointer',
                onClick: (e) => {
                  deleteRows(item.id);
                },
              }),
            ])
          )
      );
    })
  )
);

function renderElement(element, item, isNewRow) {
  switch (element.type) {
    case 'is-selected':
      return h(
        'td',
        {
          class: 'cell-' + element.key,
          onMouseover: (e) => {
            showIsSelected.value = true;
          },
          onMouseout: (e) => {
            showIsSelected.value = false;
          },
        },
        h('input', {
          type: 'checkbox',
          class: [
            element.key,
            {
              hidden:
                item.state.isSelected === null ||
                !(selectedRows.value[0] || showIsSelected.value),
            },
          ],
          checked: item.state.isSelected,
          onClick: (e) => {
            item.state.isSelected = e.target.checked;
          },
        })
      );
    case 'input':
      return hTd('cell-' + element.key, 'input', {
        type: element.attrs.type,
        class: element.key,
        value: item[element.key] ? item[element.key] : element.default,
        required: element.attrs.required,
        disabled:
          element.disabled ||
          (!(item.state.isBeingEdited && isEditing.value) && !isNewRow),
        onInput: (e) => {
          if (element.key == 'duration') {
            e.target.value = durationValidate(e.target.value);
          }
          item[element.key] = e.target.value;
        },
        onFocus: (e) => {
          e.target.setSelectionRange(
            e.target.value.length,
            e.target.value.length
          );
        },
      });
    case 'input-name':
      const innerText = item[element.key] ? item[element.key] : element.default;
      return hTd('cell-' + element.key, 'input', {
        type: 'text',
        class: element.key,
        value: innerText,
        required: element.attrs.required,
        title: innerText?.length > 20 ? innerText : null,
        disabled:
          element.disabled ||
          (!(item.state.isBeingEdited && isEditing.value) && !isNewRow),
        onInput: (e) => {
          item[element.key] = e.target.value;
        },
        // onKeydown(e) {

        //   if (nonTextKeys.includes(e.keyCode)) {
        //     editRow(
        //       rows.value.findIndex((i) => (i.id = item.id)),
        //       rows,
        //       e
        //     );
        //     e.target.focus();
        //   }
        // },
        onClick: (e) => {
          e.target.removeAttribute('disabled');
          e.target.focus();
          e.target.setSelectionRange(
            e.target.value.length,
            e.target.value.length
          );
        },
        onFocus: (e) => {
          e.target.setSelectionRange(
            e.target.value.length,
            e.target.value.length
          );
        },
      });
    case 'text-area':
      return hTd('cell-' + element.key, 'textarea', {
        value: item[element.key] ? item[element.key] : element.default,
        class: element.key,
        disabled:
          element.disabled ||
          (!(item.state.isBeingEdited && isEditing.value) && !isNewRow),
        onInput: (e) => {
          item[element.key] = e.target.value;
        },
        onFocus: (e) => {
          e.target.setSelectionRange(
            e.target.value.length,
            e.target.value.length
          );
        },
      });
    case 'select':
      return hTd(
        'cell-' + element.key,
        'select',
        {
          class: element.key,
          disabled:
            element.disabled ||
            (!(item.state.isBeingEdited && isEditing.value) && !isNewRow),
          onInput: (e) => {
            item[element.key] = e.target.value;
          },
        },
        ['', ...element.options].map((option) => {
          return h(
            'option',
            {
              value: option?.value || option,
              selected:
                option === item[element.key] || option === element.default,
              disabled: option === '',
            },
            option?.name || option
          );
        })
      );
    case 'checkbox':
      return hTd('cell-' + element.key, 'input', {
        type: 'checkbox',
        class: element.key,
        checked: item[element.key] ? item[element.key] : element.default,
        readonly:
          element.disabled ||
          (!(item.state.isBeingEdited && isEditing.value) && !isNewRow),
        onClick: (e) => {
          if (e.target.readOnly) {
            e.target.checked = !e.target.checked;
            return;
          }
          item[element.key] = e.target.checked;
        },
      });
    case 'p':
      return h('td', { class: element.key }, item[element.key]);
    default:
      return h('td', 'Error');
  }
}

// #ACTIONS
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

function validateColumns(items) {
  let validated = true;
  const requiredFields = [];
  for (let col in columns) {
    if (columns[col]?.attrs?.required && !items[columns[col].key]) {
      validated = false;
      requiredFields.push(columns[col].key);
    }
  }
  if (!validated) {
    alert('Please fill in the required fields: ' + requiredFields.join(', '));
    return false;
  }
  return true;
}

function createRow() {
  if (!validateColumns(newItem)) return;
  const item = deepClone(newItem);
  item.state = new State();
  rows.value.push(item);
  upsert('management_' + itemName, newItem);
  emits('rowUpsert', props.itemName);
  id.value = v4();
  isShownSuggestions.value = false;
  resetNewItem();
}

function upsertRow(index) {
  const rowToUpsert = rows._rawValue[index];
  if (!validateColumns(rowToUpsert)) return;
  console.log(rowToUpsert);
  upsert('management_' + itemName, rowToUpsert);
  rows.value[index].state.isBeingEdited = false;
  document.activeElement.blur();
  emits('rowUpsert', props.itemName);
}

const selectedRows = ref([]);
watch(
  rows,
  () => {
    let _selectedRows = [];
    rows.value.forEach((row) => {
      if (row.state.isSelected) {
        _selectedRows.push(row.id);
      }
    });
    selectedRows.value = _selectedRows;
  },
  { deep: true }
);
// const selectedRows = computed(() => {
//   let selectedRows = ref([]);

//   rows._rawValue.forEach((row) => {
//     if (row.state.isSelected) {
//       selectedRows.value.push(row.id);
//     }
//   });
//   return selectedRows;
// });

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
  request(backendUrl + '/delete/management_' + itemName, 'post', deleteRowList);
}
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
