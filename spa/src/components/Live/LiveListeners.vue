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
        this.joinListenersChannel(this.stream.radio_stream_code_name || this.stream.code_name);
      }
    }, 250);
  },
  beforeUnmount() {
    setTimeout(() => {
      if (this.stream) {
        this.leaveListenersChannel(this.stream.radio_stream_code_name || this.stream.code_name);
      }
    }, 1000);
  },
  computed: {
    ...mapState(usePlayerStore, ['listeners']),
    count() {
      if (!this.stream) {
        return null;
      }

      const topicName = (typeUtils.isStream(this.stream) ? this.stream.radio_stream_code_name
        : this.stream.code_name) || this.stream.code_name;

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
    ...mapActions(usePlayerStore, [
      'joinListenersChannel',
      'leaveListenersChannel',
    ]),
  }
});
</script>
