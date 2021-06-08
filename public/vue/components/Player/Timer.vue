<template>
  <div class="player-timer" :title="title" data-bs-toggle="modal" data-bs-target="#timerModal">
    <a :class="{ 'player-timer-active': isActive }">
      <i class="bi bi-clock-history"></i>
    </a>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import i18n from '../../lang/i18n';

export default {
  computed: {
    ...mapState({
      timer: state => state.player.timer
    }),
    isActive() {
      return this.timer !== undefined && this.timer !== null && this.timer !== 0;
    },
    title() {
      if (this.timer === null || this.timer === 0) {
        return i18n.tc('message.player.timer.title');
      }

      return i18n.tc('message.player.timer.end_in', this.timer, { minutes: this.timer });
    }
  }
};
</script>
