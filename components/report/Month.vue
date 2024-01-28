<template>
  <div>
    <h2 class="text-2xl text-center my-3">Month</h2>
    <div v-if="!monthData.length" class="text-center p-12">
      <p class="text-xl">Loading statistics...</p>
    </div>
    <div v-show="monthData.length" class="report content">
      <div
        class="date-hour-chart h-fit min-h-[22rem] relative flex gap-3 items-end justify-center p-3 mt-8 w-fit mx-auto"
      >
        <div class="w-10"></div>
        <div
          v-for="(hour, date) in monthDateHours.value"
          :key="date"
          :class="{ today: date == today }"
        >
          <div class="flex flex-col items-center">
            <div
              class="w-10 column"
              :style="`height:${hour * 20 * UNIT}px; ${
                METRIC[props.group].COLOR
                  ? `background-color:${METRIC[props.group].COLOR} !important`
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
          <div
            @mouseenter="state.showWeekDay = true"
            @mouseleave="state.showWeekDay = false"
            class="cursor-pointer"
          >
            <p class="text-center date bg-teal-600 text-gray-100">
              {{ date.slice(-2) }}
            </p>
          </div>
          <div
            @mouseenter="state.showWeekDay = true"
            @mouseleave="state.showWeekDay = false"
            class="h-6 w-full cursor-pointer"
          >
            <p
              class="text-center text-gray-600"
              :class="{
                'bg-yellow-100': ['Mon'].includes(moment(date).format('ddd')),
                hidden: !state.showWeekDay,
              }"
            >
              {{ moment(date).format('ddd') }}
            </p>
          </div>
        </div>
        <div
          class="absolute w-full p-3 cursor-pointer"
          :style="`bottom:${BASE_HEIGHT + 20 * PERFECT * UNIT}px`"
          :title="'Perfect: ' + PERFECT"
        >
          <span>{{ PERFECT }}</span>
          <hr class="border border-1 border-blue-800" />
        </div>
        <div
          class="absolute w-full p-3 cursor-pointer"
          :style="`bottom:${BASE_HEIGHT + 20 * GREAT * UNIT}px`"
          :title="'Great: ' + GREAT"
        >
          <span>{{ GREAT }}</span>
          <hr class="border border-1 border-blue-800" />
        </div>
        <div
          class="absolute w-full p-3 cursor-pointer"
          :style="`bottom:${BASE_HEIGHT + 20 * MINIMUM * UNIT}px`"
          :title="'Minimum: ' + MINIMUM"
        >
          <span class="absolute left-[-6px] top-[2px]">{{ MINIMUM }}</span>
          <hr class="border border-1 border-gray-700" />
        </div>
        <div
          class="absolute w-full p-3 cursor-pointer"
          :style="`bottom:${BASE_HEIGHT + 20 * LOW * UNIT}px`"
          :title="'Low: ' + LOW"
        >
          <span>{{ LOW }}</span>
          <hr class="border border-1 border-blue-800" />
        </div>
        <div
          class="absolute w-full p-3 cursor-pointer"
          :style="`bottom:${BASE_HEIGHT + 20 * average * UNIT}px`"
          :title="'Avarage: ' + average"
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
      <div class="text-center flex flex-col items-center mb-5">
        <div class="mt-3">
          <p>Minimum: {{ minimum + (minimum < 2 ? ' day' : ' days') }}</p>
          <p>Required: {{ required + (required < 2 ? ' day' : ' days') }}</p>
          <p>Perfect: {{ perfect + (perfect < 2 ? ' day' : ' days') }}</p>
          <p>Average: {{ average }}</p>
          <p>Total: {{ total }}</p>
        </div>
        <div>
          <p class="mb-2 mt-3">
            This week: {{ thisWeekTotal }} - {{ thisWeekAverage }}
          </p>
          <p>
            Week 1: {{ weekTotal[0] }}
            {{ weekAverage[0] ? '- ' + weekAverage[0] : '' }}
          </p>
          <p>
            Week 2: {{ weekTotal[1] }}
            {{ weekAverage[1] ? '- ' + weekAverage[1] : '' }}
          </p>
          <p>
            Week 3: {{ weekTotal[2] }}
            {{ weekAverage[2] ? '- ' + weekAverage[2] : '' }}
          </p>
          <p>
            Week 4: {{ weekTotal[3] }}
            {{ weekAverage[3] ? '- ' + weekAverage[3] : '' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { query, upsert, getById } from '~~/static/db';
import moment from 'moment';
import { sumTime, cvTime, createTimestamp } from '~~/static/time';

const props = defineProps({
  group: {
    type: String,
    required: true,
  },
  metric: {
    type: Object,
    required: true,
  },
});

const BASE_HEIGHT = 48;
const state = reactive({
  showWeekDay: false,
});

const isMonthLoaded = inject('isMonthLoaded');

const today = moment().format('YYYY-MM-DD');
const movesToday = inject('movesToday');
if (!props.group === 'All')
  movesToday.value = movesToday.value.filter((move) => move.grp == props.group);
const hourToday = computed(() => {
  return +(
    cvTime(sumTime(movesToday.value.map((move) => move.duration))) * 24
  ).toFixed(2);
});

const date = ref(today);
// const { minimumRankedHours: MINIMUM } = inject("vars");

const METRIC = props.metric;

const UNIT = METRIC[props.group].UNIT;

const LOW = METRIC[props.group].LOW;
const MINIMUM = METRIC[props.group].MINIMUM;
const GREAT = METRIC[props.group].GREAT;
const PERFECT = METRIC[props.group].PERFECT;

// Month stuff
function addMonth() {
  date.value = moment(date.value).add(1, 'month').format('YYYY-MM-DD');
}
function minusMonth() {
  date.value = moment(date.value).subtract(1, 'month').format('YYYY-MM-DD');
}

watch(date, async () => {
  await getMonthData();
});

let monthDateHours = reactive({ value: {} });
let monthData = ref([]);

const monthStart = computed(() => moment(date.value).startOf('month'));
const monthEnd = computed(() => moment(date.value).endOf('month'));

// Week stuff
const weekNumbers = computed(() => {
  const weeks = [];

  const monthStartWeek = monthStart.value.isoWeek();
  const monthEndWeek = monthEnd.value.isoWeek();
  for (let i = monthStartWeek; i <= monthEndWeek; i++) {
    weeks.push(i);
  }
  return weeks;
});

const weekDates = reactive({});

async function getMonthData() {
  // Fetch data from cache
  // if (!props.group === "All")
  //   data = (await getById("cache", "monthDateHours" + props.group)).data._rawValue;
  // else data = (await getById("cache", "monthDateHours")).data._rawValue;
  // try {
  //   monthDateHours.value = JSON.parse(data.value);
  //   // Filter days of this month
  //   monthDateHours.value = Object.keys(monthDateHours.value)
  //     .filter((d) => d.startsWith(date.value.slice(0, 7)))
  //     .reduce((obj, key) => {
  //       obj[key] = monthDateHours.value[key];
  //       return obj;
  //     }, {});
  //   if (monthDateHours.value?.[today] !== undefined)
  //     monthDateHours.value[today] = hourToday.value;
  //   if (
  //     Object.keys(monthDateHours.value).length !== 0 &&
  //     moment().diff(moment(data.timestamp), "hours") < 6
  //   )
  //     return;
  // } catch (error) {}

  // Fetch data from database
  const monthDates = [];
  monthData = [];
  monthDateHours.value = {};

  let currentDate = monthStart.value.clone();

  while (currentDate.isSameOrBefore(monthEnd.value)) {
    monthDates.push(currentDate.format('YYYY-MM-DD'));
    currentDate.add(1, 'day');
  }

  monthData = (await query('move', 'date', monthDates)).data._rawValue;
  monthData.map((date, index) => {
    monthDateHours.value[monthDates[index]] = +(
      cvTime(
        sumTime(
          date
            .filter((move) => {
              if (!move.done) return false;
              if (props.group === 'All') return true;
              if (props.group === 'MFVN' && move.grp === 'MFVN') {
                return !move.tags.includes('mf-com');
              } else return move.grp == props.group;
            })
            .map((move) => move.duration),
        ),
      ) * 24
    ).toFixed(2);

    //add to week data
    const weekNum = moment(monthDates[index]).isoWeek();
    if (weekDates[weekNum - 1] === undefined) {
      weekDates[weekNum - 1] = [];
    }
    weekDates[weekNum - 1].push([
      monthDates[index],
      monthDateHours.value[monthDates[index]],
    ]);
  });

  isMonthLoaded.value = true;
  upsert('cache', {
    id: 'monthDateHours',
    value: JSON.stringify(monthDateHours.value),
    timestamp: createTimestamp(),
  });
}

// calculate total hours of each week
const weekTotal = computed(() => {
  const weekTotal = [];
  if (!weekNumbers.value) return [];
  if (!weekDates[0]) return [];

  weekNumbers.value.forEach((_, i) => {
    if (weekDates[i].length < 7) return;
    const weekHours = weekDates[i].map(([_, hour]) => hour);
    weekTotal.push(weekHours.reduce((acc, hour) => acc + hour, 0).toFixed(2));
  });

  return weekTotal;
});

const weekAverage = computed(() => {
  const weekAverage = [];
  weekNumbers.value.forEach(async (week, i) => {
    weekDates[i] = Object.entries(monthDateHours.value).filter(
      ([date]) => moment(date).isoWeek() === week,
    );
    if (weekDates[i].length < 7) return;
    weekAverage.push((weekTotal.value[i] / 7).toFixed(2));
  });
  return weekAverage;
});

const weekData = ref([]);
const thisWeekDates = ref([]);
onMounted(async () => {
  await nextTick();
  await getMonthData(today);

  //
  thisWeekDates.value = Object.entries(monthDateHours.value).filter(
    ([date]) => moment(date).isoWeek() === moment().isoWeek(),
  );

  if (thisWeekDates.value.length < 7) {
    thisWeekDates.value = [];
    const startDate = moment().startOf('isoWeek'); // Get the start date of the week /
    const endDate = moment().endOf('isoWeek'); // Get the end date of the week

    let currentDate = startDate.clone();

    while (currentDate.isSameOrBefore(endDate)) {
      weekDates.value.push(currentDate.format('YYYY-MM-DD'));
      currentDate.add(1, 'day');
    }
    weekData.value = (
      await query('move', 'date', weekDates.value)
    ).data._rawValue;
  }
});

// if the current week is not complete, query the week's data from the database
const thisWeekTotal = computed(() => {
  if (weekNumbers.value.includes(moment().isoWeek())) {
    const thisWeekNum = moment().isoWeek();
    const index = weekNumbers.value.indexOf(thisWeekNum);
    return weekTotal.value[index];
  }
  // don't add the week to the monthDateHours object
  // just calculate the total hours of the week
  const weekHours = weekData.value.map((date) => {
    return +(
      cvTime(
        sumTime(
          date
            .filter((move) => {
              if (!move.done) return false;
              if (props.group === 'All') return true;
              if (props.group === 'MFVN' && move.grp === 'MFVN') {
                return !move.tags.includes('mf-com');
              } else return move.grp == props.group;
            })
            .map((move) => move.duration),
        ),
      ) * 24
    ).toFixed(2);
  });
  return weekHours.reduce((acc, hour) => acc + hour, 0).toFixed(2);
});

const thisWeekAverage = computed(() => {
  // remove today's date from the weekDates array
  // calculate the average of the week

  const _thisWeekDates = thisWeekDates.value.filter(([date]) => date !== today);
  const weekHours = _thisWeekDates.map(([_, hour]) => hour);
  const dayCount = _thisWeekDates.length;
  return (weekHours.reduce((acc, hour) => acc + hour, 0) / dayCount).toFixed(2);
});

const minimum = computed(() => {
  return Object.values(monthDateHours.value).reduce(
    (acc, hour) => acc + (hour >= LOW && hour < GREAT ? 1 : 0),
    0,
  );
});
const required = computed(() => {
  return Object.values(monthDateHours.value).reduce(
    (acc, hour) => acc + (hour >= GREAT && hour < PERFECT ? 1 : 0),
    0,
  );
});
const perfect = computed(() => {
  return Object.values(monthDateHours.value).reduce(
    (acc, hour) => acc + (hour >= PERFECT ? 1 : 0),
    0,
  );
});

const average = computed(() => {
  const today = new Date();
  const currentDate = today.toISOString().split('T')[0];
  const pastHours = Object.entries(monthDateHours.value)
    .filter(([date]) => date < currentDate) // Filter out future and today's dates
    .map(([_, hour]) => hour); // Get the hour values
  if (pastHours.length > 0) {
    const sum = pastHours.reduce((total, hour) => total + hour, 0);
    return (sum / pastHours.length).toFixed(2);
  }
  return 0;
});

const total = computed(() => {
  return Object.values(monthDateHours.value)
    .reduce((acc, hour) => acc + hour, 0)
    .toFixed(2);
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
