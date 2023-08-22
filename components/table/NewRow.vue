<template>
  <tr class="new-row" @keydown.enter="handleSubmit">
    <td></td>
    <!-- Select column -->
    <td></td>
    <!-- Index column -->
    <TableCell
      v-for="col in config.columns"
      :element="col"
      :item="states.newItem"
      :key="col.key"
      is-new-cell
      :table-id="props.tableId"
      :event="cellEvent"
      @input="handleInput"
    />
  </tr>
</template>
<script setup>
import { v4 } from 'uuid';
import { deepClone } from '~/static/utils';
import { upsert } from '~/static/db';
import { validateItem } from '~~/static/table';

const props = defineProps({
  suggestions: {
    type: Object,
    required: false,
    default: () => ref([]),
  },
  tableId: {
    type: String,
    required: true,
  },
});

const states = inject('states-' + props.tableId);
const rows = inject('rows-' + props.tableId);
const config = inject('config-' + props.tableId);

watch(
  () => states.newItem.name,
  () => {
    states.showSuggestion = true;
    states.selectedSuggestion = 0;
  },
);

const cellEvent = reactive({
  isReset: false,
});

class State {
  isBeingEdited = false;
  isSelected = false;
}

let id = ref(v4());

// >>>----------------------------------------------------------------------------------<<<
onMounted(() => {
  states.newItem = createNewItemObj();
});

function createNewItemObj() {
  const item = {};
  config.columns.forEach((col) => {
    if (!col.name || col.isState) return;
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
}
// >>>----------------------------------------------------------------------------------<<<
function handleInput(event) {
  states.showSuggestion = true;
}

function handleSubmit(event) {
  if (event.key === 'Enter' && !states.isSelectingSuggestion) createRow();
}

function createRow() {
  if (!validateItem(states.newItem, config.columns)) return;
  const item = deepClone(states.newItem);
  item.state = new State();
  rows.value.push(item);
  upsert(config.dbTable, states.newItem);
  id.value = v4();
  resetNewItem();
}
//
function resetNewItem() {
  config.columns.forEach((col) => {
    if (!col.name || col.isState) return;
    col.default !== null && col.default !== undefined
      ? (states.newItem[col.key] = col.default)
      : (states.newItem[col.key] = '');
  });
  cellEvent.isReset = !cellEvent.isReset;
}
</script>
<style></style>
