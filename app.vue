<template>
  <main class="main_wrap">
    <Nav class="mt-8" />
    <DataMove>
      <NuxtPage />
    </DataMove>
  </main>
</template>
<script setup>
// Add favicon and title
useHead({
  title: 'This is Management',
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' }],
});

// ULTILITIES
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};
</script>

<style></style>
