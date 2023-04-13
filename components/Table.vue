<template>
  <div v-if="props.dev === 'true'" id="dev-panel" class="card bg-secondary">
    <h2>Dev zone</h2>
    <p>Log: {{ log }}</p>
    <p>isEditing: {{ isEditing }}</p>
    <p>Selected rows: {{ selectedRows }}</p>
    <!-- <p>{{ rows }}</p> -->
    <p>{{ newItem }}</p>
    <img src="~/assets/img/icon/add.png" />
  </div>
  <Suspense>
    <template #default>
      <div class="p-3">
        <table :class="'table-' + itemName">
          <thead v-if="columns.length">
            <new-row v-if="props.addRow === 'true'" />
            <tr class="cols-name">
              <th v-for="col in columns" :key="col">
                {{ col.name }}
              </th>
            </tr>
          </thead>
          <table-body v-if="rows.length" />
        </table>
      </div>
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { request } from '~/static/request';
import { deepClone, dir, newId } from '~/static/utils';
import { upsert } from '~/static/db';

let log = ref('');

// #SETUP
//Table data
const props = defineProps([
  'rows',
  'itemName',
  'columns',
  'dev',
  'addRow',
  'newItem',
  'events',
]);

const rows = inject(props.rows, []);
for (let i = 0; i < rows.value.length; i++) {
  rows.value[i].state = reactive({
    isBeingEdited: false,
    isSelected: false,
  });
}

const columns = inject(props.columns, []);
const itemName = props.itemName;

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
class State {
  isBeingEdited = false;
  isSelected = false;
}

watch(isEditing, (newValue, oldValue) => {
  if (oldValue === true && newValue === false) {
    upsertRow(rowBeingEdited.value);
  }
});

// #LOGIC
const hTd = function (hClass, ...args) {
  return h('td', { class: ['cell', hClass] }, h(...args));
};

let id = ref(newId());
// Add new row
//If new item is passed as prop, use it
let newItem = props.newItem;
props.newItem
  ? (props.newItem.state = reactive({ isBeingEdited: null, isSelected: null }))
  : null;
//If not, create a new one
newItem ||= reactive(
  (() => {
    let item = {};
    columns.forEach((col) => {
      if (!col.name || col.noSave) return;
      if (col.default !== null && col.default !== undefined)
        item[col.key] = col.default;
      else item[col.key] = '';
    });
    item.state = new State();
    // item.id = v4().replaceAll('-', '').slice(0, 12);
    item.id = id;
    item.state.isBeingEdited = null;
    item.state.isSelected = null;
    return item;
  })()
);
if (props.events) {
  watch(props.events.addRow, () => {
    createRow();
  });
}
let newRow = computed(() =>
  h(
    'tr',
    {
      class: 'new-row',
      id: 'row-' + newItem.id,
      onKeyup: (e) => {
        if (e.key === 'Enter') {
          createRow();
        }
      },
    },
    columns.map((col) => {
      if (col.type === 'is-selected') {
        return hTd('cell-select', 'img', {
          src: dir('assets/img/icon/add.png'),
          class: 'add-row',
          onClick: (e) => {
            createRow();
          },
        });
      }
      if (col.key === 'action') {
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
      }
      return renderElement(col, newItem, true);
    })
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
            },
          ],
          onDblclick: (e) => {
            editRow(index, rows, e);
          },
        },
        columns.map((col) => {
          if (col.key === 'action') {
            return hTd('cell-action flex justify-center', 'img', {
              src: dir('assets/img/icon/minus.png'),
              title: 'Delete row',
              class: 'action-delete py-1',
              onClick: (e) => {
                deleteRows(item.id);
              },
            });
          }
          return renderElement(col, item, false);
        })
      );
    })
  )
);

function renderElement(element, item, isNewRow) {
  switch (element.type) {
    case 'is-selected':
      return hTd('cell-' + element.key, 'input', {
        type: 'checkbox',
        class: [
          element.key,
          {
            'd-none': item.state.isSelected === null,
          },
        ],
        checked: item.state.isSelected,
        onClick: (e) => {
          item.state.isSelected = e.target.checked;
        },
      });
    case 'input':
      return hTd('cell-' + element.key, 'input', {
        type: 'text',
        class: element.key,
        value: isNewRow ? element.default : item[element.key],
        required: element.attrs.required,
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
    case 'text-area':
      return hTd('cell-' + element.key, 'textarea', {
        value: isNewRow ? element.default : item[element.key],
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
              selected: option?.value || option === item[element.key],
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
        checked: isNewRow ? element.default : item[element.key],
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
  upsert('http://localhost:3141/db/upsert/management_' + itemName, newItem);
  id.value = newId();
}

function upsertRow(index) {
  const rowToUpsert = rows._rawValue[index];
  if (!validateColumns(rowToUpsert)) return;
  upsert('http://localhost:3141/upsert/management_' + itemName, rowToUpsert);
  rows.value[index].state.isBeingEdited = false;
  document.activeElement.blur();
}
const selectedRows = computed(() => {
  let selectedRows = [];
  rows._rawValue.forEach((row) => {
    if (row.state.isSelected) {
      selectedRows.push(row.id);
    }
  });
  return selectedRows;
});
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
  request(
    'http://localhost:3141/db/delete/management_' + itemName,
    'post',
    deleteRowList
  );
}
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
</style>
