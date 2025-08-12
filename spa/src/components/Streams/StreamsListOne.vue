<template>
  <div class="streams-one"
    :class="{
     'streams-one-play-active': (radio.code_name === radioPlayingCodeName),
     'streams-one-play-paused': (radio.code_name === radioPlayingCodeName && playing === PlayerStatus.Stopped)
    }"
    @mouseover="hover = true"
    @mouseleave="hover = false">
    <div v-once class="streams-one-img" :style="styleObject" @click="playStop">
      <div class="streams-one-img-play"></div>
    </div>
    <div class="streams-one-name" :title="$t('message.streaming.more')"
      @click="nameClick(radio.code_name)">
      <span v-once class="streams-one-name-detail">{{ radio.name }}</span>
      <div v-if="!hover && currentSong" class="streams-one-song">
        ♫ {{ currentSong }}
      </div>
      <div v-else-if="radio.tags" v-once class="streams-one-tags">
        <span v-for="tag in tags" :key="tag"
          class="badge badge-inverse"
          @click.stop="tagClick(tag)">
          {{ tag }}
        </span>
      </div>
    </div>
    <div class="streams-one-fav cursor-pointer"
      :class="{ 'streams-one-fav-isfavorite': isFavorite }"
      @click.stop="toggleFavorite">
      <img class="streams-one-icon" :alt="radio.code_name" src="/img/favorites_streams.svg">
    </div>
    <div
      v-if="(selectedCountry === code_all
        || selectedCountry === code_favorites || selectedCountry === code_last)
          && radio.country_code !== null"
      class="streams-one-flag cursor-pointer"
      @click.stop="flagClick">
      <vue-flag
        v-once
        :code="radio.country_code"
        size="micro"
      />
    </div>
    <div
        v-if="hasErrors"
        class="streams-one-errors"
        :title="$t('message.streaming.playing_errors')">
      <i class="bi bi-exclamation-circle"></i>
    </div>
    <div v-if="liveListenersCount && liveListenersCount > 0" class="streams-one-listeners"
      :title="$t('message.streaming.listeners', liveListenersCount, { how_many: liveListenersCount})">
      <span class="badge rounded-pill text-bg-secondary">
        {{ liveListenersCount }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, toRaw } from 'vue';
import { mapState, mapActions } from 'pinia';
import type { PropType } from 'vue';

import { useStreamsStore } from '@/stores/streamsStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useUserStore } from '@/stores/userStore';

import type { Stream } from '@/types/stream';
import PlayerStatus from '@/types/player_status';
import StreamsUtils from '@/utils/StreamsUtils';
import PlayerUtils from '@/utils/PlayerUtils';
import * as config from '@/config/config';

// used to space the channel joins a bit
const MAX_RANDOM_MS = 100;

