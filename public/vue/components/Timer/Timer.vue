<template>
  <div class="player-timer" :class="{ 'player-timer-active': timerIsActive }"
     data-bs-toggle="modal" data-bs-target="#timerModal"
       :title="$t('message.player.timer.tooltip')">
    <i class="bi bi-clock-history"></i>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

/* eslint-disable import/no-cycle */
import { usePlayerStore } from '@/stores/playerStore';

export default defineComponent({
  computed: {
    ...mapState(usePlayerStore, ['timer', 'timerIsActive']),
    title(): string {
      if (this.timer === null || this.timer === 0) {
        return (this.$i18n as any).tc('message.player.timer.title');
      }

      return (this.$i18n as any).tc(
        'message.player.timer.end_in',
        this.timer,
        { minutes: this.timer }
      );
    }
  }
});
</script>
