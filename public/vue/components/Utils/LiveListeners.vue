<template>
  <div class="mt-4" v-if="count && count > 0">
    <strong>{{ $t('message.streaming.listeners_title') }}:</strong>&nbsp;
    {{ $tc('message.streaming.listeners', count, { how_many: count}) }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { mapState } from 'pinia';

import type { Radio } from '@/types/radio';
import type { Stream } from '@/types/stream';

/* eslint-disable import/no-cycle */
import { usePlayerStore } from '@/stores/playerStore';

import typeUtils from '@/utils/typeUtils';

/* eslint-disable no-undef */
/* eslint-disable camelcase */
export default defineComponent({
  props: {
    stream: {
      type: Object as PropType<Radio|Stream>,
      required: true
    }
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
  }
});
</script>
