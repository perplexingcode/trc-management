<template>
  <div>
    <div
      class="relative flex w-full bg-gray-200 rounded-full cursor-pointer"
      :style="`height: ${props.height};`"
      :title="
        percent.toFixed(1) +
        '%' +
        (props.dataTitle ? ' - ' + props.dataTitle : '')
      "
    >
      <div
        v-if="!isUpper"
        class="z-10 absolute w-[1px]"
        :class="`bg-${COLOR_MEDIUM}`"
        :style="`left: ${LOWER}%; height: ${props.height};`"
      ></div>
      <div
        class="z-10 absolute w-[1px]"
        :class="`bg-${COLOR_UPPER}`"
        :style="`left: ${UPPER}%; height: ${props.height};`"
      ></div>
      <div
        class="rounded-l-full"
        :class="`bg-${color} h-${props.height}`"
        :style="`width: ${Math.min(percent, LOWER)}%`"
      ></div>
      <div
        v-if="isUpper || isMedium"
        :class="`bg-${color} h-${props.height}`"
        :style="`width: ${Math.min(percent, UPPER) - LOWER}%`"
      ></div>
      <div
        v-if="isUpper"
        class="rounded-r-full"
        :class="`bg-${color} h-${props.height}`"
        :style="`width: ${percent - UPPER}%`"
      ></div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  percent: {
    type: Number || String,
    required: true,
  },
  height: {
    type: String,
    default: '0.625rem',
  },
  isGood: {
    type: Boolean,
    default: true,
  },
  dataTitle: {
    type: String,
    default: '',
  },
});

const percent = computed(() => +props.percent);

const LOWER = 30;
const UPPER = 80;

const COLOR_LOWER = props.isGood ? 'gray-300' : 'gray-500';
const COLOR_MEDIUM = props.isGood ? 'primary' : 'red-500';
const COLOR_UPPER = props.isGood ? 'accent' : 'red-500';

const isLow = computed(() => percent.value <= LOWER);
const isMedium = computed(
  () => percent.value > LOWER && percent.value <= UPPER,
);
const isUpper = computed(() => percent.value > UPPER);

const color = computed(() => {
  if (percent.value <= LOWER) return COLOR_LOWER;
  if (percent.value <= UPPER) return COLOR_MEDIUM;
  return COLOR_UPPER;
});
</script>
<style></style>
