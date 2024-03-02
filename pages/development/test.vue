<template>
  <EffectRerender ref="report">
    <ReportMonth
      :group="GROUP[index]"
      :metric="METRIC"
      class="mx-6 border border-top-1 border-gray-500"
    />
  </EffectRerender>
</template>
<script setup>
const index = ref(0);
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
  'The Merchant': {
    UNIT: 3,
    LOW: 1,
    MINIMUM: 3,
    GREAT: 4,
    PERFECT: 5,
    COLOR: '#0d9488',
  },
  'Kim Assistant': {
    UNIT: 3,
    LOW: 1,
    MINIMUM: 3,
    GREAT: 4,
    PERFECT: 5,
    COLOR: '#0d9488',
  },
};
const GROUP = Object.keys(METRIC);
</script>
<style></style>
