<template>
  <div id="dev-panel" class="card bg-secondary">
    <h2>Dev zone</h2>
    <p>isEditing: {{ isEditing }}</p>
    <!-- <p>{{ selectedrows }}</p> -->
    <p>
      {{
        rows.map((t) => {
          return t.state.isBeingEdited;
        })
      }}
    </p>
  </div>
  <Suspense>
    <template #default>
      <div>
        <table>
          <thead>
            <tr>
              <th v-for="col in columns" :key="col">
                {{ col.name }}
              </th>
            </tr>
          </thead>
          <!-- <app-tbody /> -->
          <dan-choi />
        </table>
      </div>
    </template>
  </Suspense>
</template>

<script setup>
import { request } from '~/static/request';
const props = defineProps(['rows', 'itemName', 'columns']);
const rows = inject(props.rows, []);
const columns = inject(props.columns, []);
const itemName = inject(props.itemName, '');

function renderElement(element, item) {
  switch (element.type) {
    case 'is-selected':
      return h(
        'td',
        h('input', {
          type: 'checkbox',
          checked: item.state.isSelected,
          onClick: (e) => {
            item.state.isSelected = e.target.checked;
          },
        })
      );
    case 'input':
      return h(
        'td',
        h('input', {
          type: 'text',
          value: item[element.key],
          disabled:
            element.disabled || !(item.state.isBeingEdited && isEditing.value),
          onInput: (e) => {
            item[element.key] = e.target.value;
          },
          onFocus: (e) => {
            e.target.setSelectionRange(
              e.target.value.length,
              e.target.value.length
            );
          },
        })
      );
    case 'text-area':
      return h(
        'td',
        h('textarea', {
          value: item[element.key],
          disabled:
            element.disabled || !(item.state.isBeingEdited && isEditing.value),
          onInput: (e) => {
            item[element.key] = e.target.value;
          },
          onFocus: (e) => {
            e.target.setSelectionRange(
              e.target.value.length,
              e.target.value.length
            );
          },
        })
      );
    case 'checkbox':
      return h(
        'td',
        h('input', {
          type: 'checkbox',
          checked: item[element.key],
          disabled:
            element.disabled || !(item.state.isBeingEdited && isEditing.value),
          onInput: (e) => {
            item[element.key] = e.target.checked;
          },
        })
      );
    case 'p':
      return h('td', item[element.key]);
    default:
      return h('td', 'Error');
  }
}

const isEditing = ref(false);
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      isEditing.value = false;
    }
  });
});

let rowBeingEdited = ref(null);
const editRow = (index, itemsArray, element) => {
  rowBeingEdited.value = index;
  isEditing.value = true;
  itemsArray.value.forEach((item) => (item.state.isBeingEdited = false));
  itemsArray.value[index].state.isBeingEdited = true;
  nextTick(() => {
    element.target.focus();
  });
};

let danChoi = computed(() =>
  h(
    'tbody',
    rows.value.map((item, index) => {
      return h(
        'tr',
        {
          onDblclick: (e) => {
            editRow(index, rows, e);
          },
        },
        columns.map((col) => renderElement(col, item))
      );
    })
  )
);

watch(isEditing, (newValue, oldValue) => {
  if (oldValue === true && newValue === false) {
    updateRow(rowBeingEdited.value);
  }
});

// ACTIONS
function updateRow(index) {
  let data = rows._rawValue[index];
  alert('dan choi day roi ' + rowBeingEdited.value);
  request(
    'http://localhost:3141/' + 'task' + '/update',
    'post',
    JSON.stringify(data)
  );
  document.activeElement.blur();
}

async function deleteRows() {
  let deleteRowList = [];
  for (let i = 0; i < rows.value.length; i++) {
    if (rows.value[i].state.isSelected) {
      deleteRowList.push(rows.value[i].id);
      rows.value.splice(i, 1);
      i--;
    }
  }
  request('http://localhost:3141/' + 'task' + '/delete', 'post', deleteRowList);
}
</script>

<style></style>
