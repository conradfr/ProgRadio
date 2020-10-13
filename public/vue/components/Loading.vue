<template>
  <transition appear>
    <div v-if="isLoading" class="loading">
      <div class="alert alert-progradio" role="alert">
      <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>
      {{ $t('message.loading') }}
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters([
      'isLoading'
    ]),
  },
};
</script>
