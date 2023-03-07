<template>
  <p>{{ tasks }}</p>
  <p>dan choi</p>
</template>

<script setup>
let tasks = useFetch('http://localhost:3141/tasks/all');
console.log(tasks);
console.log('parsed', JSON.parse(JSON.stringify(tasks.data))._rawValue);
</script>
