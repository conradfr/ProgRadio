<template>
  <div v-if="stream && stream.country_code" class="player-country-xl cursor-pointer" @click.stop="flagClick">
    <vue-flag :code="stream.country_code" size="nano" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

import { usePlayerStore } from '@/stores/playerStore';

import {
  GTAG_STREAMING_ACTION_FILTER_COUNTRY,
  GTAG_CATEGORY_STREAMING,
  GTAG_STREAMING_FILTER_VALUE
} from '@/config/config';

export default defineComponent({
  computed: {
    ...mapState(usePlayerStore, ['stream']),
  },
  methods: {
    flagClick() {
      this.$gtag.event(GTAG_STREAMING_ACTION_FILTER_COUNTRY, {
        event_category: GTAG_CATEGORY_STREAMING,
        event_label: this.stream.country_code.toLowerCase(),
        value: GTAG_STREAMING_FILTER_VALUE
      });

      this.$router.push({
        name: 'streaming',
        params: { countryOrCategoryOrUuid: this.stream.country_code.toLowerCase(), page: '1' }
      });
    },
  }
});
</script>
