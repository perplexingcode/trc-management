<template>
  <slot></slot>
</template>
<script setup>
import { getAll, query } from '~~/static/db';
import moment from 'moment';
import { cvTime, sumTime } from '~~/static/time';
import { on } from 'events';

// Modification
let vars;
const _vars = (await getAll('var')).data._rawValue;
for (const v of _vars) {
  vars = { ...vars, [v.id]: v.value };
}

const today = moment(new Date()).format('YYYY-MM-DD');

const moves = (await getAll('move')).data;
const movesToday = (await query('move', 'date', today)).data;
const movesTodayDone = ref([]);
const queuedMoves = ref([]);
const movesTodayQueued = movesToday.value.filter((m) => !m.done);
const wasteMoves = (await query('waste', 'date', today)).data;
const choreMoves = (await query('chore', 'date', today)).data;
const dailyMoves = (await getAll('daily-move')).data;
const projects = (await getAll('project')).data;

onMounted(async () => {
  await nextTick();
  movesTodayDone.value = movesToday.value.filter((m) => m.done);
  queuedMoves.value = moves.value.filter((m) => !m.done);
});

// Filtered moves
const todayWaste = computed(() => {
  return sumTime(wasteMoves.value.map((move) => move.duration));
});

const todayChore = computed(() => {
  return sumTime(
    cvTime(sumTime(choreMoves.value.map((move) => move.duration))) -
      cvTime(sleepTimeCurrent.value),
  );
});

const todayDone = computed(() => {
  return sumTime(movesTodayDone.value.map((move) => move.duration));
});
const todayLeft = computed(() => {
  return sumTime(
    cvTime('24h') - cvTime(todaySpent.value) - cvTime(sleepTimeCurrent.value),
  );
});
const sleepTimeMax = ref(vars.sleepTime);
let sleepTimeCurrent = computed(() => {
  return sumTime(
    choreMoves.value
      .filter((move) => /sleep|nap/i.test(move.name))
      .map((move) => move.duration),
  );
});

const todayService = computed(() => {
  return sumTime(
    movesTodayDone.value
      .filter((move) => move.grp === 'MFVN' || move.grp === 'Freelance')
      .map((move) => move.duration),
  );
});

const a = ref(0); // create & read a dummy reactive variable to trigger computed updates
const currentMoveTime = computed(() => {
  a.value;
  return sumTime(
    Math.floor(
      moment.duration(moment().diff(moment().startOf('day'))).asMinutes(),
    ) /
      1440 -
      [todayDone, todayWaste, todayChore].reduce(
        (acc, curr) => acc + cvTime(curr.value),
        0,
      ) -
      cvTime(sleepTimeCurrent.value),
  );
});

setInterval(() => {
  a.value = a.value + 0.0001;
}, 1000);

const todaySpent = computed(() => {
  return sumTime(
    cvTime(todayDone.value) +
      cvTime(todayWaste.value) +
      cvTime(todayChore.value) +
      0 * cvTime(currentMoveTime.value),
  );
});

const currentLap = computed(() => {
  const num = Math.floor(cvTime(todaySpent.value) / cvTime('5h'));
  if (num === 0) return 1;
  if (num === 1) return 2;
  return 3;
});

// Sort alphabetically
projects.value = projects.value.sort((a, b) => (a.name > b.name ? 1 : -1));
const projectNames = projects.value.map((p) => p.name);

let moveColumns = [
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
    default: true,
    transferTable: {
      triggerOn: false,
      dbTable: 'queued-move',
    },
    attrs: { noSuggestion: true },
  },
  {
    name: 'Description',
    key: 'des',
    type: 'textarea',
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
    options: [
      '-',
      'TrinityInc',
      'Personal',
      'MFVN',
      'Freelance',
      'TCGS',
      'The Merchant',
      'Kim Assistant',
    ],
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
    name: 'Done',
    key: 'done',
    type: 'boolean',
    disabled: false,
    default: false,
    transferTable: {
      triggerOn: true,
      dbTable: 'move',
    },
    attrs: { noSuggestion: true },
  },
  {
    name: 'Description',
    key: 'des',
    type: 'textarea',
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
    hidden: true,
    options: ['Active', 'Pending', 'Completed', 'Deferred', 'Cancelled'],
    attrs: { type: 'text', required: true },
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
    options: [
      '-',
      'TrinityInc',
      'Personal',
      'MFVN',
      'Freelance',
      'TCGS',
      'The Merchant',
    ],
    attrs: { type: 'text', required: true },
  },
  {
    name: 'Tags',
    key: 'tags',
    type: 'input',
    disabled: false,
    attrs: { type: 'text' },
  },
  {
    name: 'Date',
    key: 'date',
    type: 'input',
    hidden: true,
    disabled: false,
    default: moment().format('YYYY-MM-DD'),
    attrs: { type: 'text', required: true, suggestion: false },
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

// PROVIDE
provide('moves', moves);
provide('moveColumns', moveColumns);
provide('movesToday', movesToday);
provide('movesTodayDone', movesTodayDone);
provide('movesTodayQueued', movesTodayQueued);
provide('queuedMoves', queuedMoves);
provide('queuedMoveColumns', queuedMoveColumns);
provide('waste', wasteMoves);
provide('chore', choreMoves);
provide('todayWaste', todayWaste);
provide('todayChore', todayChore);
provide('todayDone', todayDone);
provide('todayService', todayService);
provide('movesTodayDone', movesTodayDone);
provide('todayLeft', todayLeft);
provide('sleepTimeMax', sleepTimeMax);
provide('sleepTimeCurrent', sleepTimeCurrent);
provide('movesToday', movesToday);
provide('currentLap', currentLap);
provide('todaySpent', todaySpent);
provide('currentMoveTime', currentMoveTime);

provide('dailyMove', dailyMoves);
provide('vars', reactive(vars));
provide('projects', projects);
</script>
<style></style>
