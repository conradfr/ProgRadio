<template>
  <div id="category-filter" v-on:mouseover="filterFocus(true)" v-on:mouseleave="filterFocus(false)">
    <div class="category-one"
         :class="{ 'category-one-excluded': preRollExcluded }"
         v-on:click="togglePreRoll()"
    >
      <span class="bi"
        :class="{ 'bi-check-lg': !preRollExcluded, 'bi-dash-lg': preRollExcluded }">
      </span>{{ $t('message.schedule.preroll_filter') }}
    </div>
    <div class="category-one"
      :class="{ 'category-one-excluded': isCategoryExcluded(entry.code_name) }"
      v-for="entry in categories" :key="entry.code_name"
      v-on:click="toggleExclude(entry.code_name)"
    >
      <span class="bi"
        :class="{ 'bi-check-lg': !isCategoryExcluded(entry.code_name),
                  'bi-dash-lg': isCategoryExcluded(entry.code_name) }">
      </span>{{ entry[`name_${locale.toUpperCase()}`] }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

import { useScheduleStore } from '@/stores/scheduleStore';

import {
  GTAG_CATEGORY_SCHEDULE,
  GTAG_SCHEDULE_ACTION_FILTER,
  GTAG_SCHEDULE_FILTER_VALUE
} from '@/config/config';

export default defineComponent({
  data() {
    return {
      locale: this.$i18n.locale
    };
  },
  computed: {
    ...mapState(useScheduleStore, ['categories', 'categoriesExcluded', 'preRollExcluded']),
  },
  methods: {
    ...mapActions(useScheduleStore, [
      'toggleExcludeCategory',
      'setCategoryFilterFocus',
      'preRollExcludedToggle'
    ]),
    filterFocus(status: boolean) {
      // timer helps avoid the filter icon flickering
      setTimeout(
        () => {
          this.setCategoryFilterFocus('list', status);
        },
        100
      );
    },
    isCategoryExcluded(category: string) {
      return this.categoriesExcluded.indexOf(category) !== -1;
    },
    toggleExclude(category: string) {
      (this as any).$gtag.event(GTAG_SCHEDULE_ACTION_FILTER, {
        event_category: GTAG_CATEGORY_SCHEDULE,
        event_label: category,
        value: GTAG_SCHEDULE_FILTER_VALUE
      });

      this.toggleExcludeCategory(category);
    },
    togglePreRoll() {
      (this as any).$gtag.event(GTAG_SCHEDULE_ACTION_FILTER, {
        event_category: GTAG_CATEGORY_SCHEDULE,
        event_label: 'preroll',
        value: GTAG_SCHEDULE_FILTER_VALUE
      });

      this.preRollExcludedToggle();
    }
  }
});
</script>
