<template>
  <transition appear>
    <div class="loading" v-if="isLoading">
      <div class="d-flex align-items-center alert alert-progradio" role="alert">
        <div class="spinner-border" role="status"></div>
        <div class="flex-grow-1 alert-progradio-text text-center" v-once>
          {{ $t('message.loading') }}
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  compatConfig: {
    MODE: 3
  },
  computed: {
    ...mapGetters([
      'isLoading'
    ]),
  },
};
</script>
