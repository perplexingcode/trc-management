<template>
  <div @keyup.enter="confirmChanges">
    <h1>Today</h1>
    <p>Today's date is {{ today }}</p>
    <p>isEditing: {{ isEditing }}</p>

    <div class="add-task-form bg-secondary card">
      <h2>Add Task</h2>
      <div class="add-task-form-content">
        <div class="add-task-form__input task-id">
          <label>ID</label>
          <input type="text" :value="tasks.length + 1" disabled />
        </div>
        <div class="add-task-form__input task-stt">
          <label>Completed</label>
          <input type="checkbox" v-model="newTask.done" />
        </div>
        <div class="add-task-form__input task-title">
          <label>Title</label>
          <input type="text" v-model="newTask.title" />
        </div>
        <div class="add-task-form__input task-des">
          <label>Description</label>
          <input type="text" v-model="newTask.des" />
        </div>
        <div class="add-task-form__input task-tag">
          <label>Tags</label>
          <input type="text" v-model="newTask.tag" />
        </div>
        <div class="add-task-form__input task-start">
          <label>Start</label>
          <input type="text" v-model="newTask.start" />
        </div>
        <div class="add-task-form__input task-end">
          <label>End</label>
          <input type="text" v-model="newTask.end" />
        </div>
        <div class="add-task-form__input task-cat">
          <label>Category</label>
          <input type="text" v-model="newTask.cat" />
        </div>
        <div class="add-task-form__input task-prj">
          <label>Project</label>
          <input type="text" v-model="newTask.prj" />
        </div>
        <div class="add-task-form__input task-grp">
          <label>Group</label>
          <input type="text" v-model="newTask.grp" />
        </div>
        <button @click="createTask" id="btn-add-task">Add Task</button>
      </div>
      <div class="action-form bg-secondary card">
        <h2>Actions</h2>
        <button @click="generateTestTask">Generate Random Task</button>
        <button @click="createTestTask">Create Random Task</button>
        <button @click="deleteTasks" id="btn-action-delete">Delete</button>
        <button @click="toggleEditMode">Toggle Edit</button>
      </div>
    </div>
    <Suspense>
      <template #default>
        <table>
          <tr>
            <td></td>
            <td>ID</td>
            <td>Completed</td>
            <td>Task</td>
            <td>Duration</td>
            <td>Category</td>
            <td>Project</td>
            <td>Group</td>
          </tr>
          <tr
            v-for="(task, index) in tasks"
            :key="task.id"
            @click="editTask(index)"
          >
            <td>
              <input
                type="checkbox"
                :checked="task.state.isSelected"
                @click.stop="selectTask(index, task.state.isSelected)"
              />
            </td>
            <td>{{ task.id }}</td>
            <td>
              <input
                type="checkbox"
                :checked="task.done"
                @click.stop="task.done = !task.done"
                :disabled="!editingCondition(index)"
              />
            </td>
            <td>
              <input
                v-model="task.title"
                :disabled="!editingCondition(index)"
              />
            </td>
            <td>{{ calDuration(task.start, task.end) }}</td>
            <td>
              <input v-model="task.cat" :disabled="!editingCondition(index)" />
            </td>
            <td>
              <input v-model="task.prj" :disabled="!editingCondition(index)" />
            </td>
            <td>
              <input v-model="task.grp" :disabled="!editingCondition(index)" />
            </td>
          </tr>
        </table>
      </template>
      <template #fallback>
        <p>Loading...</p>
      </template>
    </Suspense>
  </div>
</template>
<script setup>
import moment from 'moment';
// import { unwrap } from '/static/globalMethods.js';
import axios from 'axios';
import { faker } from '@faker-js/faker';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 } from 'uuid';
import settings from '/static/settings.js';
/*
Data: name, tasks, today, calDuration
*/

// Ultilities
const today = moment(new Date()).format('yyyy-MM-DD');
const calDuration = function (start, end) {
  start = moment(start, 'YYYY-MM-DD hh:mm');
  end = moment(end, 'YYYY-MM-DD hh:mm');
  return moment.duration(end.diff(start)).asMinutes();
};

const unwrap = (obj) => JSON.parse(JSON.stringify(obj));

// Request
const request = async function (url, method, data) {
  let config = {
    method: method,
    url: url,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
};

// Import and preprocess tasks
let data = (await useFetch('http://localhost:3141/tasks/all')).data;

//Pre-process
// let _tasks = unwrap(data)._value;

// _tasks.forEach((t) => (t.isSelected = false));

// let tasks = ref(_tasks);
// console.log(tasks);

//Test
// console.log(JSON.parse(data));
// let _tasks = data.forEach((t) => (t.isSelected = false));
let tasks = data;

//Test
function newTaskId() {
  return v4().replaceAll('-', '').slice(0, 12);
}

// Actions
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      isEditing.value = false;
    }
  });
});

// Task logics
//// Global vars
let isEditing = ref(false);
let taskBeingEdited = ref(null);
////
const editingCondition = (index) => {
  return tasks.value[index].state.isBeingEdited && isEditing.value;
};
const toggleEditMode = () => {
  isEditing.value = !isEditing.value;
};

