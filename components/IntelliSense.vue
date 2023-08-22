<template>
  <Section title="IntelliSense" class="section planning">
    <template #step-0>
      <div class="action-queue">
        <h3>Action queue</h3>
        <Table
          rows="queuedMove"
          columns="queuedMoveColumns"
          item-name="queued-move"
          add-row
          :suggestion-size="-1"
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
<script setup></script>
<style>
.note-navigation textarea {
  min-height: 360px;
}
</style>
