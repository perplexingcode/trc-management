<template>
  <Section title="Tracking" class="section tracking">
    <template #step-1> </template>
    <template #step-0>
      <div class="flex">
        <TrackingLap />
        <div
          class="report w-fit p-2 ml-3 mr-2 mt-8 rounded border-2 border-white-200"
        >
          <TrackingStatsToday class="w-50" />
        </div>

        <div class="adjustment-panel card bg-secondary flex">
          <div class="waste-chore">
            <WastePanel />
            <ChorePanel />
            <SleepPanel />
          </div>
        </div>
        <div class="notes-box card bg-secondary flex flex-col">
          <h3 class="text-center">Notes</h3>
          <Note
            class="w-80"
            name="general"
            box="general"
            :show-version-history="true"
            show-detail
          />
        </div>
      </div>
    </template>
    <template #step-2><p>danchoi</p></template>
  </Section>
</template>
<script setup></script>
<style></style>
