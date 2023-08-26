<template>
  <div class="stats today">
    <p>Total waste: {{ todayWaste }}</p>
    <p>Total chore: {{ todayChore }}</p>
    <p>Today done: {{ todayDone }}</p>
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
      cvTime(sleepTimeLeft.value),
  );
});
const maxTimeNoSleep = computed(() => {
  return sumTime(cvTime(maxTime.value) + cvTime(sleepTimeLeft.value));
});
</script>
<style></style>
