<template>
  <div class="nav">
    <h1 class="text-xl font-bold text-center">This is Management</h1>
    <NavUtil class="fixed top-3 left-3 w-fit" />
    <nav class="flex justify-center mt-2">
      <ul class="flex gap-3">
        <li><NuxtLink to="/today">Today</NuxtLink></li>
        <li><NuxtLink to="/navigation">Navigation</NuxtLink></li>
        <NavParentItem name="Tracking" :children="['Projects']" />
        <li><NuxtLink to="/report">Report</NuxtLink></li>
        <li><NuxtLink to="/note">Note</NuxtLink></li>
        <NavParentItem name="Beta" :children="['Note', 'Project', 'Data']" />
        <NavParentItem
          name="Development"
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
.nav ul li {
  @apply bg-gray-100 hover:bg-accent px-3 py-[1px] rounded-full;
}
.nav ul > li {
  @apply cursor-pointer;
}
</style>
