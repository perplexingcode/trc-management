<template>
  <Suspense>
    <template #default>
      <div>
        <table>
          <thead>
            <tr>
              <th v-for="col in columns" :key="col.name">
                {{ col.name }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td v-for="col in Object.keys(columns)" :key="col">
                <input
                  :type="columns[col].type"
                  v-model="row[col]"
                  :disabled="!columns[col].editable"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </Suspense>
</template>

<script setup>
const props = defineProps(['tableData']);
const rows = inject(props.tableData);
const columns = inject('columns');
</script>

<style></style>
