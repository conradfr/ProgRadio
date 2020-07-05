<template>
  <transition appear>
    <div v-if="loading" class="loading">
      <div class="alert alert-progradio" role="alert">
      <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>
      Chargement ...
      </div>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState({
      loading: state => state.loading
    })
  },
};
</script>
