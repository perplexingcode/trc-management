<template>
  <h1 class="text-center mt-3">This is Management</h1>
  <NavUtil class="fixed top-3 left-3 w-fit" />
  <nav class="flex justify-center">
    <ul class="flex gap-3">
      <li><NuxtLink to="/today">Today</NuxtLink></li>
      <li><NuxtLink to="/navigation">Navigation</NuxtLink></li>
      <NavParentItem name="Tracking" :children="['', 'Projects', 'Note']" />
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
  <NavLastAction />
</template>
<script setup></script>
<style></style>
