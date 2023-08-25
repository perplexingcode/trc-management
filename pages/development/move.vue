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
          dev
        />
      </ClientOnly>
    </div>
  </div>
</template>
<script setup>
import { query, getAll } from '~~/static/db';
import moment from 'moment';
const projectNames = (await getAll('project', 'name')).data.value
  .map((p) => p.name)
  .sort();

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
    type: 'checkbox',
    disabled: false,
    default: false,
    attrs: { type: 'checkbox' },
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
    attrs: { type: 'text', required: true },
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
