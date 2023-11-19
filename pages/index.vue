<template>
  <div class="border-2 border-gray-200 p-8 m-8 rounded-md">
    <h1 class="text-2xl text-center font-bold mb-5">Navigation form</h1>
    <NoteGroup
      :name="'Navigation-Form-Novelty-' + today"
      type="row"
      group-name="Novelty"
      group-des="Are there any novel elements in the sphere?"
    />
  </div>
</template>

<script setup>
import moment from 'moment';
const today = moment().format('YYYY-MM-DD');
</script>
