<template>
  <div v-if="stream" class="container stream-page mt-1">
    <div class="row">
      <div class="col-sm-2 col-12">
        <div class="radio-page-side sticky">
          <div class="text-center mb-4">
            <img class="radio-page-logo" :alt="stream.name" :src="img">
          </div>
          <div class="text-center cursor-pointer mb-4"
               :title="$t('message.streaming.close')"
               @click="quit">
            <i class="bi bi-arrow-left"></i> {{ $t('message.streaming.close') }}
          </div>
        </div>
      </div>
      <div class="col-sm-8 col-10 offset-1 offset-sm-0 pb-3">
        <div class="row">
          <div class="col-sm-9 col-12">
            <div class="d-none d-md-block float-end cursor-pointer"
              :title="$t('message.streaming.close')"
              @click="quit">
              <i class="bi bi-x-lg"></i>
            </div>
            <div class="d-none d-md-block float-end me-4">
              <a target="_blank" class="link-no-to-bold"
                 :href="`/${locale}/streams/suggestion/${stream.code_name}`">
                {{ $t('message.streaming.suggest') }}
              </a>
              <div v-if="userLogged && userIsAdmin" class="text-end">
                <a class="link-no-to-bold" @click="copyIdToClipboard">Copy id</a>
                &nbsp;-&nbsp;<a target="_blank" :href="`/${locale}/admin/overloading/${stream.code_name}`">Edit</a>
              </div>
            </div>
            <h4 class="mb-4">{{ stream.name }}</h4>

            <div class="stream-page-stream mt-3 mb-5">
              <div class="radio-page-streams-one d-flex
                align-items-center justify-content-center justify-content-sm-start">
                <div>
                  <div
                    v-if="stream.code_name !== radioPlayingCodeName
                      || playing === PlayerStatus.Stopped"
                    class="radio-page-play"
                    @click="playStop">
                    <img :alt="$t('message.streaming.play', { radio: stream.name})" :src="playImage">
                  </div>
                  <div
                    v-if="stream.code_name === radioPlayingCodeName && playing !== PlayerStatus.Stopped"
                    class="radio-page-play"
                    @click="playStop">
                    <img :alt="$t('message.streaming.stop')" :src="pauseImage">
                  </div>
                </div>

                <div class="ps-2">
                  <div
                    v-if="stream.code_name !== radioPlayingCodeName || playing === PlayerStatus.Stopped"
                    class="radio-page-play" @click="playStop">
                    <div>{{ $t('message.streaming.play', { radio: stream.name}) }}</div>
                  </div>
                  <div
                    v-if="stream.code_name === radioPlayingCodeName && playing !== PlayerStatus.Stopped"
                    class="radio-page-play"
                    @click="playStop">
                    <div>{{ $t('message.streaming.stop') }}</div>
                  </div>
                </div>
              </div>

              <live-song v-if="stream" :stream="stream"></live-song>
              <live-listeners v-if="stream" :stream="stream"></live-listeners>
            </div>

            <div v-if="country" class="mb-3">
              <strong>{{ $t('message.streaming.country') }}:</strong>&nbsp;
              {{ country }}
            </div>

            <div v-if="stream.website" class="mb-3">
              <strong>{{ $t('message.streaming.website') }}:</strong>&nbsp;
              <a target="_blank" :href="stream.website">{{ stream.website }}</a>
            </div>

            <div v-if="stream.tags" class="row">
              <div class="col-12 col-sm-9">
                <div class="stream-one-tags">
                  <div class="d-flex flex-wrap">
                    <span v-for="tag in (stream.tags.split(','))" :key="tag"
                      class="badge badge-inverse"
                      @click="tagClick(tag)">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="locale !== 'fr' || !isProgRadio || !userLogged" class="pt-3 px-3 w-100">
              <adsense mode="horizontal_fix"></adsense>
            </div>
          </div>
        </div>
      </div>
      <!-- <div class="col-sm-2 col-12 text-center d-none d-sm-block"
        v-if="locale !== 'fr' || !isProgRadio || !userLogged">
        <adsense></adsense>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue';
