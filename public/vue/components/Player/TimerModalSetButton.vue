<template>
  <div class="btn-group" :class="{'hidden-xs': hideMobile}" role="group">
    <a role="button" class="btn btn-primary" v-on:click="setTo">
      {{ $t('message.player.timer.modal.x_minutes', { minutes: minutes }) }}</a>
  </div>
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
      $('#timerModal').modal('hide');
      this.$store.dispatch('setTimer', minutes);
    }
  }
};
</script>
