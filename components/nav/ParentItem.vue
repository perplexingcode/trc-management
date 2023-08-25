<template>
  <EffectShowOnHover>
    <li class="menu-parent-item cursor-pointer">
      <NuxtLink v-if="!props.noLink" :to="url">{{ props.name }}</NuxtLink>
      <ul class="menu-drop-down flex flex-col list-none can-toggle">
        <li v-for="child in children" class="cursor-pointer">
          <NuxtLink :to="child.link">{{ child.name }}</NuxtLink>
        </li>
      </ul>
    </li>
  </EffectShowOnHover>
</template>
<script setup>
import { onClickOutside } from '@vueuse/core';
const props = defineProps({
  title: String,
  link: String,
  name: String,
  children: Array,
  noLink: {
    type: Boolean,
    default: false,
  },
});

const url = props.link || '/' + props.name.toLowerCase().replace(' ', '-');
const children = ref([]);
for (let i = 0; i < props.children.length; i++) {
  const child = props.children[i];
  // chilren=['name1', 'name2', 'name3']
  if (typeof child === 'string') {
    children.value[i] = {
      name: child,
      link: url + '/' + child.toLowerCase().replace(' ', '-'),
    };
  }
  // children=[{name: 'name1', link: 'link1'}, {name: 'name2', link: 'link2'}]
  if (typeof child === 'object') {
    // absolute url
    if (child.link.includes('*'))
      children.value[i] = {
        name: child.name,
        link: child.link.replace('*', ''),
      };
    // relative url
    else children.value[i] = { name: child.name, link: url + '/' + child.link };
  }
}
</script>
<style>
.menu-parent-item {
  position: relative;
}
.menu-drop-down {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #fff;
  padding: 0;
  margin: 0;
  list-style: none;
  border: 2px solid #ccc;
  border-top: none;
  border-radius: 0 0 5px 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
</style>
