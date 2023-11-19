<template>
  <button @click="isShow = !isShow">
    <svg
      v-if="isShow"
      class="w-3 h-3"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
    >
      <line x1="5" y1="12" x2="19" y2="12" stroke-linecap="round"></line>
    </svg>
    <svg
      v-else
      class="w-3 h-3"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
    >
      <line x1="12" y1="5" x2="12" y2="19" stroke-linecap="round"></line>
      <line x1="5" y1="12" x2="19" y2="12" stroke-linecap="round"></line>
    </svg>
  </button>
</template>
<script setup>
const props = defineProps({
  isDefaultShow: {
    type: Boolean,
    required: false,
    default: true,
  },
  isShow: {
    type: Boolean,
    required: false,
  },
});
const isShow = ref(props.isDefaultShow);
if (props.isShow !== undefined) {
  watch(
    () => props.isShow,
    (val) => {
      isShow.value = val;
    },
  );
}
</script>
<style></style>
