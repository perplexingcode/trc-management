<template>
  <div class="waste">
    <h3 class="pr-1 text-center">Waste</h3>
    <div class="pl-10 flex items-center">
      <div v-for="group in wasteGroups" :key="group.name">
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
    <div class="waste_moves pl-7">
      <Table
        rows="waste"
        columns="wasteChoreColumns"
        item-name="waste"
        addRow="true"
        :is-default-show-rows="false"
        :show-suggestions="false"
      />
    </div>
  </div>
</template>
<script setup>
import { sumTime } from '~~/static/time';

const wasteMoves = inject('waste', []);

const wasteMoveGroups = [
  {
    regExp: /youtube|yt/i,
    img: 'https://img.icons8.com/fluency/48/youtube-play.png',
    name: 'youtube',
  },
  {
    regExp: /facebook|fb/i,
    img: 'https://img.icons8.com/color/48/000000/facebook-new.png',
    name: 'facebook',
  },
];

const wasteGroups = ref([]);

for (const group of wasteMoveGroups) {
  const duration = computed(() => {
    return sumTime(
      wasteMoves.value
        .filter((move) => group.regExp.test(move.name))
        .map((move) => move.duration)
    );
  });
  wasteGroups.value.push({
    name: group.name,
    img: group.img,
    // moves,
    duration,
  });
}
</script>
<style></style>
