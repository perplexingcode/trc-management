<template>
  <div>
    <!-- <div class="daily-move">
      <ClientOnly>
        <Table
          rows="movesTodayQueued"
          :columns="queuedMoveColumns"
          item-name="move"
          add-row
          allRows="moves"
        />
      </ClientOnly>
    </div> -->
    <div class="daily-move">
      <ClientOnly>
        <Table
          db-table="queued-move"
          :columns="queuedMoveColumns"
          item-name="queued-move"
          init-show-rows
          :events="events"
        />
        <Table
          rows="movesToday"
          columns="moveColumns"
          dbTable="move"
          item-name="move"
          :events="events"
        />
      </ClientOnly>
    </div>
  </div>
</template>
<script setup>
import { query, getAll } from '~~/static/db';
import moment from 'moment';
import { deepClone, removeState } from '~~/static/utils';
const projectNames = (await getAll('project', 'name')).data.value
  .map((p) => p.name)
  .sort();

const events = reactive({ done: {} });

const movesToday = inject('movesToday');
const queuedMoves = inject('queuedMoves');

watch(
  () => events.done,
  (data) => {
    const item = deepClone(data.item);
    item.isBeingEdited = false;
    item.isSelected = false;
    if (data.value) {
      const index = queuedMoves.value.findIndex((m) => m.id === item.id);
      queuedMoves.value.splice(index, 1);
      movesToday.value.push(item);
    } else {
      const index = movesToday.value.findIndex((m) => m.id === item.id);
      movesToday.value.splice(index, 1);
      queuedMoves.value.push(item);
    }
  },
  { deep: true },
);

//  #MOVES
let queuedMoveColumns = [
  // {
  //   name: 'ID',
  //   key: 'id',
  //   type: 'p',
  // },
  {
    name: 'Move',
    key: 'name',
    type: 'input-name',
    disabled: false,
    attrs: { type: 'text', required: true },
  },
  {
    name: 'Done',
    key: 'done',
    type: 'boolean',
    disabled: false,
    default: false,
    swapDbTable: ['queued-move', 'move'],
  },
  {
    name: 'Priority',
    key: 'priority',
    type: 'select',
    disabled: false,
    options: [
      '1-Urgent',
      '2-Necessary',
      '3-Important',
      '4-Recommended',
      '5-Optional',
    ],
    attrs: { type: 'text' },
  },
  {
    name: '⟁',
    key: 'weight',
    type: 'input',
    disabled: false,
    attrs: { type: 'number' },
  },
  {
    name: 'Status',
    key: 'stt',
    type: 'select',
    disabled: false,
    default: 'Pending',
    options: ['Active', 'Pending', 'Completed', 'Deferred', 'Cancelled'],
    attrs: { type: 'text', required: true },
  },
  {
    name: 'Description',
    key: 'des',
    type: 'text-area',
    disabled: false,
    attrs: { type: 'text' },
  },
  {
    name: 'Date',
    key: 'date',
    type: 'input',
    disabled: false,
    default: moment().format('YYYY-MM-DD'),
    attrs: { type: 'text', required: true, suggestion: false },
  },
  {
    name: 'Duration',
    key: 'duration',
    type: 'input',
    disabled: false,
    attrs: { type: 'text', required: false, suggestion: false },
  },
  {
    name: 'Category',
    key: 'cat',
    type: 'select',
    disabled: false,
    options: [
      'Navigation',
      'Cosmic Engine',
      'Engineering',
      'Aesthetics',
      'Operation',
      'Business',
    ],
    attrs: { type: 'text', required: true },
  },
  {
    name: 'Project',
    key: 'prj',
    type: 'select',
    disabled: false,
    options: projectNames,
    attrs: { type: 'text' },
  },
  {
    name: 'Group',
    key: 'grp',
    type: 'select',
    disabled: false,
    options: ['Personal', 'MFVN', 'Freelace', 'TCGS', 'TrinityLTD'],
    attrs: { type: 'text', required: true },
  },
  {
    name: 'Tags',
    key: 'tags',
    type: 'input',
    disabled: false,
    attrs: { type: 'text' },
  },
];
</script>
<style></style>
