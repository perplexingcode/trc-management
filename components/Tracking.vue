<template>
  <Section title="Tracking" class="section tracking">
    <template #step-0>
      <div class="flex">
        <div class="adjustment-panel card bg-secondary flex">
          <div class="report w-fit p-2 mr-2 rounded border-2 border-white-200">
            <p>Total waste: {{ todayWaste }}</p>
            <p>Total chore: {{ todayChore }}</p>
            <p>Today done: {{ todayDone }}</p>
            <p>Today left: {{ todayLeft }}</p>
            <p>Current move: {{ currentMoveTime }}</p>
            <p>Max time: {{ maxTime }}</p>
            <p>Max time no sleep: {{ maxTimeNoSleep }}</p>
          </div>
          <div class="waste-chore">
            <WastePanel />
            <ChorePanel />
            <SleepPanel />
          </div>
        </div>
        <div class="notes-box card bg-secondary flex flex-col">
          <h3 class="text-center">Notes</h3>
          <Note name="general" box="general" :show-version-history="true" />
        </div>
      </div>
    </template>
    <template #step-1><p>danchoi</p></template>
    <template #step-2><p>danchoi</p></template>
  </Section>
</template>
<script setup>
import { cvTime, sumTime } from '~~/static/time';
import moment from 'moment';

const today = moment(new Date()).format('YYYY-MM-DD');

let movesToday = inject('movesToday', []);
const wasteMoves = inject('waste', []);
const choreMoves = inject('chore', []);
const vars = inject('vars', {});

const todayWaste = computed(() => {
  return sumTime(wasteMoves.value.map((move) => move.duration));
});

const todayChore = computed(() => {
  return sumTime(
    cvTime(sumTime(choreMoves.value.map((move) => move.duration))) -
      cvTime(sleepTimeCurrent.value),
  );
});

const sleepTimeMax = ref(vars.sleepTime);
let sleepTimeCurrent = computed(() => {
  return sumTime(
    choreMoves.value
      .filter((move) => /sleep|nap/i.test(move.name))
      .map((move) => move.duration),
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
      cvTime(sleepTimeCurrent.value),
  );
});

const a = ref(0); // create & read a dummy reactive variable to trigger computed updates
const currentMoveTime = computed(() => {
  a.value;
  return sumTime(
    Math.floor(
      moment.duration(moment().diff(moment().startOf('day'))).asMinutes(),
    ) /
      1440 -
      [todayDone, todayWaste, todayChore].reduce(
        (acc, curr) => acc + cvTime(curr.value),
        0,
      ) -
      cvTime(sleepTimeCurrent.value),
  );
});

setInterval(() => {
  a.value = a.value + 0.0001;
}, 1000);

const sleepTimeLeft = computed(() => {
  return sumTime(
    cvTime(sleepTimeMax.value) - cvTime(sleepTimeCurrent.value) > 0
      ? cvTime(sleepTimeMax.value) - cvTime(sleepTimeCurrent.value)
      : 0,
  );
});

const maxTime = computed(() => {
  return sumTime(
    cvTime(todayDone.value) +
      cvTime(todayLeft.value) -
      cvTime(sleepTimeLeft.value),
  );
});
const maxTimeNoSleep = computed(() => {
  return sumTime(cvTime(maxTime.value) + cvTime(sleepTimeLeft.value));
});
</script>
<style></style>
