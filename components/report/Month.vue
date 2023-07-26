<template>
  <div
    class="date-hour-chart min-h-[265px] relative flex gap-3 items-end justify-center p-3 mt-24 w-fit mx-auto"
  >
    <div class="w-10"></div>
    <div
      v-for="(hour, date) in dateHours.value"
      :key="date"
      :class="{ today: date == today }"
    >
      <div class="flex flex-col items-center">
        <div
          class="w-10 column"
          :style="`height:${hour * 20 * UNIT}px; ${
            GROUP[props.group].COLOR
              ? `background-color:${GROUP[props.group].COLOR} !important`
              : ''
          }`"
          :class="[
            { 'bg-gray-300': hour < LOW },
            { 'bg-green-500': hour >= LOW && hour < GREAT },
            { 'bg-blue-500': hour >= GREAT && hour < PERFECT },
            { 'bg-yellow-300': hour >= PERFECT },
          ]"
        ></div>
        <p class="absolute z-100 mt-[-22px] duration">
          {{ hour }}
        </p>
      </div>
      <p class="text-center date bg-teal-600 text-gray-100">
        {{ date.slice(-2) }}
      </p>
    </div>
    <div
      class="absolute w-full p-3"
      :style="`bottom:${24 + 20 * PERFECT * UNIT}px`"
    >
      <span>{{ PERFECT }}</span>
      <hr class="border border-1 border-blue-800" />
    </div>
    <div
      class="absolute w-full p-3"
      :style="`bottom:${24 + 20 * GREAT * UNIT}px`"
    >
      <span>{{ GREAT }}</span>
      <hr class="border border-1 border-blue-800" />
    </div>
    <div
      class="absolute w-full p-3"
      :style="`bottom:${24 + 20 * MINIMUM * UNIT}px`"
    >
      <span class="absolute left-[-6px] top-[2px]">{{ MINIMUM }}</span>
      <hr class="border border-1 border-gray-700" />
    </div>
    <div
      class="absolute w-full p-3"
      :style="`bottom:${24 + 20 * LOW * UNIT}px`"
    >
      <span>{{ LOW }}</span>
      <hr class="border border-1 border-blue-800" />
    </div>
    <div
      class="absolute w-full p-3"
      :style="`bottom:${24 + 20 * average * UNIT}px`"
    >
      <span class="absolute left-[-22px] top-[2px]">{{ average }}</span>
      <hr class="border border-1 border-yellow-300" />
    </div>
  </div>
  <div class="text-center">
    <button class="rounded-full" @click="minusMonth">&lt;</button>
    <input v-model="date" class="text-center w-[8rem]" />
    <button class="rounded-full" @click="addMonth">&gt;</button>
  </div>
  <div class="text-center mt-3">
    <p>Minimum: {{ minimum + (minimum < 2 ? " day" : " days") }}</p>
    <p>Required: {{ required + (required < 2 ? " day" : " days") }}</p>
    <p>Perfect: {{ perfect + (perfect < 2 ? " day" : " days") }}</p>
    <p>Average: {{ average }}</p>
  </div>
</template>
<script setup>
import { query, upsert, getById } from "~~/static/db";
import moment from "moment";
import { sumTime, cvTime, createTimestamp } from "~~/static/time";

const props = defineProps({
  group: {
    type: Boolean,
    required: true,
  },
});

const today = moment().format("YYYY-MM-DD");
const movesToday = inject("movesToday");
if (!props.group === "All")
  movesToday.value = movesToday.value.filter((move) => move.grp == props.group);
const hourToday = computed(() => {
  return +(
    cvTime(sumTime(movesToday.value.map((move) => move.duration))) * 24
  ).toFixed(2);
});

const date = ref(today);
// const { minimumRankedHours: MINIMUM } = inject("vars");

const GROUP = {
  Personal: {
    UNIT: 2,
    LOW: 2.5,
    MINIMUM: 3.5,
    GREAT: 5,
    PERFECT: 6,
  },
  All: {
    UNIT: 1,
    LOW: 8,
    MINIMUM: 9,
    GREAT: 11.5,
    PERFECT: 14.3,
  },
  MFVN: {
    UNIT: 3,
    LOW: 1,
    MINIMUM: 3,
    GREAT: 4.5,
    PERFECT: 6,
    COLOR: "#ea5b0c",
  },
  Freelance: {
    UNIT: 3,
    LOW: 1,
    MINIMUM: 3,
    GREAT: 4.5,
    PERFECT: 6,
    COLOR: "#0d9488",
  },
};

const UNIT = GROUP[props.group].UNIT;

const LOW = GROUP[props.group].LOW;
const MINIMUM = GROUP[props.group].MINIMUM;
const GREAT = GROUP[props.group].GREAT;
const PERFECT = GROUP[props.group].PERFECT;

function addMonth() {
  date.value = moment(date.value).add(1, "month").format("YYYY-MM-DD");
}
function minusMonth() {
  date.value = moment(date.value).subtract(1, "month").format("YYYY-MM-DD");
}

watch(date, async () => {
  await getData();
});

let dateHours = reactive({ value: {} });
let data = [];

async function getData() {
  // Fetch data from cache
  // if (!props.group === "All")
  //   data = (await getById("cache", "dateHours" + props.group)).data._rawValue;
  // else data = (await getById("cache", "dateHours")).data._rawValue;
  // try {
  //   dateHours.value = JSON.parse(data.value);
  //   // Filter days of this month
  //   dateHours.value = Object.keys(dateHours.value)
  //     .filter((d) => d.startsWith(date.value.slice(0, 7)))
  //     .reduce((obj, key) => {
  //       obj[key] = dateHours.value[key];
  //       return obj;
  //     }, {});
  //   if (dateHours.value?.[today] !== undefined)
  //     dateHours.value[today] = hourToday.value;
  //   if (
  //     Object.keys(dateHours.value).length !== 0 &&
  //     moment().diff(moment(data.timestamp), "hours") < 6
  //   )
  //     return;
  // } catch (error) {}

  // Fetch data from database
  const monthDates = [];
  const startDate = moment(date.value).startOf("month"); // Get the start date of the month
  const endDate = moment(date.value).endOf("month"); // Get the end date of the month

  let currentDate = startDate.clone();

  while (currentDate.isSameOrBefore(endDate)) {
    monthDates.push(currentDate.format("YYYY-MM-DD"));
    currentDate.add(1, "day");
  }

  data = (await query("move", "date", monthDates)).data._rawValue;
  data.map((date, index) => {
    dateHours.value[monthDates[index]] = +(
      cvTime(
        sumTime(
          date
            .filter((move) => {
              if (props.group === "All") return true;
              else return move.grp == props.group;
            })
            .map((move) => move.duration),
        ),
      ) * 24
    ).toFixed(2);
  });
  upsert("cache", {
    id: "dateHours",
    value: JSON.stringify(dateHours.value),
    timestamp: createTimestamp(),
  });
}

onMounted(async () => {
  await nextTick();
  await getData(today);
});

const minimum = computed(() => {
  return Object.values(dateHours.value).reduce(
    (acc, hour) => acc + (hour >= LOW && hour < GREAT ? 1 : 0),
    0,
  );
});
const required = computed(() => {
  return Object.values(dateHours.value).reduce(
    (acc, hour) => acc + (hour >= GREAT && hour < PERFECT ? 1 : 0),
    0,
  );
});
const perfect = computed(() => {
  return Object.values(dateHours.value).reduce(
    (acc, hour) => acc + (hour >= PERFECT ? 1 : 0),
    0,
  );
});

const average = computed(() => {
  const today = new Date();
  const currentDate = today.toISOString().split("T")[0];
  const pastHours = Object.entries(dateHours.value)
    .filter(([date]) => date < currentDate) // Filter out future and today's dates
    .map(([_, hour]) => hour); // Get the hour values

  if (pastHours.length > 0) {
    const sum = pastHours.reduce((total, hour) => total + hour, 0);
    return (sum / pastHours.length).toFixed(2);
  }
  return 0;
});
</script>
<style>
.today .date {
  @apply font-bold bg-blue-800 text-white;
}
.today .column {
  @apply font-bold bg-yellow-300;
}
</style>