import { mapState, mapActions } from 'pinia';

import { useStreamsStore } from '@/stores/streamsStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useUserStore } from '@/stores/userStore';
import { useGlobalStore } from '@/stores/globalStore';

import PlayerStatus from '@/types/player_status';

import StreamsUtils from '@/utils/StreamsUtils';
import PlayerUtils from '@/utils/PlayerUtils';
import * as config from '@/config/config';

import Adsense from '../Utils/Adsense.vue';
import LiveSong from '../Utils/LiveSong.vue';
import LiveListeners from '../Utils/LiveListeners.vue';

export default defineComponent({
  components: {
    Adsense,
    LiveSong,
    LiveListeners
  },
  props: {
    codeName: {
      type: String,
      required: true
    }
  },
  data(): {
    PlayerStatus: any
    channelName: null|string
    locale: any
    isProgRadio: boolean
  } {
    return {
      PlayerStatus,
      channelName: null,
      locale: this.$i18n.locale,
      // @ts-expect-error defined on global scope
      // eslint-disable-next-line no-undef
      isProgRadio
    };
  },
  mounted() {
    setTimeout(() => {
      if (this.stream) {
        this.channelName = PlayerUtils.getChannelName(
          this.stream,
          this.stream.radio_stream_code_name
        ) || '';
        this.joinChannel(this.channelName);
        this.joinListenersChannel(this.stream.radio_stream_code_name || this.stream.code_name);
      }
    }, 2500);
  },
  beforeUnmount() {
    setTimeout(() => {
      if (this.stream && this.channelName) {
        this.leaveChannel(this.channelName);
        this.leaveListenersChannel(this.stream.radio_stream_code_name || this.stream.code_name);
      }
    }, 1500);
  },
  computed: {
    ...mapState(useUserStore, { userLogged: 'logged', userIsAdmin: 'isAdmin' }),
    ...mapState(useStreamsStore, ['selectedCountry', 'getOneStream', 'getCountryName', 'page']),
    ...mapState(usePlayerStore, [
      'playing',
      'radioPlayingCodeName',
      'externalPlayer'
    ]),
    stream() {
      return this.getOneStream(this.codeName);
    },
    img() {
      return StreamsUtils.getPictureUrl(this.stream);
    },
    country() {
      return this.getCountryName(this.stream!.country_code);
    },
    playImage() {
      // @ts-expect-error defined on global scope
      // eslint-disable-next-line no-undef
      return `${cdnBaseUrl}img/play-button-inside-a-circle.svg`;
    },
    pauseImage() {
      // @ts-expect-error defined on global scope
      // eslint-disable-next-line no-undef
      return `${cdnBaseUrl}img/rounded-pause-button.svg`;
    }
  },
  methods: {
    ...mapActions(useGlobalStore, ['displayToast']),
    ...mapActions(usePlayerStore, [
      'joinChannel',
      'leaveChannel',
      'joinListenersChannel',
      'leaveListenersChannel',
      'playStream',
      'stop'
    ]),
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
          this.$gtag.event(config.GTAG_ACTION_STOP, {
            event_category: config.GTAG_CATEGORY_STREAMING,
            event_label: this.stream.code_name,
            value: config.GTAG_ACTION_STOP_VALUE
          });
        }

        this.stop();
        return;
      }

      if (this.externalPlayer === false) {
        this.$gtag.event(config.GTAG_ACTION_PLAY, {
          event_category: config.GTAG_CATEGORY_STREAMING,
          event_label: this.stream.code_name,
          value: config.GTAG_ACTION_PLAY_VALUE
        });
      }

      this.playStream(this.stream);
    },
    tagClick(tag: string) {
      this.$gtag.event(config.GTAG_STREAMING_ACTION_TAG, {
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
      } catch (_e) {
        this.displayToast({
          message: 'Error copying id',
          type: 'error'
        });
      }
    }
  }
});
</script>
