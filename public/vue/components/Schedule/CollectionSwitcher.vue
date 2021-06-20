<template>
  <div class="collection-switcher">
    <div class="collection-switcher-next">{{ nextCollection }}</div>
    <div class="collection-control collection-backward"
         v-on:click="clickCollectionBackward"
         v-on:mouseover="hover('backward')">
      <i class="bi bi-chevron-left"></i>
    </div>
    <div class="collection-control collection-forward"
         v-on:click="clickCollectionForward"
         v-on:mouseover="hover('forward')">
      <i class="bi bi-chevron-right"></i>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import find from 'lodash/find';

import ScheduleUtils from '../../utils/ScheduleUtils';

import {
  GTAG_CATEGORY_SCHEDULE,
  GTAG_SCHEDULE_ACTION_COLLECTION_NAVIGATION,
  GTAG_SCHEDULE_COLLECTION_NAVIGATION_VALUE
} from '../../config/config';

export default {
  compatConfig: {
    MODE: 3
  },
  data() {
    return {
      nextCollection: ''
    };
  },
  computed: {
    ...mapState({
      radios: state => state.schedule.radios,
      collections: state => state.schedule.collections,
      currentCollection: state => state.schedule.currentCollection,
    })
  },
  methods: {
    clickCollectionBackward() {
      this.$gtag.event(GTAG_SCHEDULE_ACTION_COLLECTION_NAVIGATION, {
        event_category: GTAG_CATEGORY_SCHEDULE,
        value: GTAG_SCHEDULE_COLLECTION_NAVIGATION_VALUE
      });

      this.$store.dispatch('collectionBackward');
    },
    clickCollectionForward() {
      this.$gtag.event(GTAG_SCHEDULE_ACTION_COLLECTION_NAVIGATION, {
        event_category: GTAG_CATEGORY_SCHEDULE,
        value: GTAG_SCHEDULE_COLLECTION_NAVIGATION_VALUE
      });

      this.$store.dispatch('collectionForward');
    },
    hover(way) {
      const nextCollectionCodeName = ScheduleUtils.getNextCollection(this.currentCollection,
        this.collections, this.radios, way);

      const collection = find(this.collections, c => c.code_name === nextCollectionCodeName);
      this.nextCollection = collection.short_name;
    }
  }
};
</script>
