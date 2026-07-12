<template>
  <div v-if="liveListenersCount && liveListenersCount > 0" class="player-listeners-xl"
    :title="$t('message.streaming.listeners', liveListenersCount, { how_many: liveListenersCount})">
    <span class="badge rounded-pill text-bg-secondary">
      {{ liveListenersCount }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { mapState, mapActions } from 'pinia';

import type { Stream } from '@/types/stream';
import type { Radio } from '@/types/radio';

import { usePlayerStore } from '@/stores/playerStore';

export default defineComponent({
  props: {
    stream: {
      type: Object as PropType<Stream>,
      required: true
    },
    radio: {
      type: Object as PropType<Radio>,
      required: false
    },
  },
  data(): {
    lastChannelTopic: string|null,
  } {
    return {
      lastChannelTopic: null
    }
  },
  beforeMount() {
    this.joinChannel();
  },
  mounted() {
    document.addEventListener('visibilitychange', this.visibilityChange);
  },
  beforeUnmount() {
    document.removeEventListener('visibilitychange', this.visibilityChange);
    this.leaveChannel();
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
    ...mapState(usePlayerStore, ['listeners']),
    channelTopic() {
      // radio, all sub radios count
      if (this.stream && this.stream.is_sub_radio && this.radio && this.radio.code_name) {
        return this.radio.code_name;
      }

      if (this.stream) {
        return this.stream.id;
      }

      return null
    },
    liveListenersCount() {
      if (!this.channelTopic || !Object.prototype.hasOwnProperty.call(this.listeners, this.channelTopic)) {
        return 0;
      }

      if (!this.listeners[this.stream.id] || this.listeners[this.channelTopic] === 0) {
        return 0;
      }

      return this.listeners[this.channelTopic];
    },
  },
  methods: {
    ...mapActions(usePlayerStore, [
      'joinListenersChannel',
      'leaveListenersChannel',
    ]),
    joinChannel() {
      setTimeout(() => {
        if (this.channelTopic) {
          this.joinListenersChannel(this.channelTopic);
          this.lastChannelTopic = this.channelTopic;
        }
      }, 500);
    },
    leaveChannel(channelTopic: string|null = null) {
      setTimeout(() => {
        if (channelTopic || this.lastChannelTopic) {
          this.leaveListenersChannel(channelTopic || this.lastChannelTopic);
          this.lastChannelTopic = null;
        }
      }, channelTopic ? 5 : 1000);
    },
  }
});
</script>
