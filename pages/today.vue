<template>
  <div>
    <header class="text-center">
      <h1 class="text-xl">Today</h1>
      <p class="text-center">Today's date is {{ today }}</p>
    </header>

    <div id="dev-panel" class="card bg-secondary hidden">
      <h2>Dev zone</h2>
      <!-- <p>{{ doneTodayMoves }}</p> -->
    </div>
    <div class="intellisense-tracking flex">
      <Section title="IntelliSense" class="section planning">
        <template #step-0>
          <div class="action-queue">
            <h3>Action queue</h3>
            <Table
              rows="queuedMove"
              columns="queuedMoveColumns"
              item-name="queued-move"
              addRow="true"
            />
          </div>
        </template>
        <template #step-1><p>danchoi</p></template>
        <template #step-2><p>danchoi</p></template>
      </Section>
      <Section title="Tracking" class="section tracking">
        <template #step-0>
          <div class="flex">
            <div class="adjustment-panel card bg-secondary flex">
              <div
                class="report w-fit p-2 mr-2 rounded border-2 border-white-200"
              >
                <p>Total waste: {{ todayWaste }}</p>
                <p>Total chore: {{ todayChore }}</p>
                <p>Today done: {{ todayDone }}</p>
                <p>Today left: {{ todayLeft }}</p>
                <p>Current move: {{ currentMoveTime }}</p>
                <p>Max time: {{ maxTime }}</p>
                <p>Max time no sleep: {{ maxTimeNoSleep }}</p>
              </div>
              <div class="waste-chore">
                <div class="waste">
                  <h3 class="pr-1 text-center">Waste</h3>
                  <div class="pl-10 flex items-center">
                    <div class="flex px-2">
                      <img
                        width="22"
                        height="22"
                        class="mr-1"
                        src="https://img.icons8.com/color/48/facebook-new.png"
                        alt="facebook-new"
                      />
                      <p>{{ facebookTime }}</p>
                    </div>
                    <div class="flex px-2">
                      <img
                        width="22"
                        height="22"
                        class="mr-1"
                        src="https://img.icons8.com/fluency/48/youtube-play.png"
                        alt="youtube-play"
                      />
                      <p>{{ youtubeTime }}</p>
                    </div>
                  </div>
                  <div class="waste_moves pl-7">
                    <Table
                      rows="waste"
                      columns="wasteChoreColumns"
                      item-name="waste"
                      addRow="true"
                      :is-default-show-rows="false"
                      :show-suggestions="false"
                    />
                  </div>
                </div>
                <div class="chore">
                  <h3 class="pr-1 text-center">Chore</h3>
                  <div class="chore_moves pl-7">
                    <Table
                      rows="chore"
                      columns="wasteChoreColumns"
                      item-name="chore"
                      addRow="true"
                      :is-default-show-rows="false"
                    />
                  </div>
                </div>
                <div class="sleep text-center">
                  <h3 class="pr-1 text-center-center">Sleep</h3>
                  <div class="sleep_moves pl-7 flex">
                    <div class="input-group">
                      <label>Max</label>
                      <input v-model="sleepTimeMax" class="w-16" />
                    </div>
                    <div class="input-group">
                      <label>Current</label>
                      <input
                        :value="sumTime(sleepTimeCurrent)"
                        class="w-16"
                        disabled
                      />
                    </div>
                    <div class="input-group">
                      <label>Left</label>
                      <input :value="sleepTimeLeft" disabled class="w-16" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="notes-box card bg-secondary flex flex-col">
              <h3 class="text-center">Notes</h3>
              <Note box="general" />
            </div>
          </div>
        </template>
        <template #step-1><p>danchoi</p></template>
        <template #step-2><p>danchoi</p></template>
      </Section>
    </div>

    <Section title="Data" class="section data">
      <template #action-panel>
        <div class="flex">
          <button @click="decreaseDate">←</button>
          <input v-model="date" />
          <button @click="increaseDate">→</button>
        </div>
      </template>
      <template #step-0>
        <Suspense>
          <template #default>
            <div>
              <Table
                rows="movesToday"
                columns="moveColumns"
                item-name="move"
                addRow="true"
                allRows="moves"
              />
            </div>
          </template>
          <template #fallback>
            <p>Loading...</p>
          </template>
        </Suspense>
      </template>
      <template #step-1><p>danchoi</p></template>
      <template #step-2><p>danchoi</p></template>
    </Section>
  </div>
</template>
<script setup>
import moment from 'moment';
import { cvTime, sumTime } from '~/static/time';

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

// const dateMoves = (
//   await useFetch(backendUrl + '/db/query?key=date&value=' + date.value, {
//     headers: { table: 'management_move' },
//   })
// ).data;
// console.log(dateMoves);
// if (moment(new Date()).format('YYYY-MM-DD') !== today) {
//   movesToday = dateMoves;
// }

// provide('dateMoves', dateMoves);

const wasteMoves = inject('waste', []);
const choreMoves = inject('chore', []);

const todayWaste = computed(() => {
  return sumTime(wasteMoves.value.map((move) => move.duration));
});
const todayChore = computed(() => {
  return sumTime(
    cvTime(sumTime(choreMoves.value.map((move) => move.duration))) -
      cvTime(sleepTimeCurrent.value)
  );
});

const youtubeTime = computed(() => {
  return sumTime(
    wasteMoves.value
      .filter((move) => /youtube|yt/i.test(move.name))
      .map((move) => move.duration)
  );
});
const facebookTime = computed(() => {
  return sumTime(
    wasteMoves.value
      .filter((move) => /facebook|fb/i.test(move.name))
      .map((move) => move.duration)
  );
});

const vars = inject('vars', {});
const sleepTimeMax = ref(vars.sleepTime);
let sleepTimeCurrent = computed(() => {
  return sumTime(
    choreMoves.value
      .filter((move) => /sleep|nap/i.test(move.name))
      .map((move) => move.duration)
  );
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
      cvTime(todayChore.value) -
      cvTime(sleepTimeCurrent.value)
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
      ) -
      cvTime(sleepTimeCurrent.value)
  );
});

setInterval(() => {
  a.value = a.value + 0.0001;
}, 1000);

const sleepTimeLeft = computed(() => {
  return sumTime(cvTime(sleepTimeMax.value) - cvTime(sleepTimeCurrent.value));
});

const maxTime = computed(() => {
  return sumTime(
    cvTime(todayDone.value) +
      cvTime(todayLeft.value) -
      cvTime(sleepTimeLeft.value)
  );
});
const maxTimeNoSleep = computed(() => {
  return sumTime(cvTime(maxTime.value) + cvTime(sleepTimeLeft.value));
});
</script>

<style>
.section .planning {
  width: 45%;
}
.section .tracking {
  width: 55%;
}
</style>
