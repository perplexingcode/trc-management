<!-- 
  * Give rows a default value
 -->

<template>
  <div v-if="showSuggestion" class="modal suggestions">
    <div
      v-for="(item, index) in filteredSuggestions"
      :key="item[0]"
      class="suggestion flex row cursor-pointer"
      @click="importSuggestion(index)"
      :class="{ selected: index === states.selectedSuggestion }"
    >
      <div
        v-for="(col, key) in item"
        :key="key"
        class="suggestion-col flex"
        :class="key"
      >
        <div class="name px-[3px] mx-1 bg-[#3333]">{{ key }}</div>
        <div
          class="value"
          :style="{
            width: `${(colWidths[key] < 20 ? colWidths[key] : 20) * 10}` + 'px',
          }"
        >
          {{ col }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { sample } from '~~/static/db';
import { deepClone } from '~~/static/utils';
const props = defineProps({
  tableId: {
    type: String,
  },
  newItem: {
    required: true,
  },
});

// #SETUP
const config = inject('config-' + props.tableId);
const data = inject('data-' + props.tableId);
const states = inject('states-' + props.tableId);

const suggestions = ref([]);
const colWidths = reactive({});

const filteredSuggestions = computed(() => {
  // filter by name from states.newItem.name
  if (!suggestions.value.length) return [];
  return truncateSuggestion(
    suggestions.value.filter((item) =>
      item.name.toLowerCase().includes(states.newItem.name.toLowerCase()),
    ),
  );
});
const showSuggestion = computed(() => {
  return (
    props.newItem.name &&
    filteredSuggestions.value.length &&
    states.showSuggestion
  );
});
watch(showSuggestion, async () => {
  if (showSuggestion.value) {
    window.addEventListener('keydown', handleKeyDown);
  } else {
    window.removeEventListener('keydown', handleKeyDown);
  }
});
onMounted(async () => {
  if (!data.suggestionPool.length && config.dbTable) {
    await nextTick();
    data.suggestionPool = (
      await sample(config.dbTable, config.suggestionSize)
    ).data._rawValue;
    suggestions.value = data.suggestionPool;
  } else {
    const rows = inject('rows-' + props.tableId, []);
    await nextTick();
    suggestions.value = deepClone(rows);
  }
  filterAttr();
  removeDuplicate();
  setAttrWidth();
  sortAttr();
});

// >>>----------------------------------------------------------------------------------<<<
// FUNCTION DECLARATIONS
async function handleKeyDown(e) {
  if (
    e.key === 'ArrowDown' &&
    states.selectedSuggestion < filteredSuggestions.value.length - 1
  ) {
    states.isSelectingSuggestion = true;
    states.selectedSuggestion++;
  }
  if (e.key === 'ArrowUp' && states.selectedSuggestion > 0) {
    states.isSelectingSuggestion = true;
    states.selectedSuggestion--;
  }
  if (e.key === 'Enter') {
    importSuggestion();
    e.preventDefault();
    e.stopPropagation();
    await nextTick();
    states.isSelectingSuggestion = false;
    states.showSuggestion = false;
  }
}
//
function importSuggestion(index) {
  if (!showSuggestion.value) return;
  const suggestion =
    filteredSuggestions.value[index ? index : states.selectedSuggestion];
  Object.keys(suggestion).forEach((key) => {
    states.newItem[key] = suggestion[key];
  });
  states.showSuggestion = false;
}
//
function filterAttr() {
  for (let i = 0; i < suggestions.value.length; i++) {
    let row = suggestions.value[i];
    // Remove unneeded attributes

    config.columns.forEach((col) => {
      if (col.attrs.suggestion === false) delete row[col.key];
    });

    // Remove state & id columns
    Object.keys(row).forEach((col) => {
      const column = config.columns.filter((c) => c.key === col);
      if (column?.[0]?.isState) delete row[col];
      delete row['id'];
    });
  }
}
function removeDuplicate() {
  // Remove duplicate rows
  const uniqueSuggestions = [];
  for (let i = 0; i < suggestions.value.length; i++) {
    let row = suggestions.value[i];
    const rowString = JSON.stringify(row);

    if (!uniqueSuggestions.some((item) => JSON.stringify(item) === rowString)) {
      uniqueSuggestions.push(row);
    }
  }
  suggestions.value = uniqueSuggestions;
}

function setAttrWidth() {
  // Set width of each attribute by the longest value
  for (let i = 0; i < suggestions.value.length; i++) {
    let row = suggestions.value[i];
    Object.keys(row).forEach((col) => {
      const column = config.columns.filter((c) => c.key === col);
      if (column?.[0]?.isState) delete row[col];
      if (!colWidths[col]) colWidths[col] = 0;
      if (row[col]?.length > colWidths[col]) {
        colWidths[col] = row[col].length;
      }
    });
  }
}

function sortAttr() {
  // Sort suggestion columns by the order from config.columns
  const sortedSuggestions = [];
  for (let i = 0; i < suggestions.value.length; i++) {
    let row = suggestions.value[i];
    const sortedRow = {};
    config.columns.forEach((col) => {
      if (col.attrs.suggestion === false) return;
      sortedRow[col.key] = row[col.key];
    });
    sortedSuggestions.push(sortedRow);
  }
  suggestions.value = sortedSuggestions;
}

function truncateSuggestion(suggestions) {
  // Truncate suggestion to maxSuggestionNum
  if (suggestions.length > config.maxSuggestionNum) {
    suggestions.splice(config.maxSuggestionNum);
  }
  return suggestions;
}
</script>
<style scoped></style>
