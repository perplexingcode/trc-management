<template>
  <div v-if="showSuggestion && isLoaded" class="modal suggestions">
    <div
      v-for="(item, index) in filteredSuggestions"
      :key="item[0]"
      class="suggestion flex row cursor-pointer"
      @click="importSuggestion(index)"
      :class="{ selected: index === state.selectedSuggestion }"
    >
      <div
        v-for="(col, key) in item"
        :key="key"
        class="suggestion-col"
        :class="key"
      >
        <div v-if="!noSuggestion.includes(key)" class="flex">
          <div class="name px-[3px] mx-1 bg-[#3333]">{{ key }}</div>
          <div
            class="value"
            :style="{
              width:
                `${(colWidths[key] < 20 ? colWidths[key] : 20) * 10}` + 'px',
            }"
          >
            {{ col }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { sample, getById, upsert } from '~~/static/db';
import moment from 'moment';

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
const state = inject('state-' + props.tableId);
const _rows = inject('rows-' + props.tableId);

const isLoaded = ref(false);
const suggestions = ref([]);
const colWidths = reactive({});

const filteredSuggestions = computed(() => {
  // filter by name from state.newItem.name
  if (!suggestions.value.length) return [];
  return truncateSuggestion(
    suggestions.value.filter((item) =>
      item.name.toLowerCase().includes(state.newItem.name.toLowerCase()),
    ),
  );
});

const showSuggestion = computed(() => {
  return (
    props.newItem.name &&
    filteredSuggestions.value.length &&
    state.showSuggestion
  );
});
watch(showSuggestion, async () => {
  if (showSuggestion.value) {
    window.addEventListener('keydown', handleKeyDown);
  } else {
    window.removeEventListener('keydown', handleKeyDown);
  }
});
const rows = ref([]);
onMounted(async () => {
  await nextTick();
  // Fetch data from cache
  const cloudSuggestion = (
    await getById(
      'cache',
      'suggestion-' + (config.suggestionTable || config.dbTable),
    )
  )?.data?._rawValue;
  if (cloudSuggestion) {
    const now = moment();
    const cacheDate = moment(cloudSuggestion.timestamp);
    const diff = now.diff(cacheDate, 'days');
    if (diff < 3) {
      suggestions.value = cloudSuggestion.value;
      isLoaded.value = true;
      return;
    }
  }

  // Fetch data from db
  if (
    !data.suggestionPool.length &&
    (config.dbTable || config.suggestionTable) &&
    config.suggestionSize != -1
  ) {
    data.suggestionPool = (
      await sample(
        config.suggestionTable || config.dbTable,
        config.suggestionSize,
      )
    ).data._rawValue;
    suggestions.value = data.suggestionPool;
  } else {
    rows.value = _rows.value;
    suggestions.value = rows.value;
  }
  filterAttr();
  setAttrWidth();
  sortAttr();
  isLoaded.value = true;
  removeDuplicate();
  upsert('cache', {
    id: 'suggestion-' + config.dbTable,
    value: suggestions.value,
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
  });
});

// >>>----------------------------------------------------------------------------------<<<
// FUNCTION DECLARATIONS
async function handleKeyDown(e) {
  if (
    e.key === 'ArrowDown' &&
    state.selectedSuggestion < filteredSuggestions.value.length - 1
  ) {
    state.isSelectingSuggestion = true;
    state.selectedSuggestion++;
  }
  if (e.key === 'ArrowUp' && state.selectedSuggestion > 0) {
    state.isSelectingSuggestion = true;
    state.selectedSuggestion--;
  }
  if (e.key === 'Enter') {
    importSuggestion();
    e.preventDefault();
    e.stopPropagation();
    await nextTick();
    state.isSelectingSuggestion = false;
    state.showSuggestion = false;
  }
}
//
function importSuggestion(index) {
  if (!showSuggestion.value) return;
  const suggestion =
    filteredSuggestions.value[index ? index : state.selectedSuggestion];
  Object.keys(suggestion).forEach((key) => {
    state.newItem[key] = suggestion[key];
  });
  state.showSuggestion = false;
}
//
const noSuggestion = ['date', 'done'];
async function filterAttr() {
  for (let i = 0; i < suggestions.value.length; i++) {
    let row = suggestions.value[i];
    // Remove unneeded attributes

    config.columns.forEach((col) => {
      if (col?.attrs?.suggestion === false || noSuggestion.includes(col.key))
        delete row[col.key];
    });
    //Remove unnecessary tags
    if (row.tags) {
      row.tags = row.tags
        .replace(/,/g, ';')
        .replace(/;+/g, ';')
        .trim()
        .replace(/^;$/, '');
      row.tags = row.tags
        .replace(/lap1;|lap2;|lap3;|lap1|lap2|lap3/g, '')
        .trim();
      const tags = row.tags.split(';');
      // remove time tags
      const timeTags = tags.filter(
        (tag) => tag.includes('time') && tag.includes('='),
      );
      if (timeTags.length) {
        for (let t = 0; t < timeTags.length; t++) {
          suggestions.value[i].tags = suggestions.value[i].tags.replace(
            timeTags[t],
            '',
          );
        }
      }
    }
    // remove unnecessary commas
    if (row.tags) {
      suggestions.value[i].tags = row.tags
        .replace(/^,|,$/g, '') // Removes leading and trailing commas
        .replace(/,+/g, ',') // Replaces multiple commas with a single comma
        .trim(); // Trims any whitespace
    }

    if (row.prj == '-') suggestions.value[i].prj = '';

    // Remove state & id columns
    Object.keys(row).forEach((col) => {
      const column = config.columns.filter((c) => c.key === col);
      if (column?.[0]?.isState) delete row[col.key];
      if (noSuggestion.includes(col.key)) delete row[col.key];
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
      if (col?.attrs?.suggestion === false) return;
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
