<template>
  <div class="container stream-page mt-1" v-if="stream">
    <div class="row">
      <div class="col-sm-2 col-12">
        <div class="radio-page-side sticky">
          <div class="text-center mb-4">
            <img class="radio-page-logo" :alt="stream.name" :src="img">
          </div>
        </div>
      </div>
      <div class="col-sm-7 col-10 offset-1 offset-sm-0 pb-3">
        <div class="row">
          <div class="col-sm-9 col-12">
            <div class="float-end cursor-pointer"
              :title="$t('message.streaming.close')"
              v-on:click="quit"
            ><i class="bi bi-x-lg"></i></div>
            <h4 class="mb-4">{{ stream.name }}</h4>

            <div class="stream-page-stream mt-3 mb-4">
              <div class="radio-page-streams-one d-flex
                align-items-center justify-content-center justify-content-sm-start">
                <div>
                  <div
                    v-if="playing === false || stream.code_name !== radioPlayingCodeName"
                    v-on:click="playStop"
                    class="radio-page-play">
                    <img :alt="$t('message.streaming.play', { radio: stream.name})"
                      src="/img/play-button-inside-a-circle.svg">
                  </div>
                  <div
                    v-if="playing === true && stream.code_name === radioPlayingCodeName"
                    v-on:click="playStop"
                    class="radio-page-play">
                    <img :alt="$t('message.streaming.stop')"
                      src="/img/rounded-pause-button.svg">
                  </div>
                </div>

                <div class="ps-2">
                  <div
                    v-if="playing === false || stream.code_name !== radioPlayingCodeName"
                    v-on:click="playStop"
                    class="radio-page-play">
                    <div>{{ $t('message.streaming.play', { radio: stream.name}) }}</div>
                  </div>
                  <div
                    v-if="playing === true && stream.code_name === radioPlayingCodeName"
                    v-on:click="playStop"
                    class="radio-page-play">
                    <div>{{ $t('message.streaming.stop') }}</div>
                  </div>
                </div>
              </div>

              <div class="mt-4"
                 v-if="liveSongTitle">
                <strong>{{ $t('message.streaming.playing') }}:</strong>&nbsp;
                ♫ {{ liveSongTitle }}
              </div>
            </div>

            <div class="mb-3" v-if="stream.country_code">
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

import * as config from '../../config/config';
import StreamsUtils from '../../utils/StreamsUtils';
import Adsense from '../Utils/Adsense.vue';

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
      locale: this.$i18n.locale
    };
  },
  computed: {
    ...mapState(useUserStore, { userLogged: 'logged' }),
    ...mapState(usePlayerStore, ['playing', 'radioPlayingCodeName', 'liveSong', 'externalPlayer']),
    ...mapState(useStreamsStore, ['selectedCountry', 'getOneStream', 'getCountryName']),
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
  },
  methods: {
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
      if (this.playing === true && this.radioPlayingCodeName === this.stream.code_name) {
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
        params: { countryOrCategoryOrUuid: this.selectedCountry.toLowerCase() }
      });
    }
  }
});
</script>
