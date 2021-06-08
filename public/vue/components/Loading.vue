<template>
  <transition appear>
    <div class="loading" v-if="isLoading">
      <div class="d-flex align-items-center alert alert-progradio" role="alert">
        <div class="alert-progradio-icon refresh-animate">
          <i class="bi bi-arrow-repeat"></i>
        </div>
        <div class="flex-grow-1 alert-progradio-text text-center">
          {{ $t('message.loading') }}
        </div>
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
