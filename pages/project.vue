<template>
  <div>
    <p>{{ projects }}</p>
  </div>
  <div id="action-panel">
    <button @click="createProject">Create project</button>
    <button @click="generateRandomProject">Generate random project</button>
    <button @click="deleteProject">Delete project(s)</button>
  </div>
  <table>
    <tr>
      <td></td>
      <td>Done</td>
      <td>Name</td>
      <td>Hour</td>
      <td>Description</td>
    </tr>
    <tr>
      <td><button @click="createProject">Create project</button></td>
      <td><input type="checkbox" v-model="newProject.done" /></td>
      <td><input type="text" v-model="newProject.name" /></td>
      <td><input type="number" v-model="newProject.hour" /></td>
      <td><input type="text" v-model="newProject.des" /></td>
    </tr>
    <tr v-for="project in projects" :key="project.name">
      <td><input type="checkbox" v-model="project.state.isSelected" /></td>
      <td><input type="checkbox" v-model="project.done" /></td>
      <td><input type="text" v-model="project.name" /></td>
      <td><input type="number" v-model="project.hour" /></td>
      <td><input type="text" v-model="project.des" /></td>
    </tr>
  </table>
</template>
<script setup>
import { faker } from '@faker-js/faker';
import { unwrap } from '~/static/utils';
let projects = inject('projects');
class state {
  isSelected = false;
  isBeingEdited = false;
}
const newProject = reactive({
  name: '',
  hour: 0,
  des: '',
  done: false,
  state: new state(),
});

// Actions
function clearInput() {
  newProject.name = '';
  newProject.hour = 0;
  newProject.des = '';
  newProject.done = false;
}

function createProject() {
  const project = unwrap(newProject);
  projects.value.push(project);
  clearInput();
}

async function deleteProjects() {
  let deleteProjectList = [];
  for (let i = 0; i < tasks.value.length; i++) {
    if (projects.value[i].state.isSelected) {
      deleteProjectList.push(projects.value[i].id);
      projects.value.splice(i, 1);
      i--;
    }
  }
  request('http://localhost:3141/project/delete', 'post', deleteProjectList);
}

const updateTask = (index) => {
  let data = tasks._rawValue[index];
  request('http://localhost:3141/task/update', 'post', JSON.stringify(data));
  document.activeElement.blur();
};

function generateRandomProject() {
  newProject.name = faker.name.fullName();
  newProject.hour = faker.random.numeric(2);
  newProject.des = faker.lorem.sentence();
  newProject.done = false;
  newProject.state = new state();
}
</script>
