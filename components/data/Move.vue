<template>
  <slot></slot>
</template>
<script setup>
import { getAll, query } from '~~/static/db';
import moment from 'moment';

const today = moment(new Date()).format('YYYY-MM-DD');

const moves = (await getAll('move')).data;
const movesToday = (await query('move', 'date', today)).data;
const movesTodayDone = movesToday.value.filter((m) => m.done);
const movesTodayQueued = movesToday.value.filter((m) => !m.done);
const wasteMoves = (await query('waste', 'date', today)).data;
const choreMoves = (await query('chore', 'date', today)).data;
const queuedMoves = (await getAll('queued-move')).data;
const dailyMoves = (await getAll('daily-move')).data;
const projects = (await getAll('project')).data;

// Modification
let vars;
const _vars = (await getAll('var')).data._rawValue;
for (const v of _vars) {
  vars = { ...vars, [v.id]: v.value };
}

// Sort alphabetically
projects.value = projects.value.sort((a, b) => (a.name > b.name ? 1 : -1));
const projectNames = projects.value.map((p) => p.name);

let moveColumns = [
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
    default: true,
    attrs: { type: 'checkbox' },
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
    attrs: { type: 'text', required: true, suggestion: false },
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
    options: ['-', 'TrinityInc', 'Personal', 'MFVN', 'Freelance', 'TCGS'],
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

const queuedMoveColumns = [
  {
    name: 'Move',
    key: 'name',
    type: 'input-name',
    disabled: false,
    attrs: { type: 'text', required: true },
  },
  {
    name: '⟁',
    key: 'weight',
    type: 'input',
    disabled: false,
    attrs: { type: 'number' },
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
  // {
  //   name: 'Personnel',
  //   key: 'personnel',
  //   type: 'select',
  //   default: 'CEO',
  //   disabled: false,
  //   options: [
  //     'CEO',
  //     'CFO',
  //     'CMO',
  //     'CTO',
  //     'Developer',
  //     'HR',
  //     'Secretary',
  //     'Sales Expert',
  //     'Stylist',
  //     'Artist',
  //     'Philosopher',
  //   ],
  // },
  {
    name: 'Project',
    key: 'prj',
    type: 'select',
    disabled: false,
    options: projectNames,
    attrs: { type: 'text', required: false },
  },
];

function weight(rows) {
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
  }
}

// WATCHERS
watch(movesTodayDone, () => {
  movesTodayDone.value = movesToday.value.filter((m) => !m.done);
  movesTodayQueued.value = movesToday.value.filter((m) => m.done);
});

watch(movesTodayQueued, () => {
  movesTodayDone.value = movesToday.value.filter((m) => !m.done);
  movesTodayQueued.value = movesToday.value.filter((m) => m.done);
});

// PROVIDE
provide('moves', moves);
provide('moveColumns', moveColumns);
provide('movesTodayDone', movesTodayDone);
provide('queuedMoveColumns', queuedMoveColumns);
provide('movesTodayQueued', movesTodayQueued);
provide('movesToday', movesToday);
provide('waste', wasteMoves);
provide('chore', choreMoves);
provide('queuedMove', queuedMoves);
provide('dailyMove', dailyMoves);
provide('vars', reactive(vars));
</script>
<style></style>
