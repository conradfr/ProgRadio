<template>
  <div class="timeline" :style="styleObject">
    <div class="timeline-control timeline-control-left"
         v-on:click="clickBackward"
         :class="{ 'filter-icon-active': displayFilter }">
      <div class="filter-icon"
           :class="{ 'filter-icon-active': displayFilter,
                     'filter-icon-enabled': (filterEnabled && !displayFilter) }"
           v-on:click.stop="filterClick"
           v-on:mouseover="filterFocus(true)"
           v-on:mouseleave="filterFocus(false)"
      >
        <span class="glyphicon glyphicon-filter" aria-hidden="true"></span>
      </div>
      <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
    </div>
    <div class="timeline-control timeline-calendar  hidden-xs hidden-sm">
      <div class="timeline-calendar-inner">
        <div class="timeline-calendar-action timeline-calendar-backward">
          <span class="glyphicon glyphicon-triangle-left" aria-hidden="true"
                v-on:click="clickCalendarBackward"></span>
        </div>
        <div class="timeline-calendar-date">
          <span
              v-bind:class="{ 'timeline-calendar-no-click': isToday }"
              v-on:click="clickCalendarToday">{{ scheduleDate }}</span>
        </div>
        <div class="timeline-calendar-action timeline-calendar-forward">
          <span class="glyphicon glyphicon-triangle-right" aria-hidden="true"
                v-bind:class="{ 'timeline-calendar-disabled': isTomorrow }"
                v-on:click="clickCalendarForward"></span>
        </div>
      </div>
    </div>
    <div class="timeline-control timeline-control-right" v-on:click="clickForward">
      <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
    </div>
    <div v-for="hour in 24" :key="hour" class="time" v-once>
      {{ hour | toTime }}
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { DateTime } from 'luxon';

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
      filterEnabled: state => state.schedule.categoriesExcluded.length > 0,
      cursorTime: state => state.schedule.cursorTime,
    }),
    ...mapGetters({
      styleObject: 'gridIndexLeft',
      displayFilter: 'displayCategoryFilter',
      isToday: 'isToday',
      isTomorrow: 'isTomorrow'
    }),
    scheduleDate() {
      if (this.isToday === true) { return this.$i18n.tc('message.schedule.today'); }
      if (this.isTomorrow === true) { return this.$i18n.tc('message.schedule.tomorrow'); }
      return this.cursorTime.toLocaleString(DateTime.DATE_SHORT);
    }
  },
  methods: {
    clickBackward() {
      this.$store.dispatch('scrollBackward');
    },
    clickForward() {
      this.$store.dispatch('scrollForward');
    },
    clickCalendarToday() {
      this.$store.dispatch('calendarToday');
    },
    clickCalendarBackward() {
      this.$store.dispatch('calendarBackward');
    },
    clickCalendarForward() {
      if (!this.isTomorrow) {
        this.$store.dispatch('calendarForward');
      }
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

      // timer helps to avoid the submenu being closed before mouse can come over it
      setTimeout(
        () => {
          this.$store.dispatch('categoryFilterFocus', { element: 'icon', status });
        },
        100
      );
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
