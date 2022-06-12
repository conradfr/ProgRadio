<template>
  <div class="radio-list-one-wrapper"
       :class="{'radio-list-one-wrapper-hover': hover}"
       v-on:mouseover.stop="hoverOn()" v-on:mouseleave="hoverOff()">
    <div class="radio-list-one-one-flag"
        v-if="displayFlag">
      <vue-flag
          :code="radio.country_code"
          size="nano"
          v-once
      />
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
        'radio-logo-play-paused': (playing === false && entry.code_name === playingStreamCodeName),
        'radio-logo-play-hide': (radio.streaming_enabled === false)
      }">
          </div>
        </div>
        <p>{{ entry.name }}</p>
      </div>
    </div>
    <a v-on:click="playStop(`${radio.code_name}_main`, false)" :title="radio.name">
      <div class="radio-logo"
           :class="{'radio-logo-nohover':  (radio.streaming_enabled === false)}"
           :title="radio.name" :style="styleObject">
        <div class="radio-logo-play"
           :class="{
          'radio-logo-play-active': radio.code_name === radioPlayingCodeName,
          'radio-logo-play-paused': playing === false && radio.code_name === radioPlayingCodeName,
          'radio-logo-play-hide': radio.streaming_enabled === false,
          'radio-logo-play-secondary':
            (radio.code_name === radioPlayingCodeName
              && playingStreamCodeName !== `${radio.code_name}_main`)
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
  GTAG_ACTION_STOP_VALUE
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
    channelName: string,
    hover: boolean,
    hoverTimer: number|null,
    locale: string,
    styleObject: object,
  } {
    return {
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
    }, 1000);
  },
  beforeUnmount() {
    this.leaveChannel(this.channelName);
  },
  computed: {
    ...mapState(usePlayerStore, [
      'playing',
      'externalPlayer',
      'radioPlayingCodeName',
    ]),
    ...mapState(usePlayerStore, { playingStreamCodeName: 'radioStreamCodeName' }),
    ...mapState(useScheduleStore, { isRadioFavorite: 'isFavorite' }),
    subMenuStyleObject() {
      return {
        width: `${RADIO_MENU_WIDTH * 2}px`,
        left: this.hover ? `${RADIO_MENU_WIDTH}px`
          : `${this.hover ? '' : '-'}${RADIO_MENU_WIDTH * 2}px`
      };
    },
    subMenuStyleObjectStreams() {
      const howMany = Object.keys(this.radio.streams).length > 0
        ? Object.keys(this.radio.streams).length - 1 : 0;
      return {
        width: `${RADIO_MENU_WIDTH * howMany}px`,
        left: this.hover ? `${3 * RADIO_MENU_WIDTH}px`
          : `${this.hover ? '' : '-'}${RADIO_MENU_WIDTH * (2 + howMany)}px`
      };
    },
    secondaryStreams() {
      return filter(this.radio.streams, r => r.main === false);
    },
    isFavorite() {
      return this.isRadioFavorite(this.radio.code_name);
    },
    displayFlag() {
      return this.radio.country_code !== null
        && this.radio.country_code !== RADIO_LIST_IGNORE_COUNTRY;
    }
  },
  methods: {
    ...mapActions(usePlayerStore, ['playRadio', 'stop', 'joinChannel', 'leaveChannel']),
    ...mapActions(useUserStore, ['toggleRadioFavorite']),
    playStop(streamCodeName: string, isSubStream: boolean) {
      // stop if playing
      if (this.playing === true && this.radioPlayingCodeName === this.radio.code_name
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
    }
  }
});
</script>
