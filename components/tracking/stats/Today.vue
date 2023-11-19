<template>
  <div class="stats today">
    <div class="stats__main mb-3">
      <div class="flex items-center">
        <img class="w-6 h-6 mr-1" src="~/assets/img/icon/done.svg" alt="done" />
        <span class="leading-none pt-1"> Total done: {{ todayDone }} </span>
      </div>
      <div class="flex items-center">
        <img
          class="w-6 h-6 mr-1"
          src="https://img.icons8.com/color/48/cleaning-a-surface.png"
          alt="chore"
        />
        <span class="leading-none pt-1"> Total chore: {{ todayChore }} </span>
      </div>
      <div class="flex items-center">
        <div class="w-6 h-6 mr-1">
          <img
            class="w-5 h-5 m-auto"
            src="~/assets/img/icon/trash-short.png"
            alt="waste"
          />
        </div>
        <span class="leading-none pt-1"> Total waste: {{ todayWaste }} </span>
      </div>
    </div>
    <p>Today left: {{ todayLeft }}</p>
    <p>Current move: {{ currentMoveTime }}</p>
    <p>Max time: {{ maxTime }}</p>
    <p v-if="sleepTimeLeft !== '0:00'">
      Max time no sleep: {{ maxTimeNoSleep }}
    </p>
  </div>
</template>
<script setup>
import { sumTime, cvTime } from '~~/static/time';

const movesToday = inject('movesToday', []);
const todayWaste = inject('todayWaste');
const todayChore = inject('todayChore');
const todayDone = inject('todayDone');
const todayLeft = inject('todayLeft');
const sleepTimeMax = inject('sleepTimeMax');
const sleepTimeCurrent = inject('sleepTimeCurrent');
const currentLap = inject('currentLap');
const todaySpent = inject('todaySpent');
const currentMoveTime = inject('currentMoveTime');

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
      cvTime(sleepTimeLeft.value) +
      cvTime(currentMoveTime.value),
  );
});
const maxTimeNoSleep = computed(() => {
  return sumTime(cvTime(maxTime.value) + cvTime(sleepTimeLeft.value));
});
</script>
<style></style>
