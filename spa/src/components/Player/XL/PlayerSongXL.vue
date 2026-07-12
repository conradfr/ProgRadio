<template>
  <div v-if="liveSongTitle"
    class="player-song-xl flex-grow-1 d-flex justify-content-start align-items-center cursor-pointer"
    @click="gotoRadio">
    <div v-if="liveSongCover" class="player-logo-xl me-3">
      <img :src="liveSongCover" />
    </div>
    <div>♫  {{ liveSongTitle }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { mapState, mapActions } from 'pinia';

import type { Stream } from '@/types/stream';

import { usePlayerStore } from '@/stores/playerStore';

import PlayerUtils from '@/utils/PlayerUtils';

export default defineComponent({
  props: {
    stream: {
      type: Object as PropType<Stream>,
      required: true
    },
  },
  beforeMount() {
    this.joinChannel();
  },
  beforeUnmount() {
    this.leaveChannel();
  },
  data(): {
    lastChannelTopic: string|null,
  } {
    return {
      lastChannelTopic: null
    }
  },
  watch: {
    stream(_newValue, oldValue) {
      if (oldValue && this.lastChannelTopic) {
        this.leaveChannel(this.lastChannelTopic);
      }

      this.joinChannel();
    },
  },
  computed: {
    ...mapState(usePlayerStore, ['liveSong']),
    channelTopic() {
      return PlayerUtils.getChannelName(this.stream);
    },
    liveSongData() {
      return this.liveSong(this.stream);
    },
    liveSongTitle() {
      return this.liveSongData && this.liveSongData[0] ? this.liveSongData[0] : null;
    },
    liveSongCover() {
      return this.liveSongData && this.liveSongData[1] ? this.liveSongData[1] : null;
    },
  },
  methods: {
    ...mapActions(usePlayerStore, [
      'joinSongChannel',
      'leaveSongChannel',
    ]),
    joinChannel() {
      setTimeout(() => {
        if (this.channelTopic) {
          this.joinSongChannel(this.channelTopic);
          this.lastChannelTopic = this.channelTopic;
        }
      }, 500);
    },
    leaveChannel(channelTopic: string|null = null) {
      setTimeout(() => {
        if (channelTopic || this.lastChannelTopic) {
          this.leaveSongChannel(channelTopic || this.lastChannelTopic);
          this.lastChannelTopic = null;
        }
      }, channelTopic ? 5 : 1000);
    },
    gotoRadio() {
      if (!this.stream) {
        return;
      }

      // @ts-expect-error defined on global scope
      // eslint-disable-next-line no-undef
      if (this.stream.radio_stream_code_name && isProgRadio) {
        this.$router.push({
          name: 'radio',
          params: { radio: this.stream.radio_code_name }
        });
      } else {
        this.$router.push({
          name: 'streaming',
          params: { countryOrCategoryOrUuid: this.stream.code_name, page: null }
        });
      }
    }
  }
});
</script>
