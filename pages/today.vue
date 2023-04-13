<template>
  <div @keyup.enter="confirmChanges">
    <h1>Today</h1>
    <p>Today's date is {{ today }}</p>
    <div id="dev-panel" class="card bg-secondary">
      <h2>Dev zone</h2>
      <!-- <p>{{ doneTodayMoves }}</p> -->
      <p>{{ newWasteMove }}</p>
    </div>
    <div class="adjustment-panel card bg-secondary flex">
      <div class="report w-1/2">
        <p>Total waste: {{ todayWaste }}</p>
        <p>Total chore: {{ todayChore }}</p>
        <p>Today done: {{ todayDone }}</p>
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
          <Table
            rows="movesToday"
            columns="moveColumns"
            item-name="move"
            dev="true"
            addRow="true"
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
import { sumTime } from '~/static/time';
import { upsert } from '~~/static/db';
import { deepClone, newId } from '~~/static/utils';
const today = moment(new Date()).format('YYYY-MM-DD');
const movesToday = inject('movesToday', []);
// const groups = inject('groups', []);
// const projects = inject('projects', []);

const showWasteMoves = ref(false);
class WasteMove {
  id = ref(newId());
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
  id = ref(newId());
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
</script>
