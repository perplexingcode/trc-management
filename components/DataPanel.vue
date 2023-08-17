<template>
  <Section title="Data" class="section data">
    <template #action-panel> </template>
    <template #step-0>
      <Suspense>
        <template #default>
          <div>
            <Table
              rows="movesToday"
              columns="moveColumns"
              dbTable="move"
              item-name="move"
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
<script setup></script>
<style></style>
