<template>
  <div class="space-y-2">
    <p class="leading-none pt-1">Today queued: {{ todayQueuedTime }}</p>
    <p class="leading-none pt-1">
      Today done: {{ todayDoneTime }} | {{ todayDonePercent }}%
    </p>
    <p class="leading-none pt-1">Tomorrow queued: {{ tomorrowQueuedTime }}</p>
    <hr />
    <p class="leading-none pt-1">Week queued: {{ weekQueuedTime }}</p>
    <p class="leading-none pt-1">
      Week done: {{ weekDoneTime }} | {{ donePercent }}%
    </p>
    <hr />
    <p class="leading-none pt-1">Week Mimi: {{ weekMimiTime }}</p>
    <p class="leading-none pt-1">Week service: {{ weekServiceTime }}</p>
    <p class="leading-none pt-1">Week AI: {{ weekAITime }}</p>
    <hr />
    <div class="flex items-center gap-3 mb-3">
      <h3 class="font-bold">Group</h3>
      <select v-model="group" class="w-fit">
        <option v-for="g in Object.keys(groups)" :value="g">{{ g }}</option>
      </select>
    </div>
    <p v-if="moment().isoWeekday() < 2" class="leading-none pt-1">
      Mon: {{ mondayQueuedTime }}
    </p>

    <p v-if="moment().isoWeekday() < 3" class="leading-none pt-1">
      Tue: {{ tuesdayQueuedTime }}
    </p>
    <p v-if="moment().isoWeekday() < 4" class="leading-none pt-1">
      Wed: {{ wednesdayQueuedTime }}
    </p>
    <p v-if="moment().isoWeekday() < 5" class="leading-none pt-1">
      Thu: {{ thursdayQueuedTime }}
    </p>
    <p v-if="moment().isoWeekday() < 6" class="leading-none pt-1">
      Fri: {{ fridayQueuedTime }}
    </p>
    <p v-if="moment().isoWeekday() < 7" class="leading-none pt-1">
      Sat: {{ saturdayQueuedTime }}
    </p>
    <p class="leading-none pt-1">Sun: {{ sundayQueuedTime }}</p>
  </div>
</template>
<script setup>
import { sumTime, cvTime } from '~~/static/time';
import moment from 'moment';

const moves = inject('moves');

const movesTodayDone = inject('movesTodayDone');

const todayDoneTime = computed(() => {
  return sumTime(movesTodayDone.value.map((m) => m.duration));
});

const todayDonePercent = computed(() => {
  return (
    (cvTime(todayDoneTime.value) / cvTime(todayQueuedTime.value)) *
    100
  ).toFixed(2);
});

// calculate time done in a week, be aware that moves and todayDoneMoves can have duplicate moves
const weekDoneTime = computed(() => {
  const startOfWeek = moment().startOf('isoWeek');
  const weekDoneMovesExceptToday = moves.value.filter(
    (m) =>
      moment(m.date).isSameOrAfter(startOfWeek) &&
      m.done &&
      !moment(m.date).isSame(moment(), 'day'),
  );

  return sumTime(
    [...weekDoneMovesExceptToday, ...movesTodayDone.value].map(
      (m) => m.duration,
    ),
  );
});

const queuedMoves = inject('queuedMoves');

const weekQueuedMoves = computed(() => {
  // start of week from monday
  const startOfWeek = moment().startOf('isoWeek');
  return queuedMoves.value.filter((m) =>
    moment(m.date).isSameOrAfter(startOfWeek),
  );
});

const tomorrowQueuedMoves = computed(() => {
  return queuedMoves.value.filter((m) =>
    moment(m.date).isSame(moment().add(1, 'day'), 'day'),
  );
});

const tomorrowQueuedTime = computed(() => {
  return sumTime(tomorrowQueuedMoves.value.map((m) => m.duration));
});

const movesTodayQueued = computed(() => {
  return queuedMoves.value.filter((m) =>
    moment(m.date).isSame(moment(), 'day'),
  );
});

const todayQueuedTime = computed(() => {
  return sumTime(movesTodayQueued.value.map((m) => m.duration));
});

const weekServiceTime = computed(() => {
  return sumTime(
    weekQueuedMoves.value.filter(isService).map((m) => m.duration),
  );
});

const weekQueuedTime = computed(() => {
  return sumTime(weekQueuedMoves.value.map((m) => m.duration));
});

const donePercent = computed(() => {
  return (
    (cvTime(weekDoneTime.value) / cvTime(weekQueuedTime.value)) *
    100
  ).toFixed(2);
});

const group = ref('All');

const groups = {
  All: () => true,
  mimi: isMimi,
  service: isService,
  ai: isAI,
};

const mondayQueuedTime = computed(() => {
  return sumTime(
    weekQueuedMoves.value
      .filter(
        (m) =>
          moment(m.date).isSame(moment().startOf('isoWeek'), 'day') &&
          groups[group.value](m),
      )
      .map((m) => m.duration),
  );
});

const tuesdayQueuedTime = computed(() => {
  return sumTime(
    weekQueuedMoves.value
      .filter(
        (m) =>
          moment(m.date).isSame(
            moment().startOf('isoWeek').add(1, 'day'),
            'day',
          ) && groups[group.value](m),
      )
      .map((m) => m.duration),
  );
});

const wednesdayQueuedTime = computed(() => {
  return sumTime(
    weekQueuedMoves.value
      .filter(
        (m) =>
          moment(m.date).isSame(
            moment().startOf('isoWeek').add(2, 'day'),
            'day',
          ) && groups[group.value](m),
      )
      .map((m) => m.duration),
  );
});

const thursdayQueuedTime = computed(() => {
  return sumTime(
    weekQueuedMoves.value
      .filter(
        (m) =>
          moment(m.date).isSame(
            moment().startOf('isoWeek').add(3, 'day'),
            'day',
          ) && groups[group.value](m),
      )
      .map((m) => m.duration),
  );
});

const fridayQueuedTime = computed(() => {
  return sumTime(
    weekQueuedMoves.value
      .filter(
        (m) =>
          moment(m.date).isSame(
            moment().startOf('isoWeek').add(4, 'day'),
            'day',
          ) && groups[group.value](m),
      )
      .map((m) => m.duration),
  );
});

const saturdayQueuedTime = computed(() => {
  return sumTime(
    weekQueuedMoves.value
      .filter(
        (m) =>
          moment(m.date).isSame(
            moment().startOf('isoWeek').add(5, 'day'),
            'day',
          ) && groups[group.value](m),
      )
      .map((m) => m.duration),
  );
});

const sundayQueuedTime = computed(() => {
  return sumTime(
    weekQueuedMoves.value
      .filter(
        (m) =>
          moment(m.date).isSame(
            moment().startOf('isoWeek').add(6, 'day'),
            'day',
          ) && groups[group.value](m),
      )
      .map((m) => m.duration),
  );
});

const weekAITime = computed(() => {
  return sumTime(weekQueuedMoves.value.filter(isAI).map((m) => m.duration));
});
const weekMimiTime = computed(() => {
  return sumTime(weekQueuedMoves.value.filter(isMimi).map((m) => m.duration));
});

function isMimi(m) {
  return m.prj == 'Trợ lý Mimi';
}

function isService(m) {
  return m.grp == 'MFVN';
}

function isAI(m) {
  return m.prj == 'AI' || m.prj.includes('LLM') || m.name.includes('AI');
}
</script>
<style></style>
