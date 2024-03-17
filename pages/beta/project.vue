<template>
  <Notes box="Projects" />
  <div>
    <Suspense>
      <template #default>
        <div>
          <Table
            rows="projects"
            db-table="project"
            :columns="projectColumns"
            item-name="project"
            add-row
          />
        </div>
      </template>
      <template #fallback>
        <p>Loading...</p>
      </template>
    </Suspense>
  </div>
</template>
<script setup>
const projects = inject('projects');
const table = ref(null);
watch(
  projects,
  // if rows.length goes from 0 to 1, rerender table
  (newRows, oldRows) => {
    if (oldRows.length === 0 && newRows.length !== 0) {
      // table.value.rerender();
    }
  },
  { deep: true },
);
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
