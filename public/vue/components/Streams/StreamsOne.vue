<template>
  <div class="container stream-page mt-1" v-if="stream">
    <div class="row">
      <div class="col-sm-2 col-12">
        <div class="radio-page-side sticky">
          <div class="text-center mb-4">
            <img class="radio-page-logo" :alt="stream.name" :src="img">
          </div>
          <div class="text-center cursor-pointer mb-4"
               :title="$t('message.streaming.close')"
               v-on:click="quit"
          ><i class="bi bi-arrow-left"></i> {{ $t('message.streaming.close') }}</div>
        </div>
      </div>
      <div class="col-sm-7 col-10 offset-1 offset-sm-0 pb-3">
        <div class="row">
          <div class="col-sm-9 col-12">
            <div class="d-none d-md-block float-end cursor-pointer"
              :title="$t('message.streaming.close')"
              v-on:click="quit"
            ><i class="bi bi-x-lg"></i></div>
            <div v-if="userLogged && userIsAdmin" class="d-none d-md-block float-end me-4">
              <a class="link-no-to-bold" v-on:click="copyIdToClipboard">Copy id</a>&nbsp;-&nbsp;<a target="_blank" :href="`/admin/overloading/${stream.code_name}`">Edit</a>
            </div>
            <h4 class="mb-4">{{ stream.name }}</h4>

            <div class="stream-page-stream mt-3 mb-5">
              <div class="radio-page-streams-one d-flex
                align-items-center justify-content-center justify-content-sm-start">
                <div>
                  <div
                    v-if="stream.code_name !== radioPlayingCodeName
                      || playing === PlayerStatus.Stopped"
                    v-on:click="playStop"
                    class="radio-page-play">
                    <img :alt="$t('message.streaming.play', { radio: stream.name})"
                      src="/img/play-button-inside-a-circle.svg">
                  </div>
                  <div
                    v-if="stream.code_name === radioPlayingCodeName
                      && playing !== PlayerStatus.Stopped"
                    v-on:click="playStop"
                    class="radio-page-play">
                    <img :alt="$t('message.streaming.stop')"
                      src="/img/rounded-pause-button.svg">
                  </div>
                </div>

                <div class="ps-2">
                  <div
                    v-if="stream.code_name !== radioPlayingCodeName
                      || playing === PlayerStatus.Stopped"
                    v-on:click="playStop"
                    class="radio-page-play">
                    <div>{{ $t('message.streaming.play', { radio: stream.name}) }}</div>
                  </div>
                  <div
                    v-if="stream.code_name === radioPlayingCodeName
                      && playing !== PlayerStatus.Stopped"
                    v-on:click="playStop"
                    class="radio-page-play">
                    <div>{{ $t('message.streaming.stop') }}</div>
                  </div>
                </div>
              </div>

              <div class="mt-4" v-if="liveSongTitle">
                <strong>{{ $t('message.streaming.playing') }}:</strong>&nbsp;
                ♫ {{ liveSongTitle }}

                <div class="mt-3">
                  <strong>{{ $t('message.songs_page.find') }}:</strong>&nbsp;&nbsp;
                  <a class="link-no-to-bold" target="_blank"
                     :title="$t( 'message.songs_page.find_youtube')"
                     :href="encodeURI(
                      `https://www.youtube.com/results?search_query=${liveSongTitle}`)"
                  >
                    <i class="bi bi-youtube"></i>&nbsp;&nbsp;
                    <span class="d-none d-sm-inline">
                    {{ $t('message.songs_page.find_youtube') }}
                  </span>
                  </a>&nbsp;&nbsp;
                  <a class="link-no-to-bold" target="_blank"
                     :title="$t( 'message.songs_page.find_spotify')"
                     :href="encodeURI(`https://open.spotify.com/search/${liveSongTitle}`)">
                    <i class="bi bi-spotify"></i>&nbsp;&nbsp;
                    <span class="d-none d-sm-inline">
                    {{ $t('message.songs_page.find_spotify') }}
                  </span>
                  </a>&nbsp;&nbsp;
                  <a class="link-no-to-bold" target="_blank"
                     :title="$t( 'message.songs_page.find_deezer')"
                     :href="encodeURI(`https://www.deezer.com/search/${liveSongTitle}`)">
                    <img src="/img/deezericon.png" :alt="$t('message.songs_page.find_deezer')">
                    <span class="d-none d-sm-inline">
                    {{ $t('message.songs_page.find_deezer') }}
                  </span>
                  </a>
                </div>
              </div>

              <div class="mt-4" v-if="liveListenersCount && liveListenersCount > 0">
                <strong>{{ $t('message.streaming.listeners_title') }}:</strong>&nbsp;
      {{ $tc('message.streaming.listeners', liveListenersCount, { how_many: liveListenersCount}) }}
              </div>
            </div>

            <div class="mb-3" v-if="country">
              <strong>{{ $t('message.streaming.country') }}:</strong>&nbsp;
              {{ country }}
            </div>

            <div class="mb-3" v-if="stream.website">
              <strong>{{ $t('message.streaming.website') }}:</strong>&nbsp;
              <a target="_blank" :href="stream.website">{{ stream.website }}</a>
            </div>

            <div class="row" v-if="stream.tags">
              <div class="col-12 col-sm-9">
                <div class="stream-one-tags">
                  <div class="d-flex flex-wrap">
                    <span class="badge badge-inverse"
                      v-for="tag in (stream.tags.split(','))" :key="tag"
                      v-on:click="tagClick(tag)">
                        {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <div class="col-sm-3 col-12 text-center" v-if="!userLogged">
        <adsense></adsense>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue';
import { mapState, mapActions } from 'pinia';

/* eslint-disable import/no-cycle */
import { useStreamsStore } from '@/stores/streamsStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useUserStore } from '@/stores/userStore';

import PlayerStatus from '@/types/player_status';

import * as config from '../../config/config';
import StreamsUtils from '../../utils/StreamsUtils';
import Adsense from '../Utils/Adsense.vue';
import {useGlobalStore} from "@/stores/globalStore";

export default defineComponent({
  components: {
    Adsense
  },
  props: {
    codeName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      PlayerStatus,
      locale: this.$i18n.locale
    };
  },
  computed: {
    ...mapState(useUserStore, { userLogged: 'logged', userIsAdmin: 'isAdmin' }),
    ...mapState(useStreamsStore, ['selectedCountry', 'getOneStream', 'getCountryName', 'page']),
    ...mapState(usePlayerStore, [
      'playing',
      'radioPlayingCodeName',
      'liveSong',
      'listeners',
      'externalPlayer'
    ]),
    stream() {
      return this.getOneStream(this.codeName);
    },
    img() {
      return StreamsUtils.getPictureUrl(this.stream!);
    },
    country() {
      return this.getCountryName(this.stream!.country_code);
    },
    liveSongTitle() {
      return this.liveSong(this.stream!, this.stream!.radio_stream_code_name);
    },
    liveListenersCount() {
      if (!this.stream) {
        return null;
      }

      const topicName = this.stream.radio_stream_code_name || this.stream.code_name;

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
    ...mapActions(useGlobalStore, ['displayToast']),
    ...mapActions(usePlayerStore, ['playStream', 'stop']),
    ...mapActions(useStreamsStore, [
      'setSearchText',
      'setSearchActive',
      'getStreamRadios',
      'setSoloExtended'
    ]),
    playStop() {
      if (this.stream === null) {
        return;
      }

      // stop if playing
      if (this.radioPlayingCodeName === this.stream.code_name
        && this.playing !== PlayerStatus.Stopped) {
        if (this.externalPlayer === false) {
          (this as any).$gtag.event(config.GTAG_ACTION_STOP, {
            event_category: config.GTAG_CATEGORY_STREAMING,
            event_label: this.stream.code_name,
            value: config.GTAG_ACTION_STOP_VALUE
          });
        }

        this.stop();
        return;
      }

      if (this.externalPlayer === false) {
        (this as any).$gtag.event(config.GTAG_ACTION_PLAY, {
          event_category: config.GTAG_CATEGORY_STREAMING,
          event_label: this.stream.code_name,
          value: config.GTAG_ACTION_PLAY_VALUE
        });
      }

      this.playStream(this.stream);
    },
    tagClick(tag: string) {
      (this as any).$gtag.event(config.GTAG_STREAMING_ACTION_TAG, {
        event_category: config.GTAG_CATEGORY_STREAMING,
        event_label: tag.toLowerCase(),
        value: config.GTAG_STREAMING_FILTER_VALUE
      });

      this.setSearchText(tag);
      this.setSearchActive(true);
      // .then(() => {
      nextTick(() => {
        this.setSoloExtended(null);
        this.getStreamRadios();
      });
      // });
    },
    quit() {
      this.$router.push({
        name: 'streaming',
        params: { countryOrCategoryOrUuid: this.selectedCountry.toLowerCase(), page: this.page }
      });
    },
    copyIdToClipboard() {
      if (!this.stream) {
        return;
      }

      try {
        navigator.clipboard.writeText(this.stream.code_name);

        this.displayToast({
          message: 'Id copied',
          type: 'success'
        });
      } catch (err) {
        this.displayToast({
          message: 'Error copying id',
          type: 'error'
        });
      }
    }
  }
});
</script>
