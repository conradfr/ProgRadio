<template>
  <div class="player-timer" data-bs-toggle="modal" data-bs-target="#timerModal"
       :title="$t('message.player.timer.tooltip')">
    <a :class="{ 'player-timer-active': isActive }">
      <i class="bi bi-clock-history"></i>
    </a>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  compatConfig: {
    MODE: 3
  },
  computed: {
    ...mapState({
      timer: state => state.player.timer
    }),
    isActive() {
      return this.timer !== undefined && this.timer !== null && this.timer !== 0;
    },
    title() {
      if (this.timer === null || this.timer === 0) {
        return this.$i18n.tc('message.player.timer.title');
      }

      return this.$i18n.tc('message.player.timer.end_in', this.timer, { minutes: this.timer });
    }
  }
};
</script>
