<template>
  <div>
    <BtnShowHide @click="show = !show" :is-default-show="false" />
    <div v-show="show" class="ml-8 -mt-6">
      <GetId />
    </div>
  </div>
</template>
<script setup>
const show = ref(false);
</script>
<style></style>
