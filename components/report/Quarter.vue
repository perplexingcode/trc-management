<template>
  <div>
    <div v-if="!data.length" class="text-center p-12">
      <p class="text-xl">Loading statistics...</p>
    </div>
    <div v-show="data.length" class="report content">
      <div class="rank flex text-center justify-center mt-5">
        <div class="chart w-fit grid gap-2 grid-cols-[repeat(7,1rem)] px-6">
          <div
            v-for="(hour, date) in dateHours.value"
            :key="date"
            class="w-4 h-4"
            :class="{
              'bg-gray-300': date > today,
              'bg-blue-500': date == today,
              'bg-yellow-300': hour >= minimum && date < today,
              'bg-red-600': hour < minimum && date < today,
            }"
            :title="date + ': +' + hour"
          ></div>
        </div>
        <div class="stats">
          <div class="rank">
            <h3>Winrate: {{ displayRank?.winrate }}</h3>
            <h3>
              Elo: {{ displayRank?.elo }}
              {{ isPastQuarter ? '' : `(${eloDiff < 0 ? '' : '+'}${eloDiff})` }}
            </h3>
            <h3>
              Rank: <strong>{{ displayRank?.rank }}</strong>
            </h3>
          </div>
          <div class="details pt-2">
            <h3 v-if="!isPastQuarter">
              Next rank: {{ displayRank?.nextRankStreak }}
              {{ displayRank?.nextRankStreak < 2 ? ' win' : ' wins' }}
            </h3>
            <h3>Total hours: {{ quarterTime }}</h3>
            <h3>Average: {{ quarterAverage }}</h3>
          </div>
        </div>
      </div>
      <div class="text-center">
        <button class="rounded-full" @click="minusQuarter">&lt;</button>
        <input v-model="date" class="text-center w-[8rem]" />
        <button class="rounded-full" @click="addQuarter">&gt;</button>
      </div>
    </div>
  </div>
  <!-- <div v-if="dev">
    <Json :value="todayRank" />
    <Json :value="yesterdayRank" />
    <Json :value="dev" />
  </div> -->
</template>
<script setup>
import { query, upsert, getById } from '~~/static/db';
import moment from 'moment';
import { sumTime, cvTime, createTimestamp } from '~~/static/time';
import { deepClone } from '~~/static/utils';

const props = defineProps({
  group: {
    type: Boolean,
    required: true,
  },
  metric: {
    type: Object,
    required: true,
  },
});

// const { minimumRankedHours: minimum } = inject("vars");
const METRIC = props.metric;
const minimum = METRIC[props.group].MINIMUM;

const today = moment().format('YYYY-MM-DD');
const todayNum = moment().diff(moment().startOf('quarter'), 'days') + 1;

const movesToday = inject('movesToday');
if (!props.group === 'All')
  movesToday.value = movesToday.value.filter((move) => move.grp == props.group);
const hourToday = computed(() => {
  return +(
    cvTime(sumTime(movesToday.value.map((move) => move.duration))) * 24
  ).toFixed(2);
});

const quarterDate = ref(today);

const isPastQuarter = computed(() => {
  return moment(quarterDate.value).isBefore(moment().startOf('quarter'));
});

function addQuarter() {
  quarterDate.value = moment(quarterDate.value)
    .add(3, 'month')
    .format('YYYY-MM-DD');
}
function minusQuarter() {
  quarterDate.value = moment(quarterDate.value)
    .subtract(3, 'month')
    .format('YYYY-MM-DD');
}

watch(quarterDate, async () => {
  await getData();
});

let dateHours = reactive({ value: {} });
let data = [];

async function getData() {
  const quarterStart = moment(quarterDate.value).startOf('quarter'); // Get the start quarterDate of the quarter
  const quarterEnd = moment(quarterDate.value).endOf('quarter'); // Get the end quarterDate of the quarter

  // Fetch data from cache
  // if (!props.group === "All")
  //   data = (await getById("cache", "dateHoursQuarter" + props.group)).data
  //     ._rawValue;
  // else data = (await getById("cache", "dateHoursQuarter")).data._rawValue;
  // try {
  //   dateHours.value = JSON.parse(data.value);
  //   // Filter days of this quarter
  //   dateHours.value = Object.keys(dateHours.value)
  //     .filter((d) => d >= quarterStart && d <= quarterEnd)
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
  const quarterDates = [];
  data = [];
  dateHours.value = {};

  let currentDate = quarterStart.clone();
  while (currentDate.isSameOrBefore(quarterEnd)) {
    quarterDates.push(currentDate.format('YYYY-MM-DD'));
    currentDate.add(1, 'day');
  }

  // For some reason, quarter data is mixed with month data, waiting 0.5s seems to fix it
  await new Promise((resolve) => setTimeout(resolve, 500));

  data = (await query('move', 'date', quarterDates)).data._rawValue;
  data.map((date, index) => {
    dateHours.value[quarterDates[index]] = +(
      cvTime(
        sumTime(
          date
            .filter((move) => {
              if (props.group === 'MFVN' && move.grp === 'MFVN') {
                return !move.tags.includes('mf-com');
              }
              if (props.group === 'All') return true;
              else return move.grp == props.group;
            })
            .map((move) => move.duration),
        ),
      ) * 24
    ).toFixed(2);
  });
  upsert('cache', {
    id: 'dateHoursQuarter',
    value: JSON.stringify(dateHours.value),
    timestamp: createTimestamp(),
  });
}

