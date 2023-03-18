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
import { useTaskStore } from '~/stores/task.js';
import { useProjectStore } from '~/stores/project.js';
import { fetchWrapper } from '~/static/request';

const taskStore = useTaskStore();
const tasks = reactive(await taskStore.fetchTasks());
provide('tasks', tasks);

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

body {
  font-family: 'Comfortaa', cursive;
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
