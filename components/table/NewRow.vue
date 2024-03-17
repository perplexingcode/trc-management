<template>
  <tr class="new-row" @keydown.enter="handleSubmit">
    <!-- Select column -->
    <td v-if="config.showSelection"></td>
    <!-- Grab column -->
    <td v-if="config.draggable"></td>
    <!-- Index column -->
    <td v-if="config.showIndex">+</td>
    <TableCell
      v-for="col in config.columns"
      :element="col"
      :item="state.newItem"
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
import moment from 'moment';

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

const state = inject('state-' + props.tableId);
const rows = inject('rows-' + props.tableId);
const config = inject('config-' + props.tableId);

watch(
  () => state.newItem.name,
  () => {
    state.showSuggestion = true;
    state.selectedSuggestion = 0;
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
  state.newItem = createNewItemObj();
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
  state.showSuggestion = true;
}

function handleSubmit(event) {
  if (event.key === 'Enter' && !state.isSelectingSuggestion) createRow();
}

async function createRow() {
  if (!validateItem(state.newItem, config.columns)) return;
  const item = deepClone(state.newItem);
  await nextTick();
  item.createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  if (item.tags !== undefined) {
    const newItemTags =
      typeof state.newItemTags === 'string'
        ? state.newItemTags
        : state.newItemTags();
    item.tags = item.tags + (item.tags === '' ? '' : '; ') + newItemTags;
  }
  item.state = new State();
  if (config.draggable) item.index = rows.value.length;
  rows.value.push(item);
  upsert(config.dbTable, state.newItem);
  id.value = v4();
  resetNewItem();
}
//
function resetNewItem() {
  config.columns.forEach((col) => {
    if (!col.name || col.isState) return;
    col.default !== null && col.default !== undefined
      ? (state.newItem[col.key] = col.default)
      : (state.newItem[col.key] = '');
  });
  state.newItem.id = v4();
  cellEvent.isReset = !cellEvent.isReset;
}
</script>
<style></style>
