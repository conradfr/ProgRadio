<template>
  <div class="radio-list-one-wrapper"
       :class="{'radio-list-one-wrapper-hover': hover}"
       @mouseover.stop="hoverOn()" @mouseleave="hoverOff()">
    <div v-if="displayFlag" class="radio-list-one-flag">
      <vue-flag v-once :code="radio.country_code" size="nano" />
    </div>
    <div v-if="liveListenersCount && liveListenersCount > 0" class="radio-list-one-listeners"
         :title="$t('message.streaming.listeners', { how_many: liveListenersCount})">
      <span class="badge rounded-pill text-bg-dark">
        {{ liveListenersCount }}
      </span>
    </div>
    <div v-if="hasSubRadios"
      class="radio-subradio"
      :title="$t('message.schedule.radio_list.pick_region_title')"
      @click="regionClick"
      @mouseover.stop="">
      <i class="bi bi-geo-alt"></i>
    </div>
    <div class="radio-submenu"
      :class="{ 'radio-submenu': hover }"
      :style="subMenuStyleObject">
      <div class="radio-submenu-entry radio-submenu-entry-favorites" @click="toggleFavorite">
        <img v-if="isFavorite" :src="`${$CDN_BASE_URL}img/favorite_heart.svg`" class="filter-fav" />
        <p v-if="isFavorite">{{ $t('message.player.favorites.remove') }}</p>
        <img v-if="!isFavorite" :src="`${$CDN_BASE_URL}img/favorite-empty_heart.svg`" class="filter-fav" />
        <p v-if="!isFavorite">{{ $t('message.player.favorites.add') }}</p>
      </div>
      <router-link class="radio-submenu-entry radio-submenu-entry-radiopage"
        :to="'/' + locale + '/radio/' + radio.code_name">
        <img :src="`${$CDN_BASE_URL}img/list.svg`" class="filter-page" />
        <p>{{ $t('message.schedule.radio_list.page') }}</p>
      </router-link>
    </div>
    <div class="radio-submenu radio-submenu-streams" :style="subMenuStyleObjectStreams"
      :class="{ 'radio-submenu': hover }">
      <div v-for="entry in secondaryStreams" :key="entry.code_name"
        class="radio-submenu-entry radio-submenu-entry-secondary"
        :title="entry.name"
        @click="playStop(entry)">
        <div class="radio-submenu-entry-secondary-logo" :style="styleObjectRadioStream(entry.radio_stream_code_name)">
          <div class="radio-logo-play"
            :class="{
              'radio-logo-play-active':
                (playingStream && entry.radio_stream_code_name === playingStream.radio_stream_code_name),
              'radio-logo-play-paused':
                (playingStream && entry.radio_stream_code_name === playingStream.radio_stream_code_name
                  && playing === PlayerStatus.Stopped),
              'radio-logo-play-hide': (radio.streaming_enabled === false)
            }">
          </div>
        </div>
        <p>{{ entry.name }}</p>
      </div>
    </div>
    <a :title="title" @click="playStop()">
      <div class="radio-logo" :class="{'radio-logo-nohover': radio.streaming_enabled === false}">
        <div class="radio-logo-bg" :style="styleObject">
          <div class="radio-logo-play"
            :class="{
              'radio-logo-play-hide': radio.streaming_enabled === false,
              'radio-logo-play-active': playingRadio && radio.code_name === playingRadio.code_name,
              'radio-logo-play-paused': playingRadio && radio.code_name === playingRadio.code_name
                && playing === PlayerStatus.Stopped,
              'radio-logo-play-secondary':
                (playingRadio && playingStream && radio.code_name === playingRadio.code_name
                  && !playingStream.is_sub_radio)
            }">
          </div>
        </div>
      </div>
    </a>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { mapState, mapActions } from 'pinia';
import filter from 'lodash/filter';

import type { Radio } from '@/types/radio';
import type { Stream } from '@/types/streams';
import PlayerStatus from '@/types/player_status';

import { useScheduleStore } from '@/stores/scheduleStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useUserStore } from '@/stores/userStore';

import {
  RADIO_MENU_WIDTH,
  RADIO_LIST_IGNORE_COUNTRY,
  GTAG_CATEGORY_SCHEDULE,
  GTAG_ACTION_FAVORITE_TOGGLE,
  GTAG_ACTION_PLAY,
  GTAG_ACTION_FAVORITE_TOGGLE_VALUE,
  GTAG_ACTION_PLAY_VALUE,
  GTAG_ACTION_STOP,
  GTAG_ACTION_STOP_VALUE,
  GTAG_ACTION_REGION_CLICK,
  GTAG_ACTION_REGION_VALUE,
} from '@/config/config';

const MAX_RANDOM_MS = 150;

