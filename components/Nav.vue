<template>
  <div class="nav">
    <h1 class="text-xl font-bold text-center">This is Management</h1>
    <NavUtil class="fixed top-3 left-3 w-fit z-50" />
    <nav class="flex justify-center mt-2">
      <ul class="flex gap-3">
        <li><NuxtLink to="/today">Today</NuxtLink></li>
        <li><NuxtLink to="/navigation">Navigation</NuxtLink></li>
        <NavParentItem name="Tracking" :children="[['Project', '*']]" />
        <li><NuxtLink to="/report">Report</NuxtLink></li>
        <NavParentItem
          name="Beta"
          no-link
          :children="['Note', 'Project', 'Data']"
        />
        <NavParentItem
          name="Development"
          no-link
          :children="[
            'Test',
            'Move',
            'Accounting',
            'Secretary',
            'Category',
            'Group',
            'Settings',
            {
              name: 'Dashboard',
              link: '*/',
            },
          ]"
        />
      </ul>
    </nav>
    <NavLastAction class="mt-2" />
  </div>
</template>
<script setup></script>
<style>
.nav ul li a,
.nav ul li {
  @apply bg-gray-100 rounded-full block;
}
.nav ul li a {
  @apply w-full  px-3 py-[1px];
  -moz-user-select: none; /* Firefox */
  -webkit-user-select: none; /* Safari and Chrome */
  -ms-user-select: none; /* IE/Edge */
  user-select: none;
}
.nav ul li a:not(.no-link) {
  @apply hover:bg-accent;
}
.nav ul > li a {
  @apply cursor-pointer;
}
</style>
