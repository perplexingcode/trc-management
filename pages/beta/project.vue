<template>
  <Notes box="Projects" />
  <div>
    <Table :columns="projectColumns" item-name="project" add-row />
  </div>
</template>
<script setup>
// #PROJECTS
const projectColumns = [
  {
    name: 'Project',
    key: 'name',
    type: 'input',
    disabled: false,
    attrs: { type: 'text' },
  },
  {
    name: 'Hour',
    key: 'hour',
    type: 'input',
    disabled: false,
    attrs: { type: 'text' },
  },
  {
    name: 'Priority',
    key: 'priority',
    type: 'select',
    disabled: false,
    options: [
      'Priority',
      'Active',
      'Pending',
      'Tracked',
      'Deferred',
      'Archived',
    ],
  },
  {
    name: 'Category',
    key: 'cat',
    type: 'select',
    disabled: false,
    options: [
      'Navigation',
      'Cosmic Engine',
      'Engineering',
      'Aesthetics',
      'Business',
    ],
    attrs: { type: 'text', required: true },
  },
];
</script>
