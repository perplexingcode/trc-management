<template>
  <main class="main_wrap">
    <h1>This is Management</h1>
    <p class="text-center">
      Last actions:
      {{
        JSON.stringify(actionTimestamps?.stack)
          .replace(/["\[\]]/g, "")
          .replaceAll(",", ", ")
      }}
    </p>
    <nav>
      <ul>
        <li><NuxtLink to="/">Home</NuxtLink></li>
        <li><NuxtLink to="/test">Test</NuxtLink></li>
        <li><NuxtLink to="/today">Today</NuxtLink></li>
        <li><NuxtLink to="/category">Categories</NuxtLink></li>
        <li><NuxtLink to="/project">Projects</NuxtLink></li>
        <li><NuxtLink to="/data">Data</NuxtLink></li>
        <li><NuxtLink to="/note">Note</NuxtLink></li>
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
        </li>
      </ul>
    </nav>
    <NuxtPage />
  </main>
</template>
<script setup>
import moment from "moment";
import { getAll, query } from "./static/db";
import FILOArray from "./static/class/FILOArray";

const timeArray = new FILOArray();
timeArray.maxSize = 5;
timeArray.push(moment(new Date()).format("HH:mm"));
const actionTimestamps = ref(timeArray);
if (process.client) {
  var elements = document.getElementsByTagName("*");
  for (var i = 0; i < elements.length; i++) {
    // Attach a click event handler to each element
    elements[i].addEventListener("click", function (event) {
      // Prevent the default behavior of the click event
      actionTimestamps.value.push(moment(new Date()).format("HH:mm"));
    });
    elements[i].addEventListener("change", function (event) {
      // Prevent the default behavior of the click event
      actionTimestamps.value.push(moment(new Date()).format("HH:mm"));
    });
  }
}
const today = moment(new Date()).format("YYYY-MM-DD");

const moves = (await getAll("move")).data;
const movesToday = (await query("move", "date", today)).data;
const wasteMoves = (await query("waste", "date", today)).data;
const choreMoves = (await query("chore", "date", today)).data;
const queuedMoves = (await getAll("queued-move")).data;
const dailyMoves = (await getAll("daily-move")).data;

let vars;
const _vars = (await getAll("var")).data._rawValue;
for (const v of _vars) {
  vars = { ...vars, [v.id]: v.value };
}

let projects = (await getAll("project")).data;
// Sort alphabetically
projects.value = projects.value.sort((a, b) => (a.name > b.name ? 1 : -1));
const projectNames = projects.value.map((p) => p.name);

const queuedMoveColumns = [
  {
    name: "",
    key: "is-selected",
    type: "is-selected",
    disabled: true,
    noSave: true,
    attrs: { type: "text" },
  },
  {
    name: "Move",
    key: "name",
    type: "input-name",
    disabled: false,
    attrs: { type: "text", required: true },
  },
  {
    name: "⟁",
    key: "weight",
    type: "input",
    disabled: false,
    attrs: { type: "number" },
  },
  {
    name: "Done",
    key: "done",
    type: "checkbox",
    disabled: false,
    default: false,
    attrs: { type: "checkbox" },
  },
  {
    name: "Priority",
    key: "priority",
    type: "select",
    disabled: false,
    options: [
      "1-Urgent",
      "2-Necessary",
      "3-Important",
      "4-Recommended",
      "5-Optional",
    ],
    attrs: { type: "text" },
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
    name: "Project",
    key: "prj",
    type: "select",
    disabled: false,
    options: projectNames,
    attrs: { type: "text", required: false },
  },
];

//  #MOVES
let moveColumns = [
  {
    name: "",
    key: "is-selected",
    type: "is-selected",
    disabled: true,
    noSave: true,
    attrs: { type: "text" },
  },
  // {
  //   name: 'ID',
  //   key: 'id',
  //   type: 'p',
  // },
  {
    name: "Move",
    key: "name",
    type: "input-name",
    disabled: false,
    attrs: { type: "text", required: true },
  },
  {
    name: "Done",
    key: "done",
    type: "checkbox",
    disabled: false,
    default: true,
    attrs: { type: "checkbox" },
  },
  {
    name: "Description",
    key: "des",
    type: "text-area",
    disabled: false,
    attrs: { type: "text" },
  },
  {
    name: "Date",
    key: "date",
    type: "input",
    disabled: false,
    default: moment().format("YYYY-MM-DD"),
    attrs: { type: "text", required: true, suggestion: false },
  },
  {
    name: "Duration",
    key: "duration",
    type: "input",
    disabled: false,
    attrs: { type: "text", required: true, suggestion: false },
  },
  {
    name: "Category",
    key: "cat",
    type: "select",
    disabled: false,
    options: [
      "Navigation",
      "Cosmic Engine",
      "Engineering",
      "Aesthetics",
      "Operation",
      "Business",
    ],
    attrs: { type: "text", required: true },
  },
  {
    name: "Project",
    key: "prj",
    type: "select",
    disabled: false,
    options: projectNames,
    attrs: { type: "text", required: true },
  },
  {
    name: "Group",
    key: "grp",
    type: "select",
    disabled: false,
    options: ["Personal", "MFVN", "Freelace", "TCGS", "TrinityLTD"],
    attrs: { type: "text", required: true },
  },
  {
    name: "Tags",
    key: "tags",
    type: "input",
    disabled: false,
    attrs: { type: "text" },
  },
];

const wasteChoreColumns = [
  {
    name: "",
    key: "is-selected",
    type: "is-selected",
    disabled: true,
    attrs: { type: "text" },
  },
  {
    name: "Duration",
    key: "duration",
    type: "input",
    disabled: false,
    attrs: { type: "text", required: true },
  },
  {
    name: "Move",
    key: "name",
    type: "input-name",
    data: choreMoves.value.map((m) => m.name),
    disabled: false,
    attrs: { type: "text" },
  },
  {
    name: "Date",
    key: "date",
    type: "input",
    disabled: false,
    default: moment().format("YYYY-MM-DD"),
    attrs: { type: "text" },
  },
];

// #PROJECTS
const projectColumns = [
  {
    name: "",
    key: "is-selected",
    type: "is-selected",
    disabled: true,
    attrs: { type: "text" },
  },
  {
    name: "Project",
    key: "name",
    type: "input",
    disabled: false,
    attrs: { type: "text" },
  },
  {
    name: "Hour",
    key: "hour",
    type: "input",
    disabled: false,
    attrs: { type: "text" },
  },
];

// #TRANSACTIONS

const transactions = (await getAll("transaction")).data;
const transactionColumns = [
  {
    name: "",
    key: "is-selected",
    type: "is-selected",
    disabled: true,
    attrs: { type: "text" },
  },
  {
    name: "Category",
    key: "cat",
    type: "select",
    disabled: false,
    options: [
      "FoodnBeverage",
      "Services",
      "Consumables",
      "Shopping",
      "Movement",
      "Relationship",
      "Health",
      "Maintainance",
      "Education",
      "Investment",
      "-",
    ],
    attrs: { type: "text", required: true },
  },
  {
    name: "Group",
    key: "grp",
    type: "select",
    disabled: false,
    options: [
      "Navigation",
      "Cosmic Engine",
      "Engineering",
      "Aesthetics",
      "Operation",
      "Business",
    ],
    attrs: { type: "text", required: true },
  },
];

// PROVIDE
provide("moves", moves);
provide("movesToday", movesToday);
provide("waste", wasteMoves);
provide("chore", choreMoves);
provide("projects", projects);
provide("queuedMove", queuedMoves);
provide("dailyMove", dailyMoves);
provide("vars", reactive(vars));
provide("queuedMoveColumns", queuedMoveColumns);
provide("moveColumns", moveColumns);
provide("wasteChoreColumns", wasteChoreColumns);
provide("projectColumns", projectColumns);
provide("transactions", transactions);

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
