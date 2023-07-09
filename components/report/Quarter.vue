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
          'bg-yellow-300': hour >= 11.5,
          'bg-red-600': hour < 11.5,
        }"
      ></div>
    </div>
    <div class="stats">
      <h3>Winrate: {{ winrate }}</h3>
      <h3>Elo: {{ elo }}</h3>
      <h3>
        Rank: <strong>{{ rank }}</strong>
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
  data = (await getById("management_cache", "dateHoursQuarter")).data._rawValue;
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
  upsert("management_cache", {
    id: "dateHoursQuarter",
    value: JSON.stringify(dateHours.value),
    timestamp: createTimestamp(),
  });
}

onMounted(async () => {
  await nextTick();
  await getData(today);
});

const winrate = computed(() => {
  const win = Object.values(dateHours.value).filter((d) => d >= 11.5).length;
  const today = new Date();
  const currentDate = today.toISOString().split("T")[0];
  const pastHours = Object.entries(dateHours.value).filter(
    ([date]) => date < currentDate,
  );
  const total = Object.values(pastHours).length;
  return `${((win / total) * 100).toFixed(2)}%`;
});

const elo = computed(() => {
  const mmrElo = (parseFloat(winrate.value) / 100) * 4000;
  const hourElo = Object.values(dateHours.value).reduce((a, b) => a + b, 0);
  return Math.round((mmrElo + hourElo) / 2).toFixed(0);
});

const rank = computed(() => {
  const _elo = elo.value;
  const _rank = Math.floor(_elo / 500);
  const _division = Math.floor((_elo % 500) / 100);

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
});
</script>
<style></style>
