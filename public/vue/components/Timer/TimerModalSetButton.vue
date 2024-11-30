<template>
  <button type="button" class="btn btn-primary" v-on:click="setTo"
    :class="{'d-none d-sm-block': hideMobile}">
    {{ text }}
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions } from 'pinia';

/* eslint-disable import/no-cycle */
import { usePlayerStore } from '@/stores/playerStore';

import {
  GTAG_ACTION_TIMER_QUICK_SET,
  GTAG_CATEGORY_TIMER
} from '@/config/config';

export default defineComponent({
  props: {
    minutes: {
      type: String,
      required: true
    },
    asHour: {
      type: Boolean,
      default: false
    },
    hideMobile: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    text() {
      if (this.asHour) {
        return (this.$i18n as any).tc(
          'message.player.timer.modal.x_hours',
          { hours: (parseInt(this.minutes, 10) / 60) }
        );
      }

      return (this.$i18n as any).tc('message.player.timer.modal.x_minutes', { minutes: this.minutes });
    },
  },
  methods: {
    ...mapActions(usePlayerStore, ['setTimer']),
    setTo() {
      const minutes = parseInt(this.minutes, 10);

      (this as any).$gtag.event(GTAG_ACTION_TIMER_QUICK_SET, {
        event_category: GTAG_CATEGORY_TIMER,
        event_label: `${this.minutes} minutes`,
        value: minutes
      });

      /* eslint-disable no-undef */
      const modalElem = document.getElementById('timerModal');
      // @ts-expect-error bootstrap is defined on global scope
      const modalInstance = bootstrap.Modal.getInstance(modalElem);

      if (modalInstance !== undefined && modalInstance !== null) {
        modalInstance.hide();
      }

      this.setTimer(minutes);
    }
  }
});
</script>
