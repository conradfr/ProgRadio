<template>
  <div class="container schedule-page" id="schedule-day">
    <div v-if="radio" class="row">
      <div class="col-md-2 col-xs-12">
        <div class="row">
          <div class="col-md-12 col-xs-6">
            <div class="schedule-day-radio center-block">
              <img class="center-block" :alt="radio.name" style="width: 140px;"
                   :src="'/img/radio/page/' + radio.code_name + '.png'">
            </div>
          </div>
          <radio-streams v-if="radio.streaming_enabled" :radio="radio"></radio-streams>
        </div>
      </div>
      <div v-if="radio" class="col-md-10 col-xs-12">
        <div class="title">
          <h5>{{ date | capitalize }}</h5>
          <a v-if="collection" :href="'/' + locale + '/#/schedule/' + collection.code_name">
            {{ $t('message.radio_page.back') }}</a>
        </div>

        <div class="schedule-day-shows">
          <radio-show
            v-for="entry in schedule" :key="entry.hash"
            :show="entry">
          </radio-show>
          <div v-if="!schedule" class="alert alert-warning" role="alert">
            {{ $t('message.radio_page.no_schedule') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import findIndex from 'lodash/findIndex';
import { mapGetters, mapState } from 'vuex';
import { DateTime } from 'luxon';

import {
  TIMEZONE,
  AUTOPLAY_INTERVAL_CHECK,
  AUTOPLAY_INTERVAL_MAX_RETRIES
} from '../config/config';

import RadioShow from './Radio/RadioShow.vue';
import RadioStreams from './Radio/RadioStreams.vue';

export default {
  components: {
    RadioShow,
    RadioStreams
  },
  /* eslint-disable no-undef */
  data() {
    return {
      locale: this.$i18n.locale,
      autoPlayInterval: null,
      autoPlayIntervalCounter: 0,
      date: DateTime.local().setZone(TIMEZONE).setLocale(locale)
        .toLocaleString(
          {
            year: 'numeric', weekday: 'long', month: 'long', day: '2-digit'
          }
        )
    };
  },
  created() {
    setTimeout(
      () => {
        this.$store.dispatch('getRadiosData');
        this.$store.dispatch('getSchedule', { radio: this.$route.params.radio });
      },
      50
    );
  },
  // TODO fix this hack
  mounted() {
    const body = document.querySelector('body');
    body.classList.remove('body-app');

    const app = document.getElementById('app');
    app.classList.add('no-background');

    // if autoplay
    if (this.$route.query.play !== undefined && this.$route.query.play === '1') {
      this.autoPlayInterval = setInterval(this.autoPlay, AUTOPLAY_INTERVAL_CHECK);
    }
  },
  beforeDestroy() {
    const body = document.querySelector('body');
    body.classList.add('body-app');

    const app = document.getElementById('app');
    app.classList.remove('no-background');
  },
  computed: {
    ...mapState({
      player: state => state.player,
      playing: state => state.player.playing,
      radios: state => state.schedule.radios,
      playingStreamCodeName: state => state.player.radioStreamCodeName
    }),
    ...mapGetters([
      'hasSchedule',
      'radioPlayingCodeName'
    ]),
    radio() {
      return this.radios[this.$route.params.radio] === undefined ? null
        : this.radios[this.$route.params.radio];
    },
    schedule() {
      if (this.hasSchedule === true) {
        return this.$store.state.schedule.schedule[this.$route.params.radio];
      }

      return [];
    },
    collection() {
      if (this.radio === null) {
        return null;
      }

      const index = findIndex(this.$store.state.schedule.collections,
        c => c.code_name === this.radio.collection[0]);

      return index === -1 ? null : this.$store.state.schedule.collections[index];
    }
  },
  methods: {
    autoPlay() {
      if (this.radio !== null) {
        clearInterval(this.autoPlayInterval);
        this.play();
        return;
      }

      if (this.autoPlayIntervalCounter > AUTOPLAY_INTERVAL_MAX_RETRIES) {
        clearInterval(this.autoPlayInterval);
      } else {
        this.autoPlayIntervalCounter += 1;
      }
    }
  },
  filters: {
    capitalize(value) {
      if (!value) return '';
      const valueString = value.toString();

      return valueString.charAt(0).toUpperCase() + valueString.slice(1);
    }
  }
};
</script>
