<template>
  <EffectShowOnHover>
    <li class="menu-parent-item relative cursor-pointer">
      <NuxtLink v-if="!props.noLink" :to="url">{{ props.name }}</NuxtLink>
      <ul
        class="menu-drop-down absolute top-100 left-0 bg-white list-none border-2 border-gray-300 rounded-b-md shadow-md p-1 flex flex-col gap-3 can-toggle"
      >
        <li
          v-for="child in children"
          class="menu-child-item cursor-pointer hover:bg-slate-100"
        >
          <NuxtLink :to="child.link">{{ child.name }}</NuxtLink>
        </li>
      </ul>
    </li>
  </EffectShowOnHover>
</template>
<script setup>
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
