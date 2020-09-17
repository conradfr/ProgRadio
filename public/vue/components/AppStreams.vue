<template>
  <div class="app-streams">
    <streams-list></streams-list>
  </div>
</template>

<script>
import { mapState } from 'vuex';

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
  computed: {
    ...mapState({
      favorites: state => state.streams.favorites
    })
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (to.params.countryOrCategory) {
        vm.$store.dispatch('countrySelection', to.params.countryOrCategory);
      }
    });
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.countryOrCategory) {
      this.$store.dispatch('countrySelection', to.params.countryOrCategory);
    }
    next();
  },
  watch: {
    // update the stream menu that is outside the Vue app for now
    favorites(val) {
      const menuItem = document.getElementById('streaming-menu-favorites');

      if (val.length === 0) {
        menuItem.classList.add('disabled');
      } else {
        menuItem.classList.remove('disabled');
      }
    },
  },
};
</script>