const quarterTime = computed(() => {
  return Object.values(dateHours.value)
    .reduce((total, hour) => total + hour, 0)
    .toFixed(2);
});

const quarterAverage = computed(() => {
  if (isPastQuarter.value)
    return (quarterTime.value / Object.keys(dateHours.value).length).toFixed(2);
  else return (quarterTime.value / todayNum).toFixed(2);
});
const isMonthLoaded = inject('isMonthLoaded');
onMounted(async () => {
  await nextTick();
  // Wait for isMonthLoaded to be true because Vue mistakenly use quarter data for both components
  await new Promise((resolve) => {
    const interval = setInterval(async () => {
      if (isMonthLoaded.value) {
        clearInterval(interval);
        resolve();
        await getData(today);
      }
    }, 100);
  });
});

const minus1DateHours = computed(() => {
  if (isEmptyDateHours.value) return;
  const _dateHours = deepClone(dateHours.value);
  // delete date after today
  Object.keys(_dateHours).forEach((date) => {
    if (date >= today) delete _dateHours[date];
  });
  return _dateHours;
});

const minus2DateHours = computed(() => {
  if (isEmptyDateHours.value) return;
  const _dateHours = deepClone(minus1DateHours.value);
  delete _dateHours[yesterday];
  return _dateHours;
});

const getRank = (elo) => {
  if (isEmptyDateHours.value) return;
  const _rank = Math.floor(elo / 500);
  const _division = Math.floor((elo % 500) / 100);

  const divions = ['V', 'IV', 'III', 'II', 'I'];
  const ranks = [
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
    'Master',
    'Grandmaster',
    'Challenger',
  ];

  return ranks[_rank] + ' ' + divions[_division];
};

const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');

function getRankInfo(dateHours, date) {
  const winCount = Object.values(dateHours).filter(
    (hour) => hour >= minimum,
  ).length;
  const winrate = winCount / Object.keys(dateHours).length;
  const mmrElo = winrate * 4000;
  const hourElo =
    Object.values(dateHours).reduce((total, hour) => total + hour, 0) * 3.11;
  const elo = (mmrElo + hourElo) / 2;
  const rank = getRank(elo);

  let isPromoted = false;
  let nextRankStreak = 0;
  while (!isPromoted) {
    nextRankStreak++;
    const newElo =
      ((
        ((winCount + nextRankStreak) / (todayNum - 1 + nextRankStreak)) *
        100
      ).toFixed(2) *
        40 +
        hourElo +
        nextRankStreak * minimum) /
      2;
    if (newElo - (newElo % 100) - (elo - (elo % 100)) >= 100) isPromoted = true;
    if (nextRankStreak > 10) {
      nextRankStreak = '10+';
      break;
    }
  }

  return {
    winCount,
    winrate: `${(winrate * 100).toFixed(2)}%`,
    mmrElo: mmrElo.toFixed(0),
    hourElo: hourElo.toFixed(0),
    elo: elo.toFixed(0),
    rank,
    nextRankStreak,
  };
}

const isEmptyDateHours = computed(() => {
  return Object.keys(dateHours.value).length === 0;
});

const displayRank = computed(() => {
  if (isEmptyDateHours.value) return;
  return isPastQuarter.value ? quarterRank.value : todayRank.value;
});

const quarterRank = computed(() => {
  if (isEmptyDateHours.value) return;
  return getRankInfo(dateHours.value);
});

const todayRank = computed(() => {
  if (isEmptyDateHours.value) return;
  return getRankInfo(minus1DateHours.value);
});

const yesterdayRank = computed(() => {
  if (isEmptyDateHours.value) return;
  return getRankInfo(minus2DateHours.value);
});

const eloDiff = computed(() => {
  if (isEmptyDateHours.value) return;
  return todayRank.value.elo - yesterdayRank.value.elo;
});
</script>
<style></style>
