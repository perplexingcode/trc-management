<template>
  <section
    class="card bg-gray-200 flex flex-col"
    :class="[{ closed: !showSection }]"
  >
    <div class="section header flex justify-between">
      <div class="flex items-center">
        <h2 class="text-xl font-bold text-black">{{ title }}</h2>
        <btn-show-hide
          @click="showSection = !showSection"
          :isDefaultShow="showSection"
        />
      </div>
      <div v-show="showSection" class="action-panel">
        <slot name="action-panel"></slot>
      </div>
      <div v-if="maxStep > 1 && showSection" class="steps flex items-center">
        <button @click="step == 0 || step--">&lt;</button>
        <div
          v-for="(_, index) in maxStep"
          :key="index"
          class="w-4 h-4 bg-gray-500"
          :class="{
            'bg-yellow-500': index == step,
            'mr-2': index != maxStep,
          }"
        ></div>
        <button @click="step == maxStep || step++">&gt;</button>
      </div>
    </div>
    <div v-show="showSection">
      <div v-for="(_, index) in maxStep" :key="index">
        <div v-show="step == index">
          <slot :name="`step-${index}`"></slot>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup>
const props = defineProps({
  title: {
    type: String,
    required: false,
  },
  isDefaultShow: {
    type: Boolean,
    required: false,
    default: true,
  },
});
const $slots = useSlots();
const maxStep = ref(
  Object.keys($slots).filter((slotName) => slotName.includes("step")).length,
);
const showSection = ref(props.isDefaultShow);
const step = ref(0);
</script>
<style>
.closed {
  width: fit-content !important;
}
</style>
