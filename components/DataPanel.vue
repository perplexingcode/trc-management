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
              :new-item-tags="getLap"
              :events="events"
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
import { deepClone } from '~~/static/utils';
const currentLap = inject('currentLap');
const movesToday = inject('movesToday');
const queuedMoves = inject('queuedMoves');
const events = reactive({ done: {} });

function getLap() {
  return 'lap' + currentLap.value;
}

watch(
  () => events.done,
  (data) => {
    const item = deepClone(data.item);
    item.isBeingEdited = false;
    item.isSelected = false;
    if (!data.value) {
      const index = movesToday.value.findIndex((m) => m.id === item.id);
      movesToday.value.splice(index, 1);
      queuedMoves.value.push(item);
    }
  },
  { deep: true },
);
</script>
<style></style>
