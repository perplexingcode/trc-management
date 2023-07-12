<template>
  <div class="chore">
    <h3 class="pr-1 text-center">Chore</h3>
    <div class="pl-10 flex items-center">
      <div v-for="group in choreGroups" :key="group.name">
        <div class="flex px-2">
          <img
            width="22"
            height="22"
            class="mr-1"
            :src="group.img"
            :alt="group.name"
          />
          <p>{{ group.duration }}</p>
        </div>
      </div>
    </div>
    <div class="chore_moves pl-2">
      <Table
        rows="chore"
        columns="wasteChoreColumns"
        item-name="chore"
        addRow="true"
        :is-default-show-rows="false"
      />
    </div>
  </div>
</template>
<script setup>
import { sumTime } from "~~/static/time";

const choreMoves = inject("chore", []);

const choreMoveGroups = [
  {
    regExp: /h|shower|bath|hygience|brushing teeth/i,
    img: "https://img.icons8.com/color/48/water.png",
    name: "hygience",
  },
  {
    regExp: /e|eat|breakfast|lunch|dinner/i,
    img: "https://img.icons8.com/color/48/meal--v1.png",
    name: "meal",
  },
  {
    regExp: /c|cleaning|tidy/i,
    img: "https://img.icons8.com/color/48/cleaning-a-surface.png",
    name: "tidy",
  },
  {
    regExp: /s|sleep|nap/i,
    img: "https://img.icons8.com/color/48/sleep.png",
    name: "sleep",
  },
];

const choreGroups = ref([]);

for (const group of choreMoveGroups) {
  const duration = computed(() => {
    return sumTime(
      choreMoves.value
        .filter((move) => group.regExp.test(move.name))
        .map((move) => move.duration),
    );
  });
  choreGroups.value.push({
    name: group.name,
    img: group.img,
    // moves,
    duration,
  });
}
</script>
<style></style>
