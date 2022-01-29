<template>
  <div class="streams-one"
    @mouseover="hover = true"
    @mouseleave="hover = false"
    :class="{
     'streams-one-play-active': (radio.code_name === radioPlayingCodeName),
     'streams-one-play-paused': (playing === false && radio.code_name === radioPlayingCodeName)
    }">
    <div class="streams-one-img" :style="styleObject" v-on:click="playStop">
      <div class="streams-one-img-play"></div>
    </div>
    <div class="streams-one-name" :title="$t('message.streaming.more')"
      v-on:click="nameClick(radio.code_name)">
      <span v-once>{{ radio.name }}</span>
      <div v-if="hover === false && currentSong" class="streams-one-song">
        ♫ {{ currentSong }}
      </div>
      <div v-else-if="radio.tags" class="streams-one-tags" v-once>
        <span class="badge badge-inverse"
          v-for="tag in tags()" :key="tag"
          v-on:click.stop="tagClick(tag)">
          {{ tag }}
        </span>
      </div>
    </div>
    <div class="streams-one-fav cursor-pointer"
      :class="{ 'streams-one-fav-isfavorite': isFavorite() }"
         v-on:click.stop="toggleFavorite">
      <img class="streams-one-icon" src="/img/favorites_streams.svg">
    </div>
    <div
        class="streams-one-flag cursor-pointer"
        v-on:click.stop="flagClick"
        v-if="(selectedCountry === code_all
          || selectedCountry === code_favorites || selectedCountry === code_last)
            && radio.country_code !== null">
      <gb-flag
          :code="radio.country_code"
          size="micro"
          v-once
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { nextTick, toRaw } from 'vue';

import * as config from '../../config/config';
import StreamsUtils from '../../utils/StreamsUtils';
import PlayerUtils from '../../utils/PlayerUtils';

export default {
  compatConfig: {
    MODE: 3
  },
  props: ['radio'],
  data() {
    const img = StreamsUtils.getPictureUrl(this.radio);

    return {
      channelName: PlayerUtils.getChannelName(this.radio, this.radio.radio_stream_code_name),
      currentSong: null,
      hover: false,
      code_all: config.STREAMING_CATEGORY_ALL,
      code_last: config.STREAMING_CATEGORY_LAST,
      code_favorites: config.STREAMING_CATEGORY_FAVORITES,
      styleObject: {
        backgroundImage: `url("${img}")`
      }
    };
  },
  beforeMount() {
    this.$store.dispatch('joinChannel', this.channelName);
  },
  beforeUnmount() {
    this.$store.dispatch('leaveChannel', this.channelName);
  },
  computed: {
    ...mapState({
      playing: state => state.player.playing,
      externalPlayer: state => state.player.externalPlayer,
      selectedCountry: state => state.streams.selectedCountry,
      favorites: state => state.streams.favorites,
      song: state => state.player.song,
    }),
    ...mapGetters([
      'radioPlayingCodeName'
    ]),
    liveSong() {
      if (!Object.prototype.hasOwnProperty.call(this.song, this.channelName)) {
        return null;
      }

      return this.song[this.channelName];
    }
  },
  // We do not use the getter player.liveSong due to performance as it would be called each time
  // a song update for any radio by each instances of this component
  watch: {
    liveSong(newVal) {
      const newValObject = toRaw(newVal);

      if (newValObject === null) {
        this.currentSong = null;
        return;
      }

      this.currentSong = PlayerUtils.formatSong(newValObject.song);
    },
  },
  methods: {
    isFavorite() {
      return this.favorites.indexOf(this.radio.code_name) !== -1;
    },
    playStop() {
      // stop if playing
      if (this.playing === true && this.radioPlayingCodeName === this.radio.code_name) {
        if (this.externalPlayer === false) {
          this.$gtag.event(config.GTAG_ACTION_STOP, {
            event_category: config.GTAG_CATEGORY_STREAMING,
            event_label: this.radio.code_name,
            value: config.GTAG_ACTION_STOP_VALUE
          });
        }

        this.$store.dispatch('stop');
        return;
      }

      if (this.externalPlayer === false) {
        this.$gtag.event(config.GTAG_ACTION_PLAY, {
          event_category: config.GTAG_CATEGORY_STREAMING,
          event_label: this.radio.code_name,
          value: config.GTAG_ACTION_PLAY_VALUE
        });
      }

      this.$store.dispatch('playStream', this.radio);
    },
    flagClick() {
      this.$gtag.event(config.GTAG_STREAMING_ACTION_FILTER_COUNTRY, {
        event_category: config.GTAG_CATEGORY_STREAMING,
        event_label: this.radio.country_code.toLowerCase(),
        value: config.GTAG_STREAMING_FILTER_VALUE
      });

      this.$store.dispatch('countrySelection', this.radio.country_code);
    },
    tagClick(tag) {
      this.$gtag.event(config.GTAG_STREAMING_ACTION_TAG, {
        event_category: config.GTAG_CATEGORY_STREAMING,
        event_label: tag.toLowerCase(),
        value: config.GTAG_STREAMING_FILTER_VALUE
      });

      this.$store.dispatch('setSearchText', tag);
      this.$store.dispatch('setSearchActive', true)
        .then(() => {
          nextTick(() => {
            // this.$refs.searchText.focus();
            this.$store.dispatch('getStreamRadios');
          });
        });
    },
    nameClick(id) {
      this.$router.push({
        name: 'streaming',
        params: { countryOrCategoryOrUuid: id }
      });
    },
    toggleFavorite() {
      this.$gtag.event(config.GTAG_ACTION_FAVORITE_TOGGLE, {
        event_category: config.GTAG_CATEGORY_SCHEDULE,
        event_label: this.radio.code_name,
        value: config.GTAG_ACTION_FAVORITE_TOGGLE_VALUE
      });

      this.$store.dispatch('toggleFavorite', this.radio);
    },
    tags() {
      if (this.radio.tags === undefined || this.radio.tags === null) {
        return [];
      }

      return [...new Set(this.radio.tags.split(','))];
    }
  }
};
</script>
