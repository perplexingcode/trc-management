<template>
  <p class="text-center">
    Last actions:
    {{
      JSON.stringify(actionTimestamps?.stack)
        .replace(/["\[\]]/g, '')
        .replaceAll(',', ', ')
    }}
  </p>
</template>
<script setup>
import moment from 'moment';
import FILOArray from '~/static/class/FILOArray';

const timeArray = new FILOArray();
timeArray.maxSize = 5;
timeArray.push(moment(new Date()).format('HH:mm'));
const actionTimestamps = ref(timeArray);
if (process.client) {
  var elements = document.getElementsByTagName('*');
  for (var i = 0; i < elements.length; i++) {
    // Attach a click event handler to each element
    elements[i].addEventListener('click', function (event) {
      // Prevent the default behavior of the click event
      actionTimestamps.value.push(moment(new Date()).format('HH:mm'));
    });
    elements[i].addEventListener('change', function (event) {
      // Prevent the default behavior of the click event
      actionTimestamps.value.push(moment(new Date()).format('HH:mm'));
    });
  }
}
</script>
<style></style>
