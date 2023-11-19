<template>
  <div id="page-today">
    <header class="text-center">
      <h1 class="text-xl">Today</h1>
      <p class="text-center">Today's date is {{ today }}</p>
    </header>
    <section>
      <Tracking />
      <IntelliSense />
      <DataPanel />
    </section>
  </div>
</template>
<script setup>
import moment from 'moment';
const today = moment(new Date()).format('YYYY-MM-DD');
</script>

<style>
.waste-chore input.name {
  width: 12rem;
}
</style>
