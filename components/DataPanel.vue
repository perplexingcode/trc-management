<template>
  <Section title="Data" class="section data">
    <template #action-panel> </template>
    <template #step-0>
      <Suspense>
        <template #default>
          <div>
            <Table
              rows="movesToday"
              :columns="moveColumns"
              item-name="move"
              add-row
              allRows="moves"
            />
          </div>
        </template>
        <template #fallback>
          <p>Loading...</p>
        </template>
      </Suspense>
    </template>
    <template #step-1><p>danchoi</p></template>
    <template #step-2><p>danchoi</p></template>
  </Section>
</template>
<script setup>
const moveColumns = inject('moveColumns');
</script>
<style></style>
