<template>
  <Json :value="vars" title="Vars" />
</template>
<script setup>
import { getAll } from "~~/static/db";
let vars = ref([]);
onMounted(async () => {
  await nextTick();
  vars.value = (await getAll("vars"))._rawValue;
});
</script>
<style></style>
