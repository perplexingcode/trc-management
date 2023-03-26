<template>
  <div @keyup.enter="confirmChanges">
    <h1>Today</h1>
    <p>Today's date is {{ today }}</p>
    <div id="#dev-panel">
      <h2>Dev zone</h2>
      <p>isEditing: {{ isEditing }}</p>
      <p>{{ selectedTasks }}</p>
      <p>{{ newTask.end }}</p>
      <p>{{ tasks }}</p>
      <Test />
    </div>

    <div id="action-form" class="bg-secondary card">
      <h2>Actions</h2>
      <button @click="createTask" id="btn-add-task">Add Task</button>
      <button @click="generateTestTask">Generate Random Task</button>
      <button @click="createTestTask">Create Random Task</button>
      <button @click="deleteTasks" id="btn-action-delete">Delete</button>
      <button @click="toggleEditMode">Toggle Edit</button>
    </div>

    <Suspense>
      <template #default>
        <div>
          <table>
            <thead>
              <tr>
                <td></td>
                <td>ID</td>
                <td>Completed</td>
                <td>Task</td>
                <td>Des</td>
                <td>Start</td>
                <td>End</td>
                <td>Duration</td>
                <td>Category</td>
                <td>Project</td>
                <td>Group</td>
                <td>Tags</td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <button @click="createTask" id="btn-add-task">
                    Create Task \/
                  </button>
                </td>
                <td><input type="checkbox" v-model="newTask.done" /></td>
                <td><input type="text" v-model="newTask.name" /></td>
                <td><input type="text" v-model="newTask.des" /></td>
                <td>
                  <input
                    type="text"
                    maxlength="14"
                    @input="dateTimeValidation()"
                    v-model="newTask.start"
                    placeholder="yy-mm-dd hh:mm"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    maxlength="14"
                    @input="dateTimeValidation()"
                    v-model="newTask.end"
                    placeholder="yy-mm-dd hh:mm"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    :value="
                      dateTimeValidation()
                        ? calDuration(newTask.start, newTask.end)
                        : ''
                    "
                    disabled
                  />
                </td>
                <td>
                  <select name="category" id="category" v-model="newTask.cat">
                    <option v-for="cat in categories" :key="cat" :value="cat">
                      {{ cat }}
                    </option>
                  </select>
                </td>
                <td><input type="text" v-model="newTask.prj" /></td>
                <td><input type="text" v-model="newTask.grp" /></td>
                <td><input type="text" v-model="newTask.tag" /></td>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(task, index) in tasks"
                :key="task.id"
                @click="editTask(index)"
              >
                <td>
                  <input
                    type="checkbox"
                    :checked="task.state.isSelected"
                    @click.stop="selectTask(index)"
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
                    v-model="task.name"
                    :disabled="!editingCondition(index)"
                  />
                </td>
                <td>
                  <input
                    v-model="task.des"
                    :disabled="!editingCondition(index)"
                  />
                </td>
                <td>
                  <input
                    v-model="task.start"
                    :disabled="!editingCondition(index)"
                  />
                </td>
                <td>
                  <input
                    v-model="task.end"
                    :disabled="!editingCondition(index)"
                  />
                </td>
                <td>{{ calDuration(task.start, task.end) }}</td>
                <td>
                  <input
                    v-model="task.cat"
                    :disabled="!editingCondition(index)"
                  />
                </td>
                <td>
                  <input
                    v-model="task.prj"
                    :disabled="!editingCondition(index)"
                  />
                </td>
                <td>
                  <input
                    v-model="task.grp"
                    :disabled="!editingCondition(index)"
                  />
                </td>
                <td>
                  <input
                    v-model="task.tag"
                    :disabled="!editingCondition(index)"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <Table table-data="tasks" />
        </div>
      </template>
      <template #fallback>
        <p>Loading...</p>
      </template>
    </Suspense>
  </div>
</template>
<script setup>
import moment from 'moment';
import { faker } from '@faker-js/faker';
import { v4 } from 'uuid';
import { unwrap } from '~/static/utils';
import { errConditionWrapper } from '~/static/validation';
import { request } from '~/static/request';
/*
Data: name, tasks, today, calDuration
*/

// Hardcode
const categories = [
  'Navigation',
  'Engineering',
  'Aesthetics',
  'Business',
  'Operation',
];

let tasks = inject('tasks');
let columns = {
  id: {
    name: 'ID',
    type: 'text',
    editable: false,
  },
  done: {
    name: 'Completed',
    type: 'checkbox',
    editable: true,
  },
  isRep: {
    name: 'Repeat',
    type: 'checkbox',
    editable: true,
  },
  name: {
    name: 'Task',
    type: 'text',
    editable: true,
  },
  des: {
    name: 'Description',
    type: 'text',
    editable: true,
  },
  start: {
    name: 'Start',
    type: 'text',
    editable: true,
  },
  end: {
    name: 'End',
    type: 'text',
    editable: true,
  },
  duration: {
    name: 'Duration',
    type: 'text',
    editable: false,
    value: 100,
  },
  cat: {
    name: 'Category',
    type: 'select',
    editable: true,
  },
  prj: {
    name: 'Project',
    type: 'text',
    editable: true,
  },
  grp: {
    name: 'Group',
    type: 'text',
    editable: true,
  },
  tag: {
    name: 'Tag',
    type: 'text',
    editable: true,
  },
};
provide('tasks', tasks);
provide('columns', columns);

