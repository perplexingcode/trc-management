<template>
  <div class="t-card">
    <header>
      <slot name="header"></slot>
    </header>
    <div class="card-body">
      <slot></slot>
    </div>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
<script setup></script>
<style></style>
