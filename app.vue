<template>
  <main class="main_wrap">
    <h1>This is Management</h1>
    <nav>
      <ul>
        <li><NuxtLink to="/">Home</NuxtLink></li>
        <li><NuxtLink to="/test">Test</NuxtLink></li>
        <li><NuxtLink to="/today">Today</NuxtLink></li>
        <li><NuxtLink to="/category">Categories</NuxtLink></li>
        <li><NuxtLink to="/project">Projects</NuxtLink></li>
        <li><NuxtLink to="/data">Data</NuxtLink></li>
        <li class="menu-parent-item">
          <NuxtLink to="/navigation">Navigation</NuxtLink>
          <ul class="menu-drop-down">
            <li><NuxtLink to="/nav/week">Week</NuxtLink></li>
            <li><NuxtLink to="/nav/month">Month</NuxtLink></li>
            <li><NuxtLink to="/nav/quarter">Quarter</NuxtLink></li>
            <li><NuxtLink to="/nav/year">Year</NuxtLink></li>
            <li><NuxtLink to="/nav/phase">Phase</NuxtLink></li>
            <li><NuxtLink to="/nav/decade">Decade</NuxtLink></li>
          </ul>
        </li>
        <li class="menu-parent-item">
          <NuxtLink to="/report">Report</NuxtLink>
          <ul class="menu-drop-down">
            <li><NuxtLink to="/report/waste-chore">Waste-Chore</NuxtLink></li>
          </ul>
        </li>
      </ul>
    </nav>
    <NuxtPage />
  </main>
</template>
<script setup>
import moment from 'moment';

const today = moment(new Date()).format('YYYY-MM-DD');

const { backendUrl } = useRuntimeConfig();

const moves = (await useFetch(backendUrl + '/all/' + 'management_move')).data;
provide('moves', moves);

const movesToday = (
  await useFetch(backendUrl + '/query' + '/management_move' + '/date/' + today)
).data;
provide('movesToday', movesToday);

const wasteMoves = (
  await useFetch(backendUrl + '/query' + '/management_waste' + '/date/' + today)
).data;
provide('waste', wasteMoves);
const choreMoves = (
  await useFetch(backendUrl + '/query' + '/management_chore' + '/date/' + today)
).data;
provide('chore', choreMoves);

let projects = (await useFetch(backendUrl + '/all/' + 'management_project'))
  .data;
// Sort alphabetically
projects.value = projects.value.sort((a, b) => (a.name > b.name ? 1 : -1));
provide('projects', projects);

const queuedMoves = (
  await useFetch(backendUrl + '/all/' + 'management_queued-move')
).data;
provide('queuedMove', queuedMoves);

const dailyMoves = (
  await useFetch(backendUrl + '/all/' + 'management_daily-move')
).data;
provide('dailyMove', dailyMoves);

let vars;
const _vars = (await useFetch(backendUrl + '/all/' + 'management_var')).data
  ._rawValue;
for (const v of _vars) {
  vars = { ...vars, [v.id]: v.value };
}
provide('vars', reactive(vars));
const queuedMoveColumns = [
  {
    name: '',
    key: 'is-selected',
    type: 'is-selected',
    disabled: true,
    noSave: true,
    attrs: { type: 'text' },
  },
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
    default: true,
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
    name: 'Personnel',
    key: 'personnel',
    type: 'select',
    default: 'CEO',
    disabled: false,
    options: [
      'CEO',
      'CFO',
      'CMO',
      'CTO',
      'Developer',
      'HR',
      'Secretary',
      'Sales Expert',
      'Stylist',
      'Artist',
      'Philosopher',
    ],
  },
];

provide('queuedMoveColumns', queuedMoveColumns);

//  #MOVES
let moveColumns = [
  {
    name: '',
    key: 'is-selected',
    type: 'is-selected',
    disabled: true,
    noSave: true,
    attrs: { type: 'text' },
  },
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
    options: projects.value.map((p) => p.name),
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
provide('moveColumns', moveColumns);

const wasteChoreColumns = [
  {
    name: '',
    key: 'is-selected',
    type: 'is-selected',
    disabled: true,
    attrs: { type: 'text' },
  },
  {
    name: 'Duration',
    key: 'duration',
    type: 'input',
    disabled: false,
    attrs: { type: 'text', required: true },
  },
  {
    name: 'Move',
    key: 'name',
    type: 'input-name',
    data: choreMoves.value.map((m) => m.name),
    disabled: false,
    attrs: { type: 'text' },
  },
  {
    name: 'Date',
    key: 'date',
    type: 'input',
    disabled: false,
    default: moment().format('YYYY-MM-DD'),
    attrs: { type: 'text' },
  },
];
provide('wasteChoreColumns', wasteChoreColumns);

// const choreMoves = (
//   await useFetch(backendUrl + '/db/management_chore/all')
// ).data;
// provide('chore', choreMoves);

// const wasteMovesToday = wasteMoves.value.filter((move) => {
//   return move.date === moment().format('YYYY-MM-DD');
// });
// provide('wasteToday', wasteMovesToday);
// const choreMovesToday = choreMoves.filter((move) => {
//   return move.date === moment().format('YYYY-MM-DD');
// });
// provide('choreToday', choreMovesToday);
//

// #PROJECTS
const projectColumns = [
  {
    name: '',
    key: 'is-selected',
    type: 'is-selected',
    disabled: true,
    attrs: { type: 'text' },
  },
  {
    name: 'Project',
    key: 'name',
    type: 'input',
    disabled: false,
    attrs: { type: 'text' },
  },
  {
    name: 'Hour',
    key: 'hour',
    type: 'input',
    disabled: false,
    attrs: { type: 'text' },
  },
];

provide('projectColumns', projectColumns);

// Ultilities
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};
</script>

<style>
.main_wrap h1 {
  text-align: center;
}

nav {
  display: flex;
  justify-content: center;
}
nav ul {
  display: flex;
  gap: 20px;
  list-style-type: none;
}

.menu-parent-item {
  position: relative;
}
.menu-drop-down {
  position: absolute;
  top: 100%;
  left: 0;
  display: none;
  background-color: #fff;
  padding: 0;
  margin: 0;
  list-style: none;
  border: 2px solid #ccc;
  border-top: none;
  border-radius: 0 0 5px 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
.menu-parent-item:hover .menu-drop-down {
  display: block;
}
</style>
