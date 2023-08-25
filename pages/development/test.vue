<template>
  <ChartProgressBar :percent="+percent" class="w-36" />
  <ChartProgressCircle :percent="+percent" :size="circleSize" />
  <input type="range" min="0" max="100" v-model="percent" class="w-full mt-4" />
  <input
    type="range"
    min="0"
    max="100"
    v-model="circleSize"
    class="w-full mt-4"
  />
</template>
<script setup>
const circleSize = ref(60);
const percent = ref(35);
</script>
<style></style>
