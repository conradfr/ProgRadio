<template>
  <button type="button" class="btn btn-primary" v-on:click="setTo"
    :class="{'d-none d-sm-block': hideMobile}">
    {{ $t('message.player.timer.modal.x_minutes', { minutes: minutes }) }}
  </button>
</template>

<script>
import {
  GTAG_ACTION_TIMER_QUICK_SET,
  GTAG_CATEGORY_TIMER
} from '../../config/config';

export default {
  props: ['minutes', 'hideMobile'],
  methods: {
    setTo() {
      const minutes = parseInt(this.minutes, 10);

      this.$gtag.event(GTAG_ACTION_TIMER_QUICK_SET, {
        event_category: GTAG_CATEGORY_TIMER,
        event_label: `${this.minutes} minutes`,
        value: minutes
      });

      /* eslint-disable no-undef */
      const modalElem = document.getElementById('timerModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElem);

      if (modalInstance !== undefined && modalInstance !== null) {
        modalInstance.hide();
      }

      this.$store.dispatch('setTimer', minutes);
    }
  }
};
</script>
