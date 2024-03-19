<template>
  <Section title="IntelliSense" class="section planning">
    <template #step-0>
      <div class="action-queue">
        <h3>Action queue</h3>
        <div class="flex">
          <Table
            rows="queuedMoves"
            columns="queuedMoveColumns"
            :events="events"
            item-name="move"
            db-table="move"
            add-row
            suggestion-table="move"
            draggable
          />
          <div class="pt-12 ps-3">
            <h3 class="font-bold mb-3">Stats</h3>
            <IntelliSenseStats />
          </div>
        </div>
      </div>
    </template>
    <template #step-1>
      <Card>
        <template #header>
          <h3>Stats</h3>
        </template>
        <IntelliSenseStats />
      </Card>
    </template>
    <template #step-2><p>danchoi</p></template>
  </Section>
</template>
<script setup>
import { upsert } from '~~/static/db';
import { deepClone } from '~~/static/utils';
const queuedMoves = inject('queuedMoves');
const movesTodayDone = inject('movesTodayDone');
const events = reactive({ done: {} });
watch(
  () => events.done,
  (data) => {
    const item = deepClone(data.item);
    item.isBeingEdited = false;
    item.isSelected = false;
    if (data.value) {
      const index = queuedMoves.value.findIndex((m) => m.id === item.id);
      queuedMoves.value.splice(index, 1);
      movesTodayDone.value.push(item);
      upsert('move', item);
    }
  },
  { deep: true },
);
</script>
<style>
.note-navigation textarea {
  min-height: 360px;
}
</style>
