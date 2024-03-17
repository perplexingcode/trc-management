<template>
  <Section title="Data" class="section data">
    <template #action-panel> </template>
    <template #step-0>
      <div>
        <Table
          rows="movesTodayDone"
          columns="moveColumns"
          dbTable="move"
          item-name="move"
          :new-item-tags="getLap"
          :events="events"
        />
      </div>
    </template>
    <template #step-1><p>danchoi</p></template>
    <template #step-2><p>danchoi</p></template>
  </Section>
</template>
<script setup>
import { upsert } from '~~/static/db';
import { deepClone } from '~~/static/utils';

const currentLap = inject('currentLap');
const movesTodayDone = inject('movesTodayDone');
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
      const index = movesTodayDone.value.findIndex((m) => m.id === item.id);
      movesTodayDone.value.splice(index, 1);
      queuedMoves.value.push(item);
      upsert('move', item);
    }
  },
  { deep: true },
);
</script>
<style></style>