export default defineComponent({
  props: {
    radio: {
      type: Object as PropType<Radio>,
      required: true
    },
  },
  data(): {
    PlayerStatus: any,
    hover: boolean,
    hoverTimer: number|null,
    locale: string,
    styleObject: object,
  } {
    return {
      PlayerStatus,
      hover: false,
      hoverTimer: null,
      locale: this.$i18n.locale,
      styleObject: {
        backgroundImage: `url("${this.$CDN_BASE_URL}img/radio/schedule/${this.radio.code_name}.png")`
      },
    };
  },
  mounted() {
    document.addEventListener('visibilitychange', this.visibilityChange);
    this.joinChannels();
  },
  beforeUnmount() {
    document.addEventListener('visibilitychange', this.visibilityChange);
    this.leaveChannels();
  },
  computed: {
    ...mapState(useScheduleStore, ['getSubRadio', 'isWebRadio']),
    ...mapState(useScheduleStore, { isRadioFavorite: 'isFavorite' }),
    ...mapState(usePlayerStore, [
      'playing',
      'externalPlayer',
      'listeners',
    ]),
    ...mapState(usePlayerStore, {
      playingStream: 'stream',
      playingRadio: 'radio'
    }),
    title() {
      return this.subRadio ? this.subRadio.name : '';
    },
    subRadio() {
      return this.getSubRadio(this.radio.code_name);
    },
    subMenuStyleObject() {
      return {
        width: `${RADIO_MENU_WIDTH * 2}px`,
        left: this.hover ? `${RADIO_MENU_WIDTH}px`
          : `${this.hover ? '' : '-'}${RADIO_MENU_WIDTH * 2}px`
      };
    },
    subMenuStyleObjectStreams() {
      let howManyStreams: any = filter(this.radio.streams,
        s => s.main === true || !s.is_sub_radio);
      howManyStreams = Object.keys(howManyStreams).length;

      const howMany = howManyStreams > 0
        ? howManyStreams - 1 : 0;
      return {
        width: `${RADIO_MENU_WIDTH * howMany}px`,
        left: this.hover ? `${3 * RADIO_MENU_WIDTH}px`
          : `${this.hover ? '' : '-'}${RADIO_MENU_WIDTH * (2 + howMany)}px`
      };
    },
    secondaryStreams() {
      return filter(this.radio.streams, s => s.is_main_radio === false && !s.is_sub_radio);
    },
    isFavorite() {
      return this.isRadioFavorite(this.radio.code_name);
    },
    hasSubRadios() {
      return (Object.keys(this.radio.streams).length - Object.keys(this.secondaryStreams).length) > 1;
    },
    displayFlag() {
      return this.radio.country_code !== null
        && this.radio.country_code !== RADIO_LIST_IGNORE_COUNTRY;
    },
    liveListenersCount() {
      if (!this.radio) {
        return null;
      }

      if (!Object.prototype.hasOwnProperty.call(this.listeners, this.radio.code_name)) {
        return null;
      }

      if (!this.listeners[this.radio.code_name] || this.listeners[this.radio.code_name] === 0) {
        return null;
      }

      return this.listeners[this.radio.code_name];
    },
  },
  methods: {
    ...mapActions(useUserStore, ['toggleRadioFavorite']),
    ...mapActions(useScheduleStore, ['activateRegionModal']),
    ...mapActions(usePlayerStore, [
      'playRadio',
      'stop',
      'joinListenersChannel',
      'leaveListenersChannel'
    ]),
    styleObjectRadioStream(radioStreamCodeName: string) {
      const logo = this.radio.streams[radioStreamCodeName]
        && this.radio.streams[radioStreamCodeName].has_logo === true ? `page/${radioStreamCodeName}.png`
        : `schedule/${this.radio.code_name}.png`;

      return {
        backgroundImage: `url("${this.$CDN_BASE_URL}img/radio/${logo}")`
      }
    },
    visibilityChange() {
      if (document.hidden) {
        this.leaveChannels();
        return;
      }

      this.joinChannels();
    },
    joinChannels() {
      setTimeout(() => {
        this.joinListenersChannel(this.radio.code_name);
      }, 250 + Math.floor(Math.random() * (MAX_RANDOM_MS - 50 + 1)) + 50);
    },
    leaveChannels() {
      setTimeout(() => {
        this.leaveListenersChannel(this.radio.code_name);
      }, 1000 + Math.floor(Math.random() * (MAX_RANDOM_MS - 50 + 1)) + 50);
    },
    playStop(stream: Stream | null = null) {
      // eslint-disable-next-line no-param-reassign
      stream = stream || this.subRadio;

      // stop if playing
      if (this.playing !== PlayerStatus.Stopped
        && (this.playingStream && stream && stream.id === this.playingStream.id)
        && (this.playingRadio && this.radio && this.radio.code_name === this.playingRadio.code_name)) {
        if (this.externalPlayer === false) {
          this.$gtag.event(GTAG_ACTION_STOP, {
            event_category: GTAG_CATEGORY_SCHEDULE,
            event_label: this.radio.code_name,
            value: GTAG_ACTION_STOP_VALUE
          });
        }

        this.stop();
        return;
      }

      if (this.radio.streaming_enabled) {
        if (this.externalPlayer === false) {
          this.$gtag.event(GTAG_ACTION_PLAY, {
            event_category: GTAG_CATEGORY_SCHEDULE,
            event_label: this.radio.code_name,
            value: GTAG_ACTION_PLAY_VALUE
          });
        }

        this.playRadio({ radio: this.radio, stream });
      }
    },
    toggleFavorite() {
      this.$gtag.event(GTAG_ACTION_FAVORITE_TOGGLE, {
        event_category: GTAG_CATEGORY_SCHEDULE,
        value: GTAG_ACTION_FAVORITE_TOGGLE_VALUE
      });

      this.toggleRadioFavorite(this.radio);
    },
    hoverOn() {
      this.hover = true;

      if (this.hoverTimer !== null) {
        clearTimeout(this.hoverTimer);
      }

      this.hoverTimer = setTimeout(
        () => {
          this.hover = false;
        },
        2250
      );
    },
    hoverOff() {
      if (this.hoverTimer !== null) {
        clearTimeout(this.hoverTimer);
      }

      this.hover = false;
    },
    regionClick() {
      this.$gtag.event(GTAG_ACTION_REGION_CLICK, {
        event_category: GTAG_CATEGORY_SCHEDULE,
        event_label: this.radio.code_name,
        value: GTAG_ACTION_REGION_VALUE
      });

      this.activateRegionModal(this.radio);
    }
  }
});
</script>
