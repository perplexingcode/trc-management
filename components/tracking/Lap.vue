<template>
  <div class="tracking-lap">
    <h2 class="text-xl ml-3">Lap {{ currentLap }}</h2>
    <div class="lap card bg-secondary w-full h-fit">
      <div class="goals">
        <h2 class="text-lg">Goals</h2>
        <div class="mb-3">
          <h3 class="text-lg">Engineering - 2h</h3>
          <ChartProgressBar
            :percent="engineeringPercent"
            class="w-[36rem]"
            :data-title="engineeringDuration"
          />
        </div>
        <div class="mb-3">
          <h3 class="text-lg">Aesthetics - 30m</h3>
          <ChartProgressBar
            :percent="aestheticsPercent"
            class="w-[9rem]"
            :data-title="aestheticsDuration"
          />
        </div>
        <div class="mb-3">
          <h3 class="text-lg">Business - 30m</h3>
          <ChartProgressBar
            :percent="businessPercent"
            class="w-[9rem]"
            :data-title="businessDuration"
          />
        </div>
        <div class="mb-3">
          <h3 class="text-lg">MFVN - 2h</h3>
          <ChartProgressBar
            :percent="mfvnPercent"
            class="w-[36rem]"
            :data-title="mfvnDuration"
          />
        </div>
      </div>
      <div
        class="flex justify-center items-center w-48 h-48 bg-gray-500 text-center rounded-full m-3"
      >
        <div class="mb-3.5 h-fit w-fit">
          <h2 class="text-lg mb-1 text-gray-900">Lap time</h2>
          <ChartProgressCircle :percent="lapTimePercent" />
          <p>Time left: {{ sumTime(((100 - lapTimePercent) * 0.05) / 24) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { cvTime, sumTime } from '~~/static/time';
const movesToday = inject('movesToday', []);
const currentLap = inject('currentLap');
const todaySpent = inject('todaySpent');

const mfvnDuration = computed(() => {
  return sumTime(
    movesToday.value
      .filter(
        (move) =>
          move.grp === 'MFVN' && move.tags.includes('lap' + currentLap.value),
      )
      .map((move) => move.duration),
  );
});

const mfvnPercent = computed(() => {
  return (cvTime(mfvnDuration.value) / cvTime('2h')).toFixed(2) * 100;
});

const engineeringDuration = computed(() => {
  return sumTime(
    movesToday.value
      .filter(
        (move) =>
          (move.cat === 'Engineering' || move.tags.includes('engineering')) &&
          move.tags.includes('lap' + currentLap.value),
      )
      .map((move) => move.duration),
  );
});
const engineeringPercent = computed(() => {
  return (cvTime(engineeringDuration.value) / cvTime('2h')).toFixed(2) * 100;
});

const aestheticsDuration = computed(() => {
  return sumTime(
    movesToday.value
      .filter(
        (move) =>
          (move.cat === 'Aesthetics' || move.tags.includes('aesthetics')) &&
          move.tags.includes('lap' + currentLap.value),
      )
      .map((move) => move.duration),
  );
});

const aestheticsPercent = computed(() => {
  return (cvTime(aestheticsDuration.value) / cvTime('30m')).toFixed(2) * 100;
});

const businessDuration = computed(() => {
  return sumTime(
    movesToday.value
      .filter(
        (move) =>
          (move.cat === 'Business' || move.tags.includes('business')) &&
          move.tags.includes('lap' + currentLap.value),
      )
      .map((move) => move.duration),
  );
});

const businessPercent = computed(() => {
  return (cvTime(businessDuration.value) / cvTime('30m')).toFixed(2) * 100;
});

const lapTimePercent = computed(() => {
  if (!todaySpent.value) return 0;
  const lapTime = cvTime(todaySpent.value) % cvTime('5h');
  return (lapTime / cvTime('5h')).toFixed(2) * 100;
});
</script>
<style></style>
