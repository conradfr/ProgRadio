<template>
  <div id="category-filter" v-on:mouseover="filterFocus(true)" v-on:mouseleave="filterFocus(false)">
    <div class="category-one"
      :class="{ 'category-one-excluded': isCategoryExcluded(entry.code_name) }"
      v-for="entry in categories" :key="entry.code_name"
      v-on:click="toggleExclude(entry.code_name)"
    >
      <span class="bi"
        :class="{ 'bi-check-lg': !isCategoryExcluded(entry.code_name),
                  'bi-dash-lg': isCategoryExcluded(entry.code_name) }">
      </span>{{ entry.name_FR }}
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import {
  GTAG_CATEGORY_SCHEDULE,
  GTAG_SCHEDULE_ACTION_FILTER,
  GTAG_SCHEDULE_FILTER_VALUE
} from '../../config/config';

export default {
  data() {
    return {};
  },
  computed: {
    ...mapState({
      categories: state => state.schedule.categories,
      categoriesExcluded: state => state.schedule.categoriesExcluded
    })
  },
  methods: {
    filterFocus(status) {
      // timer helps avoid the filter icon flickering
      setTimeout(
        () => {
          this.$store.dispatch('categoryFilterFocus', { element: 'list', status });
        },
        100
      );
    },
    isCategoryExcluded(category) {
      return this.categoriesExcluded.indexOf(category) !== -1;
    },
    toggleExclude(category) {
      this.$gtag.event(GTAG_SCHEDULE_ACTION_FILTER, {
        event_category: GTAG_CATEGORY_SCHEDULE,
        event_label: category,
        value: GTAG_SCHEDULE_FILTER_VALUE
      });

      this.$store.dispatch('toggleExcludeCategory', category);
    }
  }
};
</script>
