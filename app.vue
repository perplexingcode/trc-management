<template>
  <div class="main_wrap">
    <h1>This is Management</h1>
    <nav>
      <ul>
        <li><NuxtLink to="/">Home</NuxtLink></li>
        <li><NuxtLink to="/test">Test</NuxtLink></li>
        <li><NuxtLink to="/today">Today</NuxtLink></li>
        <li><NuxtLink to="/category">Categories</NuxtLink></li>
        <li><NuxtLink to="/project">Projects</NuxtLink></li>
        <li class="menu-parent-item">
          <NuxtLink to="/navigation">Navigation</NuxtLink>
          <ul class="menu-drop-down">
            <li><NuxtLink to="nav/week">Week</NuxtLink></li>
            <li><NuxtLink to="nav/month">Month</NuxtLink></li>
            <li><NuxtLink to="nav/quarter">Quarter</NuxtLink></li>
            <li><NuxtLink to="nav/year">Year</NuxtLink></li>
            <li><NuxtLink to="nav/phase">Phase</NuxtLink></li>
            <li><NuxtLink to="nav/decade">Decade</NuxtLink></li>
          </ul>
        </li>
      </ul>
    </nav>
    <NuxtPage />
  </div>
</template>
<script setup>
import { useMoveStore } from '~/stores/move.js';
import { useProjectStore } from '~/stores/project.js';
import { fetchWrapper } from '~/static/request';
import moment from 'moment';
const today = moment(new Date()).format('YYYY-MM-DD');
// const moves = (
//   await useFetch('http://localhost:3141/db/all', {
//     headers: { table: 'management_move' },
//   })
// ).data;
// provide('moves', moves);

const movesToday = (
  await useFetch('http://localhost:3141/db/query?key=date&value=' + today, {
    headers: { table: 'management_move' },
  })
).data;
console.log('vl', movesToday);
provide('movesToday', movesToday);

const projects = (
  await useFetch('http://localhost:3141/db/all', {
    headers: { table: 'management_project' },
  })
).data;
provide('projects', projects);

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
  {
    name: 'Action',
    key: 'action',
    type: 'button',
    noSave: true,
    disabled: false,
  },
  // {
  //   name: 'ID',
  //   key: 'id',
  //   type: 'p',
  // },
  {
    name: 'Move',
    key: 'name',
    type: 'input',
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
    attrs: { type: 'text', required: true },
  },
  {
    name: 'Duration',
    key: 'duration',
    type: 'input',
    disabled: false,
    attrs: { type: 'text', required: true },
  },
  {
    name: 'Category',
    key: 'cat',
    type: 'select',
    disabled: false,
    options: [
      'Navigation',
      'Engineering',
      'Aesthetics',
      'Business',
      'Operation',
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
    options: ['Personal', 'MFVN', 'TCGS', 'TrinityLTD'],
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
    name: 'Action',
    key: 'action',
    type: 'button',
    noSave: true,
    disabled: false,
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
    type: 'input',
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
const wasteMoves = (
  await useFetch('http://localhost:3141/db/all', {
    headers: { table: 'management_waste' },
  })
).data;
provide('waste', wasteMoves);
const choreMoves = (
  await useFetch('http://localhost:3141/db/all', {
    headers: { table: 'management_chore' },
  })
).data;
provide('chore', choreMoves);

// const choreMoves = (
//   await useFetch('http://localhost:3141/db/management_chore/all')
// ).data;
// provide('chore', choreMoves);

// const wasteMovesToday = wasteMoves.value.filter((move) => {
//   return move.date === moment().format('YYYY-MM-DD');
// });
// console.log('cac', wasteMovesToday);
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