export default defineComponent({
  props: {
    radio: {
      type: Object as PropType<Stream>,
      required: true
    }
  },
  data(): {
    PlayerStatus: any,
    channelName: string,
    currentSong: string|null,
    hover: boolean,
    code_all: string,
    code_last: string,
    code_favorites: string,
    styleObject: any
  } {
    const img = StreamsUtils.getPictureUrl(this.radio);

    return {
      PlayerStatus,
      // @dodo fix null mobile app
      channelName: PlayerUtils.getChannelName(
          this.radio,
          this.radio.radio_stream_code_name
      ) || '',
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
    if (this.song[this.channelName] && this.song[this.channelName].song) {
      this.currentSong = PlayerUtils.formatSong(this.song[this.channelName].song);
    }

    this.joinChannels();
  },
  mounted() {
    document.addEventListener('visibilitychange', this.visibilityChange);
  },
  beforeUnmount() {
    document.removeEventListener('visibilitychange', this.visibilityChange);
    this.leaveChannels();
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
  computed: {
    ...mapState(usePlayerStore, [
      'playing',
      'externalPlayer',
      'song',
      'listeners',
      'radioPlayingCodeName'
    ]),
    ...mapState(useStreamsStore, ['selectedCountry', 'favorites']),
    isFavorite() {
      return this.favorites.indexOf(this.radio.code_name) !== -1;
    },
    hasErrors() {
      return this.radio.playing_error && this.radio.playing_error >= config.ERROR_DISPLAY_THRESHOLD;
    },
    liveSong() {
      if (!Object.prototype.hasOwnProperty.call(this.song, this.channelName)) {
        return null;
      }

      return this.song[this.channelName];
    },
    liveListenersCount() {
      const topicName = this.radio.radio_stream_code_name || this.radio.code_name;

      if (!Object.prototype.hasOwnProperty.call(this.listeners, topicName)) {
        return null;
      }

      if (!this.listeners[topicName] || this.listeners[topicName] === 0) {
        return null;
      }

      return this.listeners[topicName];
    },
    tags() {
      if (!this.radio.tags || typeof this.radio.tags !== 'string') {
        return [];
      }

      return [...new Set(this.radio.tags.split(','))];
    }
  },
  methods: {
    ...mapActions(useUserStore, ['toggleStreamFavorite']),
    ...mapActions(usePlayerStore, [
      'joinChannel',
      'leaveChannel',
      'joinListenersChannel',
      'leaveListenersChannel',
      'stop',
      'playStream'
    ]),
    ...mapActions(useStreamsStore, [
      'countrySelection',
      'setSearchText',
      'setSearchActive',
      'getStreamRadios'
    ]),
    visibilityChange() {
      if (document.hidden) {
        this.leaveChannels();
        return;
      }

      this.joinChannels();
    },
    joinChannels() {
      setTimeout(() => {
        this.joinChannel(this.channelName);
      }, 250 + MAX_RANDOM_MS);

      setTimeout(() => {
        this.joinListenersChannel(this.radio.radio_stream_code_name || this.radio.code_name);
      }, 1000 + MAX_RANDOM_MS);
    },
    leaveChannels() {
      setTimeout(() => {
        this.leaveChannel(this.channelName);
        this.leaveListenersChannel(this.radio.radio_stream_code_name || this.radio.code_name);
      }, 1000);
    },
    playStop() {
      // stop if playing
      if (this.radioPlayingCodeName === this.radio.code_name
        && this.playing !== PlayerStatus.Stopped) {
        if (this.externalPlayer === false) {
          this.$gtag.event(config.GTAG_ACTION_STOP, {
            event_category: config.GTAG_CATEGORY_STREAMING,
            event_label: this.radio.code_name,
            value: config.GTAG_ACTION_STOP_VALUE
          });
        }

        this.stop();
        return;
      }

      if (this.externalPlayer === false) {
        this.$gtag.event(config.GTAG_ACTION_PLAY, {
          event_category: config.GTAG_CATEGORY_STREAMING,
          event_label: this.radio.code_name,
          value: config.GTAG_ACTION_PLAY_VALUE
        });
      }

      this.playStream(this.radio);
    },
    flagClick() {
      this.$gtag.event(config.GTAG_STREAMING_ACTION_FILTER_COUNTRY, {
        event_category: config.GTAG_CATEGORY_STREAMING,
        event_label: this.radio.country_code.toLowerCase(),
        value: config.GTAG_STREAMING_FILTER_VALUE
      });

      this.countrySelection(this.radio.country_code);
    },
    tagClick(tag: string) {
      this.$gtag.event(config.GTAG_STREAMING_ACTION_TAG, {
        event_category: config.GTAG_CATEGORY_STREAMING,
        event_label: tag.toLowerCase(),
        value: config.GTAG_STREAMING_FILTER_VALUE
      });

      if (this.setSearchText(tag)) {
        nextTick(() => {
          // this.$refs.searchText.focus();
          this.getStreamRadios();
        });
      }

      this.setSearchActive(true);
    },
    nameClick(id: string) {
      this.$router.push({
        name: 'streaming',
        params: { countryOrCategoryOrUuid: id, page: null }
      });
    },
    toggleFavorite() {
      this.$gtag.event(config.GTAG_ACTION_FAVORITE_TOGGLE, {
        event_category: config.GTAG_CATEGORY_SCHEDULE,
        event_label: this.radio.code_name,
        value: config.GTAG_ACTION_FAVORITE_TOGGLE_VALUE
      });

      this.toggleStreamFavorite(this.radio);
    }
  }
});
</script>
