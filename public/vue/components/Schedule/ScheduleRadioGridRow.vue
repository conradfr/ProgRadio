<template>
  <div class="schedule-radio-grid-row">
    <div v-if="!hasSchedule && displayNoSchedule && isLoading === false"
         class="program-container none" :style="noProgramStyleObject">
      <div class="program">
        <div class="program-inner">{{ $t('message.schedule.no_schedule') }}</div>
      </div>
    </div>
    <template v-if="hasSchedule">
      <schedule-radio-program
        v-for="(entry, key) in schedule"
        :key="key"
        :program="entry"
        :intersectionObserver="intersectionObserver"
        :isIntersecting="intersected.indexOf(entry.hash) !== -1"
        :radioPlaying="playing && playingStreamCodeName === `${radio_code_name}_main`">
      </schedule-radio-program>
    </template>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import ScheduleRadioProgram from './ScheduleRadioProgram.vue';

export default {
  compatConfig: {
    MODE: 3
  },
  components: { ScheduleRadioProgram },
  props: ['radio_code_name', 'displayNoSchedule', 'schedule', 'hasSchedule'],
  data() {
    return {
      intersected: [],
      intersectionObserver: null,
    };
  },
  beforeMount() {
    this.intersectionObserver = new IntersectionObserver(this.handleIntersection);
  },
  computed: {
    ...mapState({
      playing: state => state.player.playing,
      playingStreamCodeName: state => state.player.radioStreamCodeName
    }),
    ...mapGetters([
      'isLoading'
    ]),
    ...mapState({
      noProgramStyleObject(state) {
        return { left: `${state.schedule.scrollIndex}px` };
      },
    })
  },
  methods: {
    handleIntersection(entries) {
      entries.forEach((entry) => {
        const indexOfEntry = this.intersected.indexOf(entry.target.dataset.hash);
        if (entry.isIntersecting === true && indexOfEntry === -1) {
          this.intersected.push(entry.target.dataset.hash);
        } else if (indexOfEntry !== -1) {
          this.intersected.splice(indexOfEntry, 1);
        }

        // this.isIntersecting = entry.isIntersecting;
        // const className = 'visually-hidden';
        // if (entry.isIntersecting && entry.target.classList.contains(className)) {
        //   entry.target.classList.remove(className);
        // } else if (!entry.isIntersecting && !entry.target.classList.contains(className)) {
        //   entry.target.classList.add(className);
        // }
      });
    },
  }
};
</script>
