<template>
  <div id="page-today">
    <header class="text-center">
      <h1 class="text-xl">Today</h1>
      <p class="text-center">Today's date is {{ today }}</p>
    </header>
    <content>
      <div class="intellisense-tracking | flex">
        <IntelliSense />
        <Tracking />
      </div>
      <DataPanel />
    </content>
  </div>
</template>
<script setup></script>

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
