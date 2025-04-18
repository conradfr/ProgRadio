<template>
  <button :class="{'d-none d-sm-block': hideMobile}"
    type="button" class="btn btn-primary" @click="setTo">
    {{ text }}
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions } from 'pinia';

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
        return this.$i18n.t(
          'message.player.timer.modal.x_hours',
          { hours: (parseInt(this.minutes, 10) / 60) }
        );
      }

      return this.$i18n.t('message.player.timer.modal.x_minutes', { minutes: this.minutes });
    },
  },
  methods: {
    ...mapActions(usePlayerStore, ['setTimer']),
    setTo() {
      const minutes = parseInt(this.minutes, 10);

      this.$gtag.event(GTAG_ACTION_TIMER_QUICK_SET, {
        event_category: GTAG_CATEGORY_TIMER,
        event_label: `${this.minutes} minutes`,
        value: minutes
      });
      const modalElem = document.getElementById('timerModal');
      // @ts-expect-error bootstrap is defined on global scope
      // eslint-disable-next-line no-undef
      const modalInstance = bootstrap.Modal.getInstance(modalElem);

      if (modalInstance !== undefined && modalInstance !== null) {
        modalInstance.hide();
      }

      this.setTimer(minutes);
    }
  }
});
</script>