// Create new task
class TaskState {
  isBeingEdited = false;
  isSelected = false;
}

// class Task {
//   id = '';
//   title = '';
//   des = '';
//   done = false;
//   start = '';
//   end = '';
//   isRep = false;
//   cat = '';
//   prj = '';
//   grp = '';
//   state = new TaskState();
// }

let newTask = reactive({
  id: newTaskId(),
  title: '',
  des: '',
  done: false,
  start: '',
  end: '',
  isRep: false,
  cat: '',
  prj: '',
  grp: '',
  tag: '',
  state: new TaskState(),
});

const clearInput = () => {
  newTask.title = '';
  newTask.des = '';
  newTask.done = false;
  newTask.start = '';
  newTask.end = '';
  newTask.isRep = false;
  newTask.cat = '';
  newTask.prj = '';
  newTask.grp = '';
  newTask.tag = '';
};

const createTask = async function () {
  const task = unwrap(newTask);
  tasks.value.push(task);
  request('http://localhost:3141/tasks/create', 'post', task);
  clearInput();
};

// Generate new task data
const generateTestTask = () => {
  newTask.id = newTaskId();
  newTask.title = faker.word.verb() + ' ' + faker.word.noun();
  newTask.des = faker.lorem.sentence();
  newTask.done = false;
  newTask.start = moment(
    faker.date.between('2023-08-08 00:00', '2023-08-08 12:00')
  ).format('YYYY-MM-DD hh:mm');
  newTask.end = moment(
    faker.date.between('2023-08-08 12:00', '2023-08-09 00:00')
  ).format('YYYY-MM-DD hh:mm');
  newTask.isRep = false;
  newTask.cat = faker.commerce.department();
  newTask.prj = faker.word.noun();
  newTask.grp = faker.word.noun();
  newTask.tag = faker.word.noun();
};

const createTestTask = () => {
  generateTestTask();
  createTask();
};

const selectTask = (index) => {
  if (!isEditing) {
    tasks.value[index].state.isSelected = true;
  }
};

const editTask = (index, isSelected) => {
  taskBeingEdited.value = index;
  console.log(taskBeingEdited);
  if (isEditing && !isSelected) {
    isEditing.value = false;
    tasks.value.forEach((t) => (t.state.isBeingEdited = false));
  }
  isEditing.value = true;
  tasks.value[index].state.isBeingEdited = true;
  newTask.id = tasks.value[index].id;
  newTask.title = computed(() => tasks.value[index].title);
  newTask.des = computed(() => tasks.value[index].des);
  newTask.done = computed(() => tasks.value[index].done);
  newTask.start = computed(() => tasks.value[index].start);
  newTask.end = computed(() => tasks.value[index].end);
  newTask.isRep = computed(() => tasks.value[index].isRep);
  newTask.cat = computed(() => tasks.value[index].cat);
  newTask.prj = computed(() => tasks.value[index].prj);
  newTask.grp = computed(() => tasks.value[index].grp);
  newTask.tag = computed(() => tasks.value[index].tag);
  newTask.state.isSelected = computed(
    () => tasks.value[index].state.isSelected
  );
};

watch(isEditing, (newValue, oldValue) => {
  if (oldValue === true && newValue === false) {
    updateTask(taskBeingEdited.value);
  }
});

const updateTask = (index) => {
  console.log(index);
  let data = tasks._rawValue[index];
  request('http://localhost:3141/tasks/update', 'post', JSON.stringify(data));
  console.log(data);
  document.activeElement.blur();
};

const deleteTasks = async () => {
  let deleteTaskList = [];
  for (let i = 0; i < tasks.value.length; i++) {
    if (tasks.value[i].isSelected) {
      deleteTaskList.push(tasks.value[i].id);
      tasks.value.splice(i, 1);
      i--;
    }
  }
  request('http://localhost:3141/tasks/delete', 'post', deleteTaskList);
};

//
</script>

<style>
.add-task-form {
  padding: 1rem;
  margin: 1rem;
}

.add-task-form-content {
  display: grid;
  grid-template-columns: repeat(5, auto);
}
.add-task-form__input {
  display: flex;
  flex-direction: column;
  margin: 0.5rem;
}

.add-task-form .task-id {
  width: 5rem;
}

.add-task-form .task-title {
  width: 10rem;
}

.task-stt {
  grid-column: 1;
  grid-row: 2;
}

.task-grp {
  grid-column: 2;
}

.task-prj {
  grid-column: 2;
}

.task-title {
  grid-column: 3;
  grid-row: 1;
}

.task-des {
  grid-column: 3;
  grid-row: 2;
}

.task-tag {
  grid-column: 3;
  grid-row: 3;
}

.task-start {
  grid-column: 4;
  grid-row: 1;
}

.task-end {
  grid-column: 4;
  grid-row: 2;
}

#btn-add-task {
  grid-row: 4;
}
</style>
