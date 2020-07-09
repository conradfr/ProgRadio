<template>
  <div class="radio-list-one-wrapper">
    <div class="radio-submenu">
      <div v-on:click="toggleFavorites" class="radio-submenu-entry radio-submenu-entry-favorites">
        <img v-if="isFavorite" src="/img/favorite.svg" class="filter-fav"/>
        <p v-if="isFavorite">Retirer <br>des favoris</p>
        <img v-if="!isFavorite" src="/img/favorite-empty.svg" class="filter-fav"/>
        <p v-if="!isFavorite">Ajouter<br>aux favoris</p>
      </div>
    </div>
    <a v-on:click="play" :title="radio.name">
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
  GTAG_SCHEDULE_ACTION_FAVORITE_TOGGLE,
  GTAG_SCHEDULE_ACTION_PLAY,
  GTAG_SCHEDULE_FAVORITE_TOGGLE_VALUE,
  GTAG_SCHEDULE_PLAY_VALUE
} from '../config/config';

export default {
  props: ['radio'],
  data() {
    return {
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
    play() {
      this.$gtag.event(GTAG_SCHEDULE_ACTION_PLAY, {
        event_category: GTAG_CATEGORY_SCHEDULE,
        value: GTAG_SCHEDULE_PLAY_VALUE
      });

      if (this.radio.streaming_enabled === true) {
        this.$store.dispatch('play', this.radio.code_name);
      }
    },
    toggleFavorites() {
      this.$gtag.event(GTAG_SCHEDULE_ACTION_FAVORITE_TOGGLE, {
        event_category: GTAG_CATEGORY_SCHEDULE,
        value: GTAG_SCHEDULE_FAVORITE_TOGGLE_VALUE
      });

      this.$store.dispatch('toggleFavorites', this.radio.code_name);
    }
  }
};
</script>
