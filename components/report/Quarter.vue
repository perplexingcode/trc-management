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
      <h3>Elo: {{ elo }} ({{ `${eloDiff > 0 ? "+" : "-"}${eloDiff}` }})</h3>
      <h3>
        Rank: <strong>{{ rank }}</strong>
      </h3>
      <h3>
        Next rank: {{ nextRankWins }} {{ nextRankWins < 2 ? " win" : " wins" }}
      </h3>
    </div>
  </div>
  <div class="text-center">
    <button class="rounded-full" @click="minusQuarter">&lt;</button>
    <input v-model="date" class="text-center w-[8rem]" />
    <button class="rounded-full" @click="addQuarter">&gt;</button>
  </div>
</template>
<script setup>
import { query, upsert, getById } from "~~/static/db";
import moment from "moment";
import { sumTime, cvTime, createTimestamp } from "~~/static/time";

const { minimumRankedHours: minimum } = inject("vars");

const today = moment().format("YYYY-MM-DD");
const movesToday = inject("movesToday");
const hourToday = computed(() => {
  return +(
    cvTime(sumTime(movesToday.value.map((move) => move.duration))) * 24
  ).toFixed(2);
});

const date = ref(today);

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

onMounted(async () => {
  await nextTick();
  await getData(today);
});

const winCount = computed(() => {
  return Object.values(dateHours.value).filter((d) => d >= minimum).length;
});

const pastHours = computed(() => {
  const today = new Date();
  const currentDate = today.toISOString().split("T")[0];
  return Object.entries(dateHours.value).filter(([date]) => date < currentDate);
});

const totalMatch = computed(() => {
  return Object.values(pastHours.value).length;
});
const winrate = computed(() => {
  return `${((winCount.value / totalMatch.value) * 100).toFixed(2)}%`;
});

const mmrElo = computed(() => {
  return (parseFloat(winrate.value) / 100) * 4000;
});
const hourElo = computed(() => {
  return pastHours.value.reduce((total, date) => total + date[1], 0);
});

const getElo = (mmr, hour) => {
  return Math.round((mmr + hour) / 2).toFixed(0);
};

const elo = computed(() => {
  return getElo(mmrElo.value, hourElo.value);
});

const getRank = (elo) => {
  const _rank = Math.floor(elo / 500);
  const _division = Math.floor((elo % 500) / 100);

  let division;
  if (_division == 4) division = "I";
  if (_division == 3) division = "II";
  if (_division == 2) division = "III";
  if (_division == 1) division = "IV";
  if (_division == 0) division = "V";

  if (_rank == 7) return "Challenger " + division;
  if (_rank == 6) return "Grandmaster " + division;
  if (_rank == 5) return "Master " + division;
  if (_rank == 4) return "Diamond " + division;
  if (_rank == 3) return "Platinum " + division;
  if (_rank == 2) return "Gold " + division;
  if (_rank == 1) return "Silver " + division;
  if (_rank == 0) return "Bronze " + division;
};

const rank = computed(() => {
  return getRank(elo.value);
});

const nextRankWins = computed(() => {
  const currentRank = getRank(elo.value);
  let nextRank = currentRank;
  let winCount = 0;
  if (!currentRank) return null;
  while (nextRank == currentRank) {
    winCount++;
    nextRank = getRank(elo.value + winCount * minimum);
    if (winCount > 100) return "100+";
  }
  return winCount;
});

const winCountYesterday = computed(() => {
  const dateHoursYesterday = Object.entries(dateHours.value).filter(
    ([date]) => date < today,
  );
  return Object.values(dateHoursYesterday).filter((d) => d >= minimum).length;
});
const pastHoursYesterday = computed(() => {
  const today = new Date();
  const currentDate = today.toISOString().split("T")[0];
  return Object.entries(dateHours.value).filter(
    ([date]) => date < currentDate && date > today.setDate(today.getDate() - 1),
  );
});

const winrateYesterday = computed(() => {
  return `${((winCountYesterday.value / totalMatch.value - 1) * 100).toFixed(
    2,
  )}%`;
});
const mmrEloYesterday = computed(() => {
  return (parseFloat(winrateYesterday.value) / 100) * 4000;
});
const hourEloYesterday = computed(() => {
  return pastHoursYesterday.value.reduce((total, date) => total + date[1], 0);
});
const eloYesterday = computed(() => {
  return getElo(mmrEloYesterday.value, hourEloYesterday.value);
});

const eloDiff = computed(() => {
  return elo.value - eloYesterday.value;
});
</script>
<style></style>
