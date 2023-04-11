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

//  #MOVES
let moveColumns = [
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
    disabled: false,
  },
  {
    name: 'Move',
    key: 'name',
    type: 'input',
    disabled: false,
    attrs: { type: 'text' },
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
    attrs: { type: 'text' },
  },
  {
    name: 'Duration',
    key: 'duration',
    type: 'input',
    disabled: false,
    attrs: { type: 'text' },
  },
  {
    name: 'Category',
    key: 'cat',
    type: 'input',
    disabled: false,
    attrs: { type: 'text' },
  },
  {
    name: 'Project',
    key: 'prj',
    type: 'input',
    disabled: false,
    attrs: { type: 'text' },
  },
  {
    name: 'Group',
    key: 'grp',
    type: 'input',
    disabled: false,
    attrs: { type: 'text' },
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

const moveStore = useMoveStore();
const moves = await moveStore.fetchMoves();
provide('moves', moves);

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
    attrs: { type: 'text' },
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
const projectStore = useProjectStore();
const projects = reactive(fetchWrapper(await projectStore.fetchProjects()));
provide('projects', projects);

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
