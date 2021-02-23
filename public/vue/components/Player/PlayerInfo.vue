<template>
  <div class="player-infos" :title="showTitle">
    <ul :style="infosUlStyle">
      <li>{{ radioName }}</li>
      <li v-if="show">{{ show.title }}</li>
      <li v-if="currentSong" >{{ currentSong}}</li>
    </ul>
  </div>
</template>

<script>
import { DateTime } from 'luxon';

import { mapState, mapGetters } from 'vuex';

import { TIMEZONE } from '../../config/config';

export default {
  computed: {
    ...mapState({
      radio: state => state.player.radio,
      radioStreamCodeName: state => state.player.radioStreamCodeName,
      show: state => state.player.show
    }),
    ...mapGetters([
      'currentSong'
    ]),
    infosUlStyle() {
      let animationCount = 1;

      if (this.show) {
        animationCount += 1;
      }

      if (this.currentSong) {
        animationCount += 1;
      }

      return {
        // position: 'relative',
        // transform: `translateX(${left}px)`
        animationName: `roll-up-${animationCount}`
      };
    },
    radioName() {
      if (Object.prototype.hasOwnProperty.call(this.radio, 'streams')
          && this.radioStreamCodeName !== null) {
        return this.radio.streams[this.radioStreamCodeName].name;
      }

      return this.radio.name;
    },
    showTitle() {
      if (this.show === null) {
        return '';
      }

      const start = DateTime.fromSQL(this.show.start_at)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);
      const end = DateTime.fromSQL(this.show.end_at)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);

      return `${this.show.title} - ${start}-${end}`;
    },
  }
};
</script>
