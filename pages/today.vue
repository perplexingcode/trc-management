<template>
  <div @keyup.enter="confirmChanges">
    <h1>Today</h1>
    <p>Today's date is {{ today }}</p>
    <div id="dev-panel" class="card bg-secondary hidden">
      <h2>Dev zone</h2>
      <!-- <p>{{ doneTodayMoves }}</p> -->
      <p>{{ newWasteMove }}</p>
    </div>
    <div class="adjustment-panel card bg-secondary flex">
      <div class="report w-1/2">
        <p>Total waste: {{ todayWaste }}</p>
        <p>Total chore: {{ todayChore }}</p>
        <p>Today done: {{ todayDone }}</p>
        <p>Today left: {{ todayLeft }}</p>
        <p>Current move: {{ currentMoveTime }}</p>
        <p>Max time: {{ maxTime }}</p>
      </div>
      <div class="waste-chore w-1/2">
        <div class="waste">
          <div class="flex items-center">
            <h3 class="pr-1">Waste</h3>
            <div class="add-waste_move">
              <input
                class="waste_hour input-duration"
                v-model="newWasteMove.duration"
                type="text"
                @keyup.enter="addWasteMove"
              />
              <input
                class="input-as-label"
                v-model="newWasteMove.action"
                type="text"
              />
              <button @click="addWasteMove">↵ Add</button>
              <input
                class="waste_date input-date"
                v-model="newWasteMove.date"
                type="text"
                @keyup.enter="addWasteMove"
              />
              <button @click="showWasteMoves = !showWasteMoves">
                + Show all
              </button>
            </div>
          </div>
          <div v-show="showWasteMoves" class="waste_moves pl-7">
            <Table
              rows="waste"
              columns="wasteChoreColumns"
              item-name="waste"
              :new-item="newWasteMove"
              :events="wasteEvents"
            />
          </div>
        </div>
        <div class="chore">
          <div class="flex items-center">
            <h3 class="pr-1">Chore</h3>
            <div class="add-chore_move">
              <input
                class="chore_hour input-duration"
                v-model="newChoreMove.duration"
                type="text"
                @keyup.enter="addChoreMove"
              />
              <input
                class="input-as-label"
                v-model="newChoreMove.action"
                type="text"
              />
              <button @click="addChoreMove">↵ Add</button>
              <input
                class="chore_date input-date"
                v-model="newChoreMove.date"
                type="text"
                @keyup.enter="addChoreMove"
              />
              <button @click="showChoreMoves = !showChoreMoves">
                + Show all
              </button>
            </div>
          </div>
          <div v-show="showChoreMoves" class="chore_moves pl-7">
            <Table
              rows="chore"
              columns="wasteChoreColumns"
              item-name="chore"
              :new-item="newChoreMove"
              :events="choreEvents"
            />
          </div>
        </div>
      </div>
    </div>

    <div id="action-form" class="bg-secondary card">
      <h2>Actions</h2>
    </div>
    <Suspense>
      <template #default>
        <div>
          <div class="flex">
            <button @click="decreaseDate">←</button>
            <input v-model="date" />
            <button @click="increaseDate">→</button>
          </div>
          <Table
            rows="movesToday"
            columns="moveColumns"
            item-name="move"
            dev="false"
            addRow="true"
            allRows="moves"
          />
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
import { cvTime, sumTime } from '~/static/time';
import { v4 } from 'uuid';

const backendUrl = useRuntimeConfig().backendUrl;
const today = moment(new Date()).format('YYYY-MM-DD');
const date = ref(today);
function increaseDate() {
  date.value = moment(date.value).add(1, 'days').format('YYYY-MM-DD');
}
function decreaseDate() {
  date.value = moment(date.value).subtract(1, 'days').format('YYYY-MM-DD');
}

let movesToday = inject('movesToday', []);
// const groups = inject('groups', []);
// const projects = inject('projects', []);

const dateMoves = (
  await useFetch(backendUrl + '/db/query?key=date&value=' + date.value, {
    headers: { table: 'management_move' },
  })
).data;
console.log(dateMoves);
// if (moment(new Date()).format('YYYY-MM-DD') !== today) {
//   movesToday = dateMoves;
// }

// provide('dateMoves', dateMoves);

const showWasteMoves = ref(false);
class WasteMove {
  id = ref(v4());
  name = ref('');
  duration = ref('');
  date = ref(today);
}
const wasteMoves = inject('waste', []);
const newWasteMove = ref(new WasteMove());
const wasteEvents = { addRow: ref(false) };
function addWasteMove() {
  wasteEvents.addRow.value = !wasteEvents.addRow.value;
}

const showChoreMoves = ref(false);
class ChoreMove {
  id = ref(v4());
  name = ref('');
  duration = ref('');
  date = ref(today);
}
const choreMoves = inject('chore', []);
const newChoreMove = ref(new ChoreMove());
const choreEvents = { addRow: ref(false) };
function addChoreMove() {
  choreEvents.addRow.value = !choreEvents.addRow.value;
}

const todayWaste = computed(() => {
  return sumTime(wasteMoves.value.map((move) => move.duration));
});

const todayChore = computed(() => {
  return sumTime(choreMoves.value.map((move) => move.duration));
});

const todayDoneMoves = computed(() => {
  return movesToday.value.filter((move) => move.done && move.date === today);
});

const todayDone = computed(() => {
  return sumTime(todayDoneMoves.value.map((move) => move.duration));
});

const todayLeft = computed(() => {
  return sumTime(
    cvTime('24h') -
      cvTime(todayDone.value) -
      cvTime(todayWaste.value) -
      cvTime(todayChore.value)
  );
});

const a = ref(0); // create & read a dummy reactive variable to trigger computed updates
const currentMoveTime = computed(() => {
  a.value;
  return sumTime(
    Math.floor(
      moment.duration(moment().diff(moment().startOf('day'))).asMinutes()
    ) /
      1440 -
      [todayDone, todayWaste, todayChore].reduce(
        (acc, curr) => acc + cvTime(curr.value),
        0
      )
  );
});

setInterval(() => {
  a.value = a.value + 0.0001;
}, 1000);

const maxTime = computed(() => {
  return sumTime(cvTime(todayDone.value) + cvTime(todayLeft.value));
});
</script>
