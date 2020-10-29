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
          <div class="col-md-12 col-xs-6">
            <div
                v-if="radio.streaming_enabled === true &&
           (playing === false || radio.code_name !== radioPlayingCodeName)"
                v-on:click="play"
                class="schedule-day-play center-block"
            >
              <img :alt="$t('message.radio_page.play', { radio: radio.name })"
                   class="schedule-day-play-button" src="/img/play-button-inside-a-circle.svg">
              <div class="schedule-day-play-text">
                {{ $t('message.radio_page.play', { radio: radio.name }) }}
              </div>
            </div>

            <div
                v-if="radio.streaming_enabled === true &&
              playing === true && radio.code_name === radioPlayingCodeName"
                v-on:click="stop"
                class="schedule-day-play center-block"
            >
              <img :alt="$t('message.radio_page.stop')" class="schedule-day-play-button"
                   src="/img/rounded-pause-button.svg">
              <div class="schedule-day-play-text">
                {{ $t('message.radio_page.stop') }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="radio" class="col-md-10 col-xs-12">
        <div class="title">
          <h5>{{ date | capitalize }}</h5>
          <a v-if="collection" :href="'/#/schedule/' + collection.code_name">
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
  AUTOPLAY_INTERVAL_MAX_RETRIES,
  GTAG_CATEGORY_RADIOPAGE,
  GTAG_ACTION_PLAY,
  GTAG_ACTION_PLAY_VALUE, GTAG_ACTION_STOP, GTAG_ACTION_STOP_VALUE
} from '../config/config';

import RadioShow from './RadioShow.vue';

export default {
  /* eslint-disable no-undef */
  data() {
    return {
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
    this.$store.dispatch('getRadiosData');
    this.$store.dispatch('getSchedule');
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
  components: {
    RadioShow
  },
  computed: {
    ...mapState({
      player: state => state.player,
      playing: state => state.player.playing
    }),
    ...mapGetters([
      'hasSchedule',
      'radioPlayingCodeName'
    ]),
    radio() {
      const index = findIndex(this.$store.state.schedule.radios,
        r => r.code_name === this.$route.params.radio);

      return index === -1 ? null : this.$store.state.schedule.radios[index];
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
    play() {
      if (this.radio.streaming_enabled === true) {
        this.$gtag.event(GTAG_ACTION_PLAY, {
          event_category: GTAG_CATEGORY_RADIOPAGE,
          event_label: this.radio.code_name,
          value: GTAG_ACTION_PLAY_VALUE
        });

        this.$store.dispatch('play', this.radio.code_name);
      }
    },
    stop() {
      if (this.radio.streaming_enabled === true) {
        this.$gtag.event(GTAG_ACTION_STOP, {
          event_category: GTAG_CATEGORY_RADIOPAGE,
          event_label: this.radio.code_name,
          value: GTAG_ACTION_STOP_VALUE
        });

        this.$store.dispatch('stop');
      }
    },
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
