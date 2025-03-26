<template>
  <div class="radio-page-streams-one text-center mb-4">
    <div
        v-if="stream.code_name !== playingStreamCodeName
          || playerStore.playing === PlayerStatus.Stopped"
        v-on:click="play"
        class="radio-page-play">
      <img :alt="$t('message.radio_page.play', { radio: stream.name })"
        :src="playImage">
      <div class="radio-page-play-text">
       {{ $t('message.radio_page.play', { radio: stream.name }) }}
      </div>
    </div>
    <div
        v-if="stream.code_name === playingStreamCodeName
          && playerStore.playing === PlayerStatus.Playing"
        v-on:click="stop"
        class="radio-page-play">
      <img :alt="$t('message.radio_page.stop', { radio: stream.name })"
           :src="pauseImage">
      <div class="radio-page-play-text">
       {{ $t('message.radio_page.stop', { radio: stream.name }) }}
      </div>
    </div>
    <div
        v-if="stream.code_name === playingStreamCodeName
          && playerStore.playing === PlayerStatus.Loading"
        v-on:click="stop"
        class="radio-page-play">
      <div class="spinner-border" role="status"
         :title="$t('message.radio_page.stop', { radio: stream.name })">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="radio-page-play-text">
        {{ $t('message.radio_page.stop', { radio: stream.name }) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { mapState, mapStores } from 'pinia';

import { usePlayerStore } from '@/stores/playerStore';

import type { Radio } from '@/types/radio';
import type { RadioStream } from '@/types/radio_stream';
import PlayerStatus from '@/types/player_status';

import {
  GTAG_CATEGORY_RADIOPAGE,
  GTAG_ACTION_PLAY,
  GTAG_ACTION_PLAY_VALUE, GTAG_ACTION_STOP, GTAG_ACTION_STOP_VALUE
} from '@/config/config';

export default defineComponent({
  props: {
    radio: {
      type: Object as PropType<Radio>,
      required: true
    },
    stream: {
      type: Object as PropType<RadioStream>,
      required: true
    },
  },
  data() {
    return {
      PlayerStatus
    };
  },
  computed: {
    ...mapStores(usePlayerStore),
    ...mapState(usePlayerStore, {
      playingStreamCodeName: 'radioStreamCodeName'
    }),
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
    play() {
      if (this.playerStore.externalPlayer === false) {
        (this as any).$gtag.event(GTAG_ACTION_PLAY, {
          event_category: GTAG_CATEGORY_RADIOPAGE,
          event_label: this.radio.code_name,
          value: GTAG_ACTION_PLAY_VALUE
        });
      }

      this.playerStore.playRadio({
        radioCodeName: this.radio.code_name,
        streamCodeName: this.stream.code_name
      });
    },
    stop() {
      if (this.playerStore.externalPlayer === false) {
        (this as any).$gtag.event(GTAG_ACTION_STOP, {
          event_category: GTAG_CATEGORY_RADIOPAGE,
          event_label: this.radio.code_name,
          value: GTAG_ACTION_STOP_VALUE
        });
      }

      this.playerStore.stop();
    }
  }
});
</script>
