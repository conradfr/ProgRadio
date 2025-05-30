<template>
  <div class="collection-switcher">
    <div class="collection-switcher-next">{{ nextCollection }}</div>
    <div class="collection-control collection-backward"
         @click="clickCollectionBackward"
         @mouseover="hover('backward')">
      <i class="bi bi-chevron-left"></i>
    </div>
    <div class="collection-control collection-forward"
         :title="$t('message.schedule.tooltip')"
         @click="clickCollectionForward"
         @mouseover="hover('forward')">
      <i class="bi bi-chevron-right"></i>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';
import find from 'lodash/find';

import {
  COOKIE_TOOLTIP_COLLECTION,
  GTAG_CATEGORY_SCHEDULE,
  GTAG_SCHEDULE_ACTION_COLLECTION_NAVIGATION,
  GTAG_SCHEDULE_COLLECTION_NAVIGATION_VALUE
} from '@/config/config';

import { useScheduleStore } from '@/stores/scheduleStore';

import ScheduleUtils from '@/utils/ScheduleUtils';
import tooltip from '@/utils/tooltip';

export default defineComponent({
  data() {
    return {
      nextCollection: ''
    };
  },
  mounted() {
    // help tooltip
    tooltip.set('collection-forward', COOKIE_TOOLTIP_COLLECTION);
  },
  computed: {
    ...mapState(useScheduleStore, ['radios', 'collections', 'currentCollection']),
  },
  methods: {
    ...mapActions(useScheduleStore, ['collectionBackward', 'collectionForward']),
    clickCollectionBackward() {
      this.$gtag.event(GTAG_SCHEDULE_ACTION_COLLECTION_NAVIGATION, {
        event_category: GTAG_CATEGORY_SCHEDULE,
        value: GTAG_SCHEDULE_COLLECTION_NAVIGATION_VALUE
      });

      this.collectionBackward();
    },
    clickCollectionForward() {
      this.$gtag.event(GTAG_SCHEDULE_ACTION_COLLECTION_NAVIGATION, {
        event_category: GTAG_CATEGORY_SCHEDULE,
        value: GTAG_SCHEDULE_COLLECTION_NAVIGATION_VALUE
      });

      this.collectionForward();
    },
    hover(way: 'backward'|'forward') {
      const nextCollectionCodeName = ScheduleUtils.getNextCollection(
        this.currentCollection,
        this.collections,
        this.radios,
        way
      );

      const collection = find(this.collections, c => c.code_name === nextCollectionCodeName);
      this.nextCollection = collection!.short_name;
    }
  }
});
</script>
