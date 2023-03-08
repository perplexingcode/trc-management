<template>
  <p>{{ tasks }}</p>
  <p>dan choi</p>
</template>

<script setup>
import axios from 'axios';
var data = JSON.stringify({
  id: 'E6',
  title: 'Dan choi',
  des: 'lorem ipsum',
  done: false,
  isRep: false,
  start: '2023-03-08 08:30',
  end: '2023-03-08 09:00',
  cat: 'max chat',
  prj: 'Liebesfreud',
  grp: 'Personal',
});

data = {
  id: 'E7',
  title: 'avenge merchandise',
  des: 'Quasi illo delectus consectetur rem dolore et eum rem.',
  done: false,
  start: '2023-08-08 10:44',
  end: '2023-08-08 05:52',
  isRep: false,
  cat: 'Tools',
  prj: 'fascia',
  grp: 'session',
};

var config = {
  method: 'post',
  url: 'http://localhost:3141/tasks/create',
  headers: {
    'Content-Type': 'application/json',
  },
  data: data,
};

axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
</script>
