<template>
  <div class="schedule-container" tabindex="-1">
    <loading></loading>
    <schedule-radio-list></schedule-radio-list>
    <schedule-radio-grid></schedule-radio-grid>
    <schedule-radio-program-modal
        v-if="displayProgramModal">
    </schedule-radio-program-modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions, mapState } from 'pinia';

/* eslint-disable import/no-cycle */
import { useScheduleStore } from '@/stores/scheduleStore';
import { usePlayerStore } from '@/stores/playerStore';

import { DEFAULT_COLLECTION } from '@/config/config';

import ScheduleRadioList from './ScheduleRadioList.vue';
import ScheduleRadioGrid from './ScheduleRadioGrid.vue';
import ScheduleRadioProgramModal from './ScheduleRadioProgramModal.vue';
import Loading from '../Utils/Loading.vue';

export default defineComponent({
  components: {
    ScheduleRadioList,
    ScheduleRadioGrid,
    ScheduleRadioProgramModal,
    Loading
  },
  created() {
    setTimeout(
      () => {
        this.getRadiosData();
        this.getSchedule({
          collection: this.$route.params.collection
            ? this.$route.params.collection : this.currentCollection
        });

        if (this.$route.params.collection) {
          this.switchCollection((this.$route.params.collection as string));
        } else {
          this.joinChannel(`collection:${this.currentCollection}`);
        }
      },
      25
    );

    /* setTimeout(
      () => {
        this.$store.dispatch('getSchedule');
      },
      3500
    ); */
  },
  beforeUnmount() {
    this.leaveChannel(`collection:${this.currentCollection}`);
  },
  watch: {
    $route(to, from) {
      if (to.params.collection !== undefined && to.params.collection !== from.params.collection) {
        const toCollection = to.params.collection === ''
          ? DEFAULT_COLLECTION : to.params.collection;
        this.getSchedule({ collection: toCollection });
        this.switchCollection(toCollection);
      }
    }
  },
  computed: mapState(useScheduleStore, ['currentCollection', 'displayProgramModal']),
  methods: {
    ...mapActions(usePlayerStore, ['joinChannel', 'leaveChannel']),
    ...mapActions(useScheduleStore, [
      'getSchedule',
      'switchCollection',
      'getRadiosData',
      'getSchedule'
    ])
  }
});
</script>
