<template>
  <Section title="IntelliSense" class="section planning">
    <template #step-0>
      <div class="action-queue">
        <h3>Action queue</h3>
        <Table
          rows="pendingMoves"
          columns="queuedMoveColumns"
          item-name="queued-move"
          add-row
          :events="events"
          suggestion-table="move"
        />
      </div>
    </template>
    <template #step-1>
      <Card>
        <template #header>
          <h3>Navigation</h3>
        </template>
        <Note name="Navigation" box="navigation" class="note-navigation" />
      </Card>
    </template>
    <template #step-2><p>danchoi</p></template>
  </Section>
</template>
<script setup>
import { deepClone } from '~~/static/utils';
const events = reactive({ done: {} });
const movesToday = inject('movesToday');
const queuedMoves = inject('queuedMoves');
watch(
  () => events.done,
  (data) => {
    const item = deepClone(data.item);
    item.isBeingEdited = false;
    item.isSelected = false;
    if (data.value) {
      const index = queuedMoves.value.findIndex((m) => m.id === item.id);
      queuedMoves.value.splice(index, 1);
      movesToday.value.push(item);
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
