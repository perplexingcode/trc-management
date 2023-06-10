<template>
  <div class="sleep text-center">
    <h3 class="pr-1 text-center-center">Sleep</h3>
    <div class="sleep_moves pl-7 flex">
      <div class="input-group">
        <label>Max</label>
        <input v-model="sleepTimeMax" class="w-16" />
      </div>
      <div class="input-group">
        <label>Current</label>
        <input :value="sumTime(sleepTimeCurrent)" class="w-16" disabled />
      </div>
      <div class="input-group">
        <label>Left</label>
        <input :value="sleepTimeLeft" disabled class="w-16" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { sumTime } from '~~/static/time';

const choreMoves = inject('chore', []);
const vars = inject('vars', {});

const sleepTimeMax = ref(vars.sleepTime);
let sleepTimeCurrent = computed(() => {
  return sumTime(
    choreMoves.value
      .filter((move) => /sleep|nap/i.test(move.name))
      .map((move) => move.duration)
  );
});
</script>
<style></style>