const error = reactive({
  // Date & time
  startTime: {
    stt: false,
    msg: 'Start time is invalid',
  },
  endTime: {
    stt: false,
    msg: 'End time is invalid',
  },
  startBeforeEnd: {
    stt: false,
    msg: 'Start time must be before end time',
  },
  duration: {
    stt: false,
    msg: 'Duration is invalid',
  },
});

// Ultilities

// Date & time
//---> Standard date time format:YY-MM-DD hh:mm <---//
const today = moment(new Date()).format('YY-MM-DD');
const calDuration = function (start, end) {
  start = moment(start, 'YY-MM-DD hh:mm');
  end = moment(end, 'YY-MM-DD hh:mm');
  return moment.duration(end.diff(start)).asMinutes();
};

function dateTimeValidation() {
  const start = newTask.start;
  const end = newTask.end;

  newTask.start = newTask.start.replaceAll(/[^0-9:-\s]/g, '');
  newTask.end = newTask.end.replaceAll(/[^0-9:-\s]/g, '');
  const startIsValid = moment(newTask.start, 'YY-MM-DD hh:mm').isValid();
  const endIsValid = moment(newTask.end, 'YY-MM-DD hh:mm').isValid();
  if (
    errConditionWrapper(error, 'startTime', !startIsValid) &&
    start.length == 14
  )
    newTask.start = '';

  if (errConditionWrapper(error, 'endTime', !endIsValid) && end.length == 14)
    newTask.end = '';

  if (
    errConditionWrapper(
      error,
      'startBeforeEnd',
      moment(newTask.start, 'YY-MM-DD hh:mm').isAfter(newTask.end)
    )
  )
    return false;
  if (startIsValid && endIsValid) return true;
  return false;
}

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
//   name = '';
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
  name: '',
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
  newTask.name = '';
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
  request('http://localhost:3141/task/create', 'post', task);
  clearInput();
};

// Generate new task data
const generateTestTask = () => {
  newTask.id = newTaskId();
  newTask.name = faker.word.verb() + ' ' + faker.word.noun();
  newTask.des = faker.lorem.sentence();
  newTask.done = false;
  newTask.start = moment(
    faker.date.between('2023-08-08 00:00', '2023-08-08 12:00')
  ).format('YYYY-MM-DD hh:mm');
  newTask.end = moment(
    faker.date.between('2023-08-08 12:00', '2023-08-09 00:00')
  ).format('YYYY-MM-DD hh:mm');
  newTask.isRep = false;
  newTask.cat = categories.random();
  newTask.prj = faker.word.noun();
  newTask.grp = faker.word.noun();
  newTask.tag = faker.word.noun();
};

const createTestTask = () => {
  generateTestTask();
  createTask();
};

const selectTask = (index) => {
  tasks.value[index].state.isSelected = !tasks.value[index].state.isSelected;
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
  // newTask.id = tasks.value[index].id;
  // newTask.name = computed(() => tasks.value[index].name);
  // newTask.des = computed(() => tasks.value[index].des);
  // newTask.done = computed(() => tasks.value[index].done);
  // newTask.start = computed(() => tasks.value[index].start);
  // newTask.end = computed(() => tasks.value[index].end);
  // newTask.isRep = computed(() => tasks.value[index].isRep);
  // newTask.cat = computed(() => tasks.value[index].cat);
  // newTask.prj = computed(() => tasks.value[index].prj);
  // newTask.grp = computed(() => tasks.value[index].grp);
  // newTask.tag = computed(() => tasks.value[index].tag);
  // newTask.state.isSelected = computed(
  //   () => tasks.value[index].state.isSelected
  // );
};

watch(isEditing, (newValue, oldValue) => {
  if (oldValue === true && newValue === false) {
    updateTask(taskBeingEdited.value);
  }
});

const updateTask = (index) => {
  console.log(index);
  let data = tasks._rawValue[index];
  request('http://localhost:3141/task/update', 'post', JSON.stringify(data));
  console.log(data);
  document.activeElement.blur();
};

async function deleteTasks() {
  let deleteTaskList = [];
  for (let i = 0; i < tasks.value.length; i++) {
    if (tasks.value[i].state.isSelected) {
      deleteTaskList.push(tasks.value[i].id);
      tasks.value.splice(i, 1);
      i--;
    }
  }
  request('http://localhost:3141/task/delete', 'post', deleteTaskList);
}

// Dev
const selectedTasks = computed(() => {
  let selectedTasks = [];
  for (let i = 0; i < tasks.value.length; i++) {
    if (tasks.value[i].state.isSelected) {
      selectedTasks.push(i);
    }
  }
  return selectedTasks;
});

//
</script>

<style>
:is(h1, h2, h3, h4, h5, h6) {
  margin: 0;
}
.card {
  padding: 2rem;
}
</style>
