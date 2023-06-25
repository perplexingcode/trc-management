<template>
  <div
    class="relative flex gap-3 items-end justify-center p-3 mt-16 w-fit mx-auto"
  >
    <div class="w-10"></div>
    <div v-for="date in result" :key="date.date">
      <div class="flex flex-col items-center">
        <div
          class="w-10 bg-green-100"
          :style="`height:${date.hour * 20}px`"
        ></div>
        <p class="absolute z-100 mt-[-22px]">
          {{ date.hour }}
        </p>
      </div>
      <p class="text-center">{{ date.date.slice(-2) }}</p>
    </div>
    <div class="absolute w-full p-3" :style="`bottom:${24 + 20 * 14.3}px`">
      <span>14.3</span>
      <hr class="border border-1 border-blue-800" />
    </div>
    <div class="absolute w-full p-3" :style="`bottom:${24 + 20 * 11.5}px`">
      <span>11.5</span>
      <hr class="border border-1 border-blue-800" />
    </div>
    <div class="absolute w-full p-3" :style="`bottom:${24 + 20 * 8}px`">
      <span>8</span>
      <hr class="border border-1 border-blue-800" />
    </div>
  </div>
  <div class="text-center">
    <p>Minimum: {{ minimum + (minium < 2 ? ' day' : ' days') }}</p>
    <p>Required: {{ required + (required < 2 ? ' day' : ' days') }}</p>
    <p>Perfect: {{ perfect + (perfect < 2 ? ' day' : ' days') }}</p>
  </div>
</template>
<script setup>
import { query } from '~~/static/db';
import moment from 'moment';
import { sumTime, cvTime } from '~~/static/time';

const monthDates = Array.from({ length: moment().daysInMonth() }, (_, i) =>
  moment()
    .date(i + 1)
    .format('YYYY-MM-DD')
);

const data = (await query('management_move', 'date', monthDates)).data
  ._rawValue;
const result = data.map((date, index) => {
  return {
    date: monthDates[index],
    hour: (cvTime(sumTime(date.map((move) => move.duration))) * 24).toFixed(2),
  };
});

const minimum = result.filter((date) => date.hour > 8).length;
const required = result.filter((date) => date.hour > 11.5).length;
const perfect = result.filter((date) => date.hour > 14.3).length;
</script>
<style></style>
