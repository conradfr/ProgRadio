<template>
  <div class="schedule-page-streams-one">
    <div
        v-if="player.playing === false || stream.code_name !== playingStreamCodeName"
        v-on:click="play"
        class="schedule-day-play center-block">
      <img :alt="$t('message.radio_page.play', { radio: stream.name })"
           class="schedule-day-play-button" src="/img/play-button-inside-a-circle.svg">
      <div class="schedule-day-play-text">
       {{ $t('message.radio_page.play', { radio: stream.name }) }}
      </div>
    </div>

    <div
        v-if="player.playing === true && stream.code_name === playingStreamCodeName"
        v-on:click="stop"
        class="schedule-day-play center-block">
      <img :alt="$t('message.radio_page.stop')" class="schedule-day-play-button"
           src="/img/rounded-pause-button.svg">
      <div class="schedule-day-play-text">
       {{ $t('message.radio_page.stop') }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import {
  GTAG_CATEGORY_RADIOPAGE,
  GTAG_ACTION_PLAY,
  GTAG_ACTION_PLAY_VALUE, GTAG_ACTION_STOP, GTAG_ACTION_STOP_VALUE
} from '../../config/config';

export default {
  props: ['radio', 'stream'],
  computed: {
    ...mapState({
      player: state => state.player,
      playingStreamCodeName: state => state.player.radioStreamCodeName
    }),
  },
  methods: {
    play() {
      if (this.player.externalPlayer === false) {
        this.$gtag.event(GTAG_ACTION_PLAY, {
          event_category: GTAG_CATEGORY_RADIOPAGE,
          event_label: this.radio.code_name,
          value: GTAG_ACTION_PLAY_VALUE
        });
      }

      this.$store.dispatch('playRadio', {
        radioCodeName: this.radio.code_name,
        streamCodeName: this.stream.code_name
      });
    },
    stop() {
      if (this.player.externalPlayer === false) {
        this.$gtag.event(GTAG_ACTION_STOP, {
          event_category: GTAG_CATEGORY_RADIOPAGE,
          event_label: this.radio.code_name,
          value: GTAG_ACTION_STOP_VALUE
        });
      }

      this.$store.dispatch('stop');
    }
  }
};
</script>
