<template>
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
      ></div>
    </div>
    <div class="stats">
      <div class="rank">
        <h3>Winrate: {{ displayRank?.winrate }}</h3>
        <h3>
          Elo: {{ displayRank?.elo }}
          {{ isPastQuarter ? "" : `(${eloDiff < 0 ? "" : "+"}${eloDiff})` }}
        </h3>
        <h3>
          Rank: <strong>{{ displayRank?.rank }}</strong>
        </h3>
      </div>
      <div class="details pt-2">
        <h3 v-if="!isPastQuarter">
          Next rank: {{ displayRank?.nextRankStreak }}
          {{ displayRank?.nextRankStreak < 2 ? " win" : " wins" }}
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
  <div v-if="dev">
    <Json :value="todayRank" />
    <Json :value="yesterdayRank" />
    <Json :value="dev" />
  </div>
</template>
<script setup>
import { query, upsert, getById } from "~~/static/db";
import moment from "moment";
import { sumTime, cvTime, createTimestamp } from "~~/static/time";
import { deepClone } from "~~/static/utils";

const { minimumRankedHours: minimum } = inject("vars");

const today = moment().format("YYYY-MM-DD");
const todayNum = moment().diff(moment().startOf("quarter"), "days") + 1;

const movesToday = inject("movesToday");
const hourToday = computed(() => {
  return +(
    cvTime(sumTime(movesToday.value.map((move) => move.duration))) * 24
  ).toFixed(2);
});

const date = ref(today);

const isPastQuarter = computed(() => {
  return moment(date.value).isBefore(moment().startOf("quarter"));
});

function addQuarter() {
  date.value = moment(date.value).add(3, "month").format("YYYY-MM-DD");
}
function minusQuarter() {
  date.value = moment(date.value).subtract(3, "month").format("YYYY-MM-DD");
}

watch(date, async () => {
  await getData();
});

let dateHours = reactive({ value: {} });
let data = [];

async function getData() {
  const quarterStart = moment(date.value).startOf("quarter"); // Get the start date of the quarter
  const quarterEnd = moment(date.value).endOf("quarter"); // Get the end date of the quarter

  // Fetch data from cache
  data = (await getById("cache", "dateHoursQuarter")).data._rawValue;
  try {
    dateHours.value = JSON.parse(data.value);
    // Filter days of this quarter
    dateHours.value = Object.keys(dateHours.value)
      .filter((d) => d >= quarterStart && d <= quarterEnd)
      .reduce((obj, key) => {
        obj[key] = dateHours.value[key];
        return obj;
      }, {});
    if (dateHours.value?.[today] !== undefined)
      dateHours.value[today] = hourToday.value;
    if (
      Object.keys(dateHours.value).length !== 0 &&
      moment().diff(moment(data.timestamp), "hours") < 6
    )
      return;
  } catch (error) {}

  // Fetch data from database
  const quarterDates = [];

  let currentDate = quarterStart.clone();

  while (currentDate.isSameOrBefore(quarterEnd)) {
    quarterDates.push(currentDate.format("YYYY-MM-DD"));
    currentDate.add(1, "day");
  }

  data = (await query("move", "date", quarterDates)).data._rawValue;
  data.map((date, index) => {
    dateHours.value[quarterDates[index]] = +(
      cvTime(sumTime(date.map((move) => move.duration))) * 24
    ).toFixed(2);
  });
  upsert("cache", {
    id: "dateHoursQuarter",
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

onMounted(async () => {
  await nextTick();
  await getData(today);
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

  const divions = ["V", "IV", "III", "II", "I"];
  const ranks = [
    "Bronze",
    "Silver",
    "Gold",
    "Platinum",
    "Diamond",
    "Master",
    "Grandmaster",
    "Challenger",
  ];

  return ranks[_rank] + " " + divions[_division];
};

const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");

function getRankInfo(dateHours, date) {
  const winCount = Object.values(dateHours).filter(
    (hour) => hour >= minimum,
  ).length;
  console.log("winCount", winCount);
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
      nextRankStreak = "10+";
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
