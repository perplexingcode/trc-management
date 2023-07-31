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
      <h3>Winrate: {{ winrate }}</h3>
      <h3>
        Elo: {{ elo }}
        {{ isPastQuarter ? "" : `(${eloDiff < 0 ? "" : "+"}${eloDiff})` }}
      </h3>
      <h3>
        Rank: <strong>{{ rank }}</strong>
      </h3>
      <h3 v-if="!isPastQuarter">
        Next rank: {{ nextRankWins }} {{ nextRankWins < 2 ? " win" : " wins" }}
      </h3>
      <h3 v-if="isPastQuarter">Total hours: {{ quarterTime }}</h3>
      <h3 v-if="isPastQuarter">Average: {{ quarterAverage }}</h3>
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
const todayNum = new Date().getDate();
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
  return (quarterTime.value / Object.keys(dateHours.value).length).toFixed(2);
});

onMounted(async () => {
  await nextTick();
  await getData(today);
});

const minus1DateHours = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  const _dateHours = deepClone(dateHours.value);
  // delete date after today
  Object.keys(_dateHours).forEach((date) => {
    if (date >= today) delete _dateHours[date];
  });
  return _dateHours;
});

const minus2DateHours = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  const _dateHours = deepClone(minus1DateHours.value);
  delete _dateHours[yesterday];
  return _dateHours;
});

const winCount = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  return Object.values(minus1DateHours.value).filter((hour) => hour >= minimum)
    .length;
});

const pastDates = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  return Object.entries(minus1DateHours.value).filter(([date]) => date < today);
});

const winrate = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  return `${((winCount.value / (todayNum - 1)) * 100).toFixed(2)}%`;
});

const mmrElo = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  return (parseFloat(winrate.value) / 100) * 4000;
});
const hourElo = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  // Total hours = 14.3 * 90 = 1287 => 4000 / 1287 = 3.11
  return pastDates.value.reduce((total, date) => total + date[1], 0) * 3.11;
});

const getElo = (mmrElo, hourElo) => {
  if (!Object.keys(dateHours.value).length) return;
  return Math.round((mmrElo + hourElo) / 2).toFixed(0);
};

const elo = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  return getElo(mmrElo.value, hourElo.value);
});

const getRank = (elo) => {
  if (!Object.keys(dateHours.value).length) return;
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

const rank = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  return getRank(elo.value);
});

const nextRankWins = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  let isPromoted = false;
  let addWinCount = 0;
  while (!isPromoted) {
    addWinCount++;
    const newElo = getElo(
      (
        ((winCount.value + addWinCount) / (todayNum - 1 + addWinCount)) *
        100
      ).toFixed(2) * 40,
      hourElo.value + addWinCount * minimum,
    );
    if (newElo - (newElo % 100) - (elo.value - (elo.value % 100)) >= 100)
      isPromoted = true;
    if (addWinCount > 10) return "10+";
  }
  return addWinCount;
});

const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");

const winCountYesterday = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  const minus2DayHour =
    dateHours.value[moment().subtract(2, "days").format("YYYY-MM-DD")];
  console.log(
    "wincountY",
    minus2DayHour < minimum ? winCount.value : winCount.value - 1,
  );
  return minus2DayHour < minimum ? winCount.value : winCount.value - 1;
});

const winrateYesterday = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  console.log(
    `winrateY:${((winCountYesterday.value / (todayNum - 2)) * 100).toFixed(
      2,
    )}%`,
  );
  return `${((winCountYesterday.value / (todayNum - 2)) * 100).toFixed(2)}%`;
});
const mmrEloYesterday = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  console.log("mmrY", (parseFloat(winrateYesterday.value) / 100) * 4000);
  return (parseFloat(winrateYesterday.value) / 100) * 4000;
});

const pastDatesYesterday = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  console.log(yesterday);
  console.log(
    "pastdatesY",
    Object.entries(dateHours.value).filter(([date]) => date < yesterday),
  );
  return Object.entries(dateHours.value).filter(([date]) => date < yesterday);
});
const hourEloYesterday = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  return (
    pastDatesYesterday.value.reduce((total, date) => total + date[1], 0) * 3.11
  );
});
const eloYesterday = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  return getElo(mmrEloYesterday.value, hourEloYesterday.value);
});

function calculateRank(dateHours) {
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
  return {
    winCount,
    winrate: `${(winrate * 100).toFixed(2)}%`,
    mmrElo: mmrElo.toFixed(0),
    hourElo: hourElo.toFixed(0),
    elo: elo.toFixed(0),
    rank,
  };
  // return {
  //   dateHours,
  //   winCount,
  //   winrate,
  //   mmrElo,
  //   hourElo,
  //   elo,
  //   rank,
  // };
}

const todayRank = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  return calculateRank(minus1DateHours.value);
});

const yesterdayRank = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  return calculateRank(minus2DateHours.value);
});

const eloDiff = computed(() => {
  if (!Object.keys(dateHours.value).length) return;
  return todayRank.value.elo - yesterdayRank.value.elo;
});

const dev = computed(() => {
  return {
    dateHours: dateHours.value,
    today: today,
    todayNum: todayNum,
    minus1DateHours: minus1DateHours.value,
    winCount: winCount.value,
    pastDates: pastDates.value,
    winrate: winrate.value,
    mmrElo: mmrElo.value,
    hourElo: hourElo.value,
    elo: elo.value,
    nextRankWins: nextRankWins.value,
    yesterday: yesterday,
    minus2DateHours: minus2DateHours.value,
    winCountYesterday: winCountYesterday.value,
    winrateYesterday: winrateYesterday.value,
    mmrEloYesterday: mmrEloYesterday.value,
    pastDatesYesterday: pastDatesYesterday.value,
    hourEloYesterday: hourEloYesterday.value,
    eloYesterday: eloYesterday.value,
    eloDiff: eloDiff.value,
  };
});
</script>
<style></style>
