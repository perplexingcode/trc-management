<template>
  <p class="text 2xl font-bold">{{ allTime }}h</p>
  <Json :data="moves" />
</template>
<script setup>
import { sumTime } from '~~/static/time';
const _moves = inject('moves');

let moves = _moves.value.filter(
  (move) => move.done && (/gemo/i.test(move.name) || move.prj === 'Gemo'),
);

// update each move's tags
moves = moves.map((move) => {
  move = {
    name: move.name,
    duration: move.duration,
    date: move.date,
  };
  return move;
});

const allTime = computed(() => sumTime(moves.map((move) => move.duration)));
</script>
<style></style>
