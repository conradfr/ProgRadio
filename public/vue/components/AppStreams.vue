<template>
  <div class="app-streams">
    <streams-list></streams-list>
  </div>
</template>

<script>

import StreamsList from './StreamsList.vue';

export default {
  created() {
    this.$store.dispatch('getConfig');
    const body = document.querySelector('body');
    body.classList.remove('body-app');
  },
  components: {
    StreamsList
  },
};
</script>
