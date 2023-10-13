<template>
  <div class="radio-list-one-wrapper"
       :class="{'radio-list-one-wrapper-hover': hover}"
       v-on:mouseover.stop="hoverOn()" v-on:mouseleave="hoverOff()">
    <div class="radio-list-one-flag"
        v-if="displayFlag">
      <vue-flag
          :code="radio.country_code"
          size="nano"
          v-once
      />
    </div>
    <div class="radio-list-one-listeners" v-if="liveListenersCount && liveListenersCount > 0"
      :title="$t('message.streaming.listeners', { how_many: liveListenersCount})">
      <span class="badge rounded-pill text-bg-dark">
        {{ liveListenersCount }}
      </span>
    </div>
    <div class="radio-subradio"
        v-if="hasSubRadios"
        v-on:click="regionClick"
         v-on:mouseover.stop=""
        :title="$i18n.t('message.schedule.radio_list.pick_region_title')">
      <i class="bi bi-geo-alt"></i>
    </div>
    <div class="radio-submenu"
         :style="subMenuStyleObject"
         :class="{ 'radio-submenu': hover }">
      <div v-on:click="toggleFavorite" class="radio-submenu-entry radio-submenu-entry-favorites">
        <img v-if="isFavorite" src="/img/favorite.svg" class="filter-fav"/>
        <p v-if="isFavorite">{{ $t('message.player.favorites.remove') }}</p>
        <img v-if="!isFavorite" src="/img/favorite-empty.svg" class="filter-fav"/>
        <p v-if="!isFavorite">{{ $t('message.player.favorites.add') }}</p>
      </div>
      <router-link class="radio-submenu-entry radio-submenu-entry-radiopage"
         :to="'/' + locale + '/radio/' + radio.code_name">
        <img src="/img/list.svg" class="filter-page"/>
        <p>{{ $t('message.schedule.radio_list.page') }}</p>
      </router-link>
    </div>
    <div class="radio-submenu radio-submenu-streams"
         :style="subMenuStyleObjectStreams"
         :class="{ 'radio-submenu': hover }">
      <div v-for="entry in secondaryStreams" :key="entry.code_name"
           v-on:click="playStop(entry.code_name, true)" :title="entry.name"
           class="radio-submenu-entry radio-submenu-entry-secondary">
        <div class="radio-submenu-entry-secondary-logo" :style="styleObject">
          <div class="radio-logo-play"
               :class="{
        'radio-logo-play-active': (entry.code_name === playingStreamCodeName),
        'radio-logo-play-paused': (entry.code_name === playingStreamCodeName
          && playing === PlayerStatus.Stopped),
        'radio-logo-play-hide': (radio.streaming_enabled === false)
      }">
          </div>
        </div>
        <p>{{ entry.name }}</p>
      </div>
    </div>
    <a v-on:click="playStop(radio.code_name, false)" :title="radio.name">
      <div class="radio-logo"
           :class="{'radio-logo-nohover':  (radio.streaming_enabled === false)}"
           :title="getSubRadio(radio.code_name).name"
           :style="styleObject">
        <div class="radio-logo-play"
           :class="{
          'radio-logo-play-hide': radio.streaming_enabled === false,
          'radio-logo-play-active': radio.code_name === radioPlayingCodeName,
          'radio-logo-play-paused': radio.code_name === radioPlayingCodeName
            && playing === PlayerStatus.Stopped,
          'radio-logo-play-secondary':
            (radio.code_name === radioPlayingCodeName
              && isWebRadio(radio.code_name, playingStreamCodeName))
          }">
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
import PlayerStatus from '@/types/player_status';

/* eslint-disable import/no-cycle */
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

import PlayerUtils from '../../utils/PlayerUtils';

