<template>
  <div>
    <h1>Today</h1>
    <p>Today's date is {{ today }}</p>
    <p>{{ newTask }}</p>

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
    </div>
    <Suspense>
      <template #default>
        <table>
          <tr>
            <td>ID</td>
            <td>Completed</td>
            <td>Task</td>
            <td>Duration</td>
            <td>Category</td>
            <td>Project</td>
            <td>Group</td>
          </tr>
          <tr v-for="task in tasks" :key="task.id">
            <td>{{ task.id }}</td>
            <td><input type="checkbox" :checked="task.done" /></td>
            <td>{{ task.title }}</td>
            <td>{{ calDuration(task.start, task.end) }}</td>
            <td>{{ task.cat }}</td>
            <td>{{ task.prj }}</td>
            <td>{{ task.grp }}</td>
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
import { unwrap } from '/static/globalMethods.js';
/*
Data: name, tasks, today, calDuration
*/
let tasks = useFetch('http://localhost:3141/tasks/all').data;
console.log(tasks);
let name = 'TodayPage';
const today = moment(new Date()).format('yyyy-MM-DD');

const newTaskId = computed(() => tasks.value.length + 1);
let newTask = reactive({
  id: newTaskId,
  title: '',
  des: '',
  done: false,
  start: '',
  end: '',
  isRep: false,
  cat: '',
  prj: '',
  grp: '',
});

const clearInput = function () {
  newTask.title = '';
  newTask.des = '';
  newTask.done = false;
  newTask.start = '';
  newTask.end = '';
  newTask.isRep = false;
  newTask.cat = '';
  newTask.prj = '';
  newTask.grp = '';
};

const createTask = function () {
  tasks.value.push(unwrap(newTask));
  console.log('what', tasks.value);
  clearInput();

  console.log(tasks);
};
const calDuration = function (start, end) {
  start = moment(start, 'YYYY-MM-DD hh:mm');
  end = moment(end, 'YYYY-MM-DD hh:mm');
  return moment.duration(end.diff(start)).asMinutes();
};
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
  grid-row: 2/4;
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
