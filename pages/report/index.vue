<template>
  <div class="text-center atomic m-auto mb-3">
    <select @change="changeMode($event)">
      {{
        GROUP[index]
      }}
      <option v-for="(group, i) in GROUP" :key="group" :value="i">
        {{ group }}
      </option>
    </select>
  </div>
  <EffectRerender ref="report">
    <ReportMonth
      :group="GROUP[index]"
      :metric="METRIC"
      class="mx-6 border border-top-1 border-gray-500"
    />
    <ReportQuarter :group="GROUP[index]" :metric="METRIC" class="mt-8" />
  </EffectRerender>
</template>
<script setup>
const index = ref(0);
const GROUP = ['Personal', 'All', 'MFVN', 'Freelance'];
const report = ref(null);

const isMonthLoaded = ref(false);
provide('isMonthLoaded', isMonthLoaded);

function changeMode(event) {
  const selectedIndex = event.target.value;
  index.value = selectedIndex;
  report.value.rerender();
}

const METRIC = {
  Personal: {
    UNIT: 2,
    LOW: 2.5,
    MINIMUM: 3.5,
    GREAT: 5,
    PERFECT: 6,
  },
  All: {
    UNIT: 1,
    LOW: 8,
    MINIMUM: 9,
    GREAT: 11.5,
    PERFECT: 14.3,
  },
  MFVN: {
    UNIT: 3,
    LOW: 3,
    MINIMUM: 4,
    GREAT: 5,
    PERFECT: 6,
    COLOR: '#ea5b0c',
  },
  Freelance: {
    UNIT: 3,
    LOW: 1,
    MINIMUM: 3,
    GREAT: 4,
    PERFECT: 5,
    COLOR: '#0d9488',
  },
};
</script>
<style></style>
