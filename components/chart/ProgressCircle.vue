<template>
  <div
    class="inline-flex items-center justify-center overflow-hidden rounded-full"
  >
    <svg
      :class="`transform -rotate-90`"
      :style="`height:${props.size}px; width:${props.size}px`"
    >
      <circle
        :color="props.ringColor"
        stroke-width="5"
        stroke="currentColor"
        fill="transparent"
        :r="props.size / 2"
        cx="50%"
        cy="50%"
      />
      <circle
        :color="props.color"
        stroke-width="5"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="circumference - (percent / 100) * circumference"
        stroke-linecap="round"
        stroke="currentColor"
        fill="transparent"
        :r="props.size / 2"
        cx="50%"
        cy="50%"
      />
    </svg>
    <span
      class="absolute"
      :style="`color: ${props.textColor}; font-size: ${props.size * 0.02}rem;`"
      >{{ Math.floor(percent) }}%</span
    >
  </div>
</template>

<script setup>
const props = defineProps({
  percent: {
    type: Number,
    default: 0,
  },
  size: {
    type: Number,
    default: 60, // Default size, you can change this
  },
  color: {
    type: String,
    default: '#ffdb00',
  },
  ringColor: {
    type: String,
    default: '#d1d5db',
  },
  textColor: {
    type: String,
    default: '#ffdb00',
  },
});

const circumference = ref(2 * Math.PI * (props.size / 2));
</script>

<style></style>
