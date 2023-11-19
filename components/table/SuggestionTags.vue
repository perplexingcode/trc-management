<template>
  <div class="suggesion-tags"></div>
</template>
<script setup>
import { query, getAll } from '~~/static/db';
const props = defineProps({
  input: {
    type: String,
    required: true,
  },
});

const tags = await getAll('tag');
// give suggestions based on input
</script>
<style></style>