export default defineComponent({
  props: {
    radio: {
      type: Object as PropType<Radio>,
      required: true
    },
  },
  /* eslint-disable indent */
  data(): {
    PlayerStatus: any,
    channelName: string,
    hover: boolean,
    hoverTimer: number|null,
    locale: string,
    styleObject: object,
  } {
    return {
      PlayerStatus,
      // @dodo fix null mobile app
      channelName: PlayerUtils.getChannelName(this.radio, `${this.radio.code_name}_main`) || '',
      hover: false,
      hoverTimer: null,
      locale: this.$i18n.locale,
      styleObject: {
        backgroundImage: `url("/img/radio/schedule/${this.radio.code_name}.png")`
      }
    };
  },
  created() {
    setTimeout(() => {
      this.joinChannel(this.channelName);
      this.joinListenersChannel(`${this.radio.code_name}_main`);
    }, 1000);
  },
  beforeUnmount() {
    this.leaveChannel(this.channelName);
    this.leaveListenersChannel(`${this.radio.code_name}_main`);
  },
  computed: {
    ...mapState(usePlayerStore, [
      'playing',
      'externalPlayer',
      'radioPlayingCodeName',
      'listeners'
    ]),
    ...mapState(usePlayerStore, { playingStreamCodeName: 'radioStreamCodeName' }),
    ...mapState(useScheduleStore, ['getSubRadio', 'isWebRadio']),
    ...mapState(useScheduleStore, { isRadioFavorite: 'isFavorite' }),
    subMenuStyleObject() {
      return {
        width: `${RADIO_MENU_WIDTH * 2}px`,
        left: this.hover ? `${RADIO_MENU_WIDTH}px`
          : `${this.hover ? '' : '-'}${RADIO_MENU_WIDTH * 2}px`
      };
    },
    subMenuStyleObjectStreams() {
      let howManyStreams: any = filter(this.radio.streams,
        s => s.main === true || !s.sub_radio);
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
      return filter(this.radio.streams, s => s.main === false && !s.sub_radio);
    },
    isFavorite() {
      return this.isRadioFavorite(this.radio.code_name);
    },
    hasSubRadios() {
      return Object.keys(this.radio.sub_radios).length > 1;
    },
    displayFlag() {
      return this.radio.country_code !== null
        && this.radio.country_code !== RADIO_LIST_IGNORE_COUNTRY;
    },
    liveListenersCount() {
      if (!this.radio) {
        return null;
      }

      const topicName = `${this.radio.code_name}_main`;

      if (!Object.prototype.hasOwnProperty.call(this.listeners, topicName)) {
        return null;
      }

      if (!this.listeners[topicName] || this.listeners[topicName] === 0) {
        return null;
      }

      return this.listeners[topicName];
    },
  },
  methods: {
    ...mapActions(useUserStore, ['toggleRadioFavorite']),
    ...mapActions(useScheduleStore, ['activateRegionModal']),
    ...mapActions(usePlayerStore, [
      'playRadio',
      'stop',
      'joinChannel',
      'leaveChannel',
      'joinListenersChannel',
      'leaveListenersChannel'
    ]),
    playStop(radioCodeName: string, isSubStream: boolean) {
      const streamCodeName = isSubStream ? radioCodeName
        : this.getSubRadio(radioCodeName).radio_stream;

      // stop if playing
      if (this.playing !== PlayerStatus.Stopped
        && this.radioPlayingCodeName === this.radio.code_name
        && ((isSubStream && this.playingStreamCodeName === streamCodeName)
          || !isSubStream)) {
        if (this.externalPlayer === false) {
          (this as any).$gtag.event(GTAG_ACTION_STOP, {
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
          (this as any).$gtag.event(GTAG_ACTION_PLAY, {
            event_category: GTAG_CATEGORY_SCHEDULE,
            event_label: this.radio.code_name,
            value: GTAG_ACTION_PLAY_VALUE
          });
        }

        this.playRadio({ radioCodeName: this.radio.code_name, streamCodeName });
      }
    },
    toggleFavorite() {
      (this as any).$gtag.event(GTAG_ACTION_FAVORITE_TOGGLE, {
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
      (this as any).$gtag.event(GTAG_ACTION_REGION_CLICK, {
        event_category: GTAG_CATEGORY_SCHEDULE,
        event_label: this.radio.code_name,
        value: GTAG_ACTION_REGION_VALUE
      });

      this.activateRegionModal(this.radio);
    }
  }
});
</script>
