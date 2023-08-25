<template>
  <div id="page-today">
    <header class="text-center">
      <h1 class="text-xl">Today</h1>
      <p class="text-center">Today's date is {{ today }}</p>
    </header>
    <section>
      <div class="intellisense-tracking | flex">
        <IntelliSense />
        <Tracking />
      </div>
      <DataPanel />
    </section>
  </div>
</template>
<script setup>
import moment from 'moment';
const today = moment(new Date()).format('YYYY-MM-DD');
</script>

<style>
.section.planning {
  width: 47%;
}
.section.tracking {
  width: 55%;
}

.waste-chore input.name {
  width: 12rem;
}
</style>
