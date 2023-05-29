<template>
  <button @click="isShow = !isShow" class="btn-circle">
    {{ isShow ? '-' : '+' }}
  </button>
</template>
<script setup>
const props = defineProps({
  isDefaultShow: {
    type: Boolean,
    required: false,
    default: true,
  },
});
const isShow = ref(props.isDefaultShow);
</script>
<style></style>
