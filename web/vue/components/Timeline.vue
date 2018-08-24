<template>
  <div class="timeline" :style="styleObject">
    <div class="timeline-control timeline-control-left" v-on:click="clickBackward"
         v-bind:class="{ 'filter-icon-active': displayFilter }">
      <div class="filter-icon"
           v-bind:class="{ 'filter-icon-active': displayFilter,
                           'filter-icon-enabled': (filterEnabled && !displayFilter) }"
           v-on:click.stop="filterClick"
           v-on:mouseover="filterFocus(true)"
           v-on:mouseleave="filterFocus(false)"
      >
        <span class="glyphicon glyphicon-filter" aria-hidden="true"></span>
      </div>
      <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
    </div>
    <div class="timeline-control timeline-control-right" v-on:click="clickForward"><span
        class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></div>
    <div v-for="hour in 24" :key="hour" class="time">
      {{ hour | toTime }}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  filters: {
    toTime(value) {
      // add leading 0 if < 10
      const strTime = `0${value - 1}`;
      return `${`${strTime.slice(-2)}`}h00`;
    }
  },
  data() {
    return {
      debounce: false
    };
  },
  computed: {
    ...mapState({
      filterEnabled: state => state.schedule.categoriesExcluded.length > 0
    }),
    ...mapGetters({
      styleObject: 'gridIndex',
      displayFilter: 'displayCategoryFilter'
    })
  },
  methods: {
    clickBackward() {
      this.$store.dispatch('scrollBackward');
    },
    clickForward() {
      this.$store.dispatch('scrollForward');
    },
    filterFocus(status) {
      if (status === true) {
        this.debounce = true;
        setTimeout(
          () => {
            this.debounce = false;
          },
          500
        );
      }

      this.$store.dispatch('categoryFilterFocus', { element: 'icon', status });
    },
    filterClick() {
      if (this.debounce === false) {
        this.$store.dispatch('categoryFilterFocus',
          { element: 'icon', status: !this.displayFilter });
      }
    }
  }
};
</script>
