<template>
  <main class="main_wrap">
    <h1>This is Management</h1>
    <p class="text-center">
      Last actions:
      {{
        JSON.stringify(actionTimestamps?.stack)
          .replace(/["\[\]]/g, '')
          .replaceAll(',', ', ')
      }}
    </p>
    <nav>
      <ul>
        <li><NuxtLink to="/">Home</NuxtLink></li>
        <li><NuxtLink to="/test">Test</NuxtLink></li>
        <li><NuxtLink to="/today">Today</NuxtLink></li>
        <li><NuxtLink to="/project">Projects</NuxtLink></li>
        <li class="menu-parent-item">
          <NuxtLink to="/navigation">Navigation</NuxtLink>
          <ul class="menu-drop-down">
            <li><NuxtLink to="/nav/day">Week</NuxtLink></li>
            <li><NuxtLink to="/nav/week">Week</NuxtLink></li>
            <li><NuxtLink to="/nav/month">Month</NuxtLink></li>
            <li><NuxtLink to="/nav/quarter">Quarter</NuxtLink></li>
            <li><NuxtLink to="/nav/year">Year</NuxtLink></li>
            <li><NuxtLink to="/nav/phase">Phase</NuxtLink></li>
            <li><NuxtLink to="/nav/decade">Decade</NuxtLink></li>
          </ul>
        </li>
        <li><NuxtLink to="/move">Move</NuxtLink></li>
        <li class="menu-parent-item">
          <NuxtLink to="/report">Report</NuxtLink>
        </li>
        <li><NuxtLink to="/note">Note</NuxtLink></li>
        <li><NuxtLink to="/accounting">Accounting</NuxtLink></li>
        <li><NuxtLink to="/data">Data</NuxtLink></li>
        <li><NuxtLink to="/category">Categories</NuxtLink></li>
        <li><NuxtLink to="/settings">Settings</NuxtLink></li>
      </ul>
    </nav>
    <GetId />
    <DataMove>
      <NuxtPage />
    </DataMove>
  </main>
</template>
<script setup>
import moment from 'moment';
import FILOArray from './static/class/FILOArray';

// Add favicon and title
useHead({
  title: 'This is Management',
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' }],
});

const timeArray = new FILOArray();
timeArray.maxSize = 5;
timeArray.push(moment(new Date()).format('HH:mm'));
const actionTimestamps = ref(timeArray);
if (process.client) {
  var elements = document.getElementsByTagName('*');
  for (var i = 0; i < elements.length; i++) {
    // Attach a click event handler to each element
    elements[i].addEventListener('click', function (event) {
      // Prevent the default behavior of the click event
      actionTimestamps.value.push(moment(new Date()).format('HH:mm'));
    });
    elements[i].addEventListener('change', function (event) {
      // Prevent the default behavior of the click event
      actionTimestamps.value.push(moment(new Date()).format('HH:mm'));
    });
  }
}

// ULTILITIES
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
