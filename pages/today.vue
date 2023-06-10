<template>
  <div>
    <header class="text-center">
      <h1 class="text-xl">Today</h1>
      <p class="text-center">Today's date is {{ today }}</p>
    </header>

    <div id="dev-panel" class="card bg-secondary hidden">
      <h2>Dev zone</h2>
      <!-- <p>{{ doneTodayMoves }}</p> -->
    </div>
    <div class="intellisense-tracking flex">
      <IntelliSense />
      <Tracking />
    </div>

    <DataPanel />
  </div>
</template>
<script setup></script>

<style>
.section.planning {
  width: 45%;
}
.section.tracking {
  width: 55%;
}

.waste-chore input.name {
  width: 12rem;
}
</style>
