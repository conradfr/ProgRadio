<template>
  <div v-if="count && count > 0" class="mb-4">
    <strong>{{ $t('message.streaming.listeners_title') }}:</strong>&nbsp;
    {{ $t('message.streaming.listeners', count) }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { mapState, mapActions } from 'pinia';

import type { Radio } from '@/types/radio.ts';
import type { Stream } from '@/types/stream.ts';

import { usePlayerStore } from '@/stores/playerStore.ts';

import typeUtils from '@/utils/typeUtils.ts';

export default defineComponent({
  props: {
    stream: {
      type: Object as PropType<Radio|Stream>,
      required: true
    }
  },
  mounted() {
    setTimeout(() => {
      if (this.stream) {
        this.joinListenersChannel(this.channelName);
      }
    }, Math.floor(Math.random() * (750 - 150 + 1)) + 150);
  },
  beforeUnmount() {
    setTimeout(() => {
      if (this.stream) {
        this.leaveListenersChannel(this.channelName);
      }
    }, 1000);
  },
  computed: {
    ...mapState(usePlayerStore, ['listeners']),
    channelName() {
      // This is the "whole radio" vs one stream count
      return typeUtils.isRadio(this.stream) ? this.stream.code_name : this.stream.id;
    },
    count() {
      if (!this.stream) {
        return null;
      }

      if (!Object.prototype.hasOwnProperty.call(this.listeners, this.channelName)) {
        return null;
      }

      if (!this.listeners[this.channelName] || this.listeners[this.channelName] === 0) {
        return null;
      }

      return this.listeners[this.channelName];
    },
  },
  methods: {
    ...mapActions(usePlayerStore, [
      'joinListenersChannel',
      'leaveListenersChannel',
    ]),
  }
});
</script>
