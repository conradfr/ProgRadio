<template>
  <div :title="$t('message.player.timer.tooltip')"
     class="player-timer" :class="{ 'player-timer-active': timerIsActive }"
     data-bs-toggle="modal" data-bs-target="#timerModal">
    <i class="bi bi-clock-history"></i>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

import { usePlayerStore } from '@/stores/playerStore';

export default defineComponent({
  computed: {
    ...mapState(usePlayerStore, ['timer', 'timerIsActive']),
    title(): string {
      if (this.timer === null || this.timer === 0) {
        return this.$i18n.t('message.player.timer.title');
      }

      return this.$i18n.t(
        'message.player.timer.end_in',
        this.timer,
        { minutes: this.timer }
      );
    }
  }
});
</script>
