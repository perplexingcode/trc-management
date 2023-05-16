<template></template>

<script setup>
// Import and preprocess tasks
// let data = (await useFetch(backendUrl + '/task/all')).data;

// const taskStore = useTaskStore();
// let tasks = await taskStore.tasks;

const rows =
  typeof props.rows == 'object' ? props.rows : inject(props.rows, []);
// If rows is undefined then default to [], using assignment operator
rows.value = rows.value || [];
</script>

<style></style>
