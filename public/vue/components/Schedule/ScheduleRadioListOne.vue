<template>
  <div class="radio-list-one-wrapper">
    <div class="radio-submenu">
      <div v-on:click="toggleFavorite" class="radio-submenu-entry radio-submenu-entry-favorites">
        <img v-if="isFavorite" src="/img/favorite.svg" class="filter-fav"/>
        <p v-if="isFavorite">{{ $t('message.player.favorites.remove') }}</p>
        <img v-if="!isFavorite" src="/img/favorite-empty.svg" class="filter-fav"/>
        <p v-if="!isFavorite">{{ $t('message.player.favorites.add') }}</p>
      </div>
      <a :href="'/' + locale + '/#/radio/' + radio.code_name"
         class="radio-submenu-entry radio-submenu-entry-radiopage">
        <img src="/img/list.svg" class="filter-page"/>
        <p>{{ $t('message.schedule.radio_list.page') }}</p>
      </a>
    </div>
    <a v-on:click="playStop" :title="radio.name">
      <div class="radio-logo"
           :class="{'radio-logo-nohover':  (radio.streaming_enabled === false)}"
           :title="radio.name" :style="styleObject">
        <div class="radio-logo-play"
             :class="{
          'radio-logo-play-active': (radio.code_name === radioPlayingCodeName),
          'radio-logo-play-paused': (playing === false && radio.code_name === radioPlayingCodeName),
          'radio-logo-play-hide': (radio.streaming_enabled === false)
      }">
        </div>
      </div>
    </a>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import {
  COLLECTION_FAVORITES,
  GTAG_CATEGORY_SCHEDULE,
  GTAG_ACTION_FAVORITE_TOGGLE,
  GTAG_ACTION_PLAY,
  GTAG_ACTION_FAVORITE_TOGGLE_VALUE,
  GTAG_ACTION_PLAY_VALUE,
  GTAG_ACTION_STOP,
  GTAG_ACTION_STOP_VALUE
} from '../../config/config';

export default {
  props: ['radio'],
  data() {
    return {
      locale: this.$i18n.locale,
      styleObject: {
        backgroundImage: `url("/img/radio/schedule/${this.radio.code_name}.png")`
      }
    };
  },
  computed: {
    ...mapState({
      playing: state => state.player.playing
    }),
    ...mapGetters([
      'radioPlayingCodeName',
    ]),
    isFavorite() {
      return this.radio.collection.indexOf(COLLECTION_FAVORITES) !== -1;
    },
  },
  methods: {
    playStop() {
      // stop if playing
      if (this.playing === true && this.radioPlayingCodeName === this.radio.code_name) {
        this.$gtag.event(GTAG_ACTION_STOP, {
          event_category: GTAG_CATEGORY_SCHEDULE,
          event_label: this.radio.code_name,
          value: GTAG_ACTION_STOP_VALUE
        });

        this.$store.dispatch('stop');
        return;
      }

      if (this.radio.streaming_enabled === true) {
        this.$gtag.event(GTAG_ACTION_PLAY, {
          event_category: GTAG_CATEGORY_SCHEDULE,
          event_label: this.radio.code_name,
          value: GTAG_ACTION_PLAY_VALUE
        });

        this.$store.dispatch('play', this.radio.code_name);
      }
    },
    toggleFavorite() {
      this.$gtag.event(GTAG_ACTION_FAVORITE_TOGGLE, {
        event_category: GTAG_CATEGORY_SCHEDULE,
        value: GTAG_ACTION_FAVORITE_TOGGLE_VALUE
      });

      this.$store.dispatch('toggleFavorite', this.radio);
    }
  }
};
</script>
