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
        <i class="bi bi-funnel"></i>
      </div>
      <i class="bi bi-chevron-left"></i>
    </div>
    <div class="timeline-control timeline-calendar d-none d-md-flex">
      <div class="timeline-calendar-action timeline-calendar-backward align-self-start ps-2">
        <i class="bi bi-caret-left-fill" v-on:click="clickCalendarBackward"></i>
      </div>
      <div class="timeline-calendar-date align-self-center flex-grow-1">
          <span
              v-bind:class="{ 'timeline-calendar-no-click': isToday }"
              v-on:click="clickCalendarToday">{{ scheduleDate }}</span>
      </div>
      <div class="timeline-calendar-action timeline-calendar-forward align-self-end pe-2">
        <i class="bi bi-caret-right-fill"
           v-bind:class="{ 'timeline-calendar-disabled': isTomorrow }"
           v-on:click="clickCalendarForward"></i>
      </div>
    </div>
    <div class="timeline-control timeline-control-right" v-on:click="clickForward">
      <i class="bi bi-chevron-right"></i>
    </div>
    <div v-for="hour in 24" :key="hour" class="time" v-once>
      {{ toTime(hour) }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions, mapState } from 'pinia';
import { DateTime } from 'luxon';

import { useScheduleStore } from '@/stores/scheduleStore';

export default defineComponent({
  data() {
    return {
      debounce: false
    };
  },
  computed: {
    ...mapState(useScheduleStore, ['cursorTime', 'isToday', 'isTomorrow']),
    ...mapState(useScheduleStore, {
      filterEnabled: store => store.categoriesExcluded.length > 0,
      styleObject: 'gridIndexLeft',
      displayFilter: 'displayCategoryFilter',
    }),
    scheduleDate(): string {
      if (this.isToday === true) { return (this.$i18n as any).tc('message.schedule.today'); }
      if (this.isTomorrow === true) { return (this.$i18n as any).tc('message.schedule.tomorrow'); }
      return this.cursorTime.toLocaleString(DateTime.DATE_SHORT);
    }
  },
  methods: {
    ...mapActions(useScheduleStore, [
      'scrollBackward',
      'scrollForward',
      'setCalendarBackward',
      'setCalendarForward',
      'setCalendarToday',
      'setCategoryFilterFocus'
    ]),
    toTime(value: number): string {
      // add leading 0 if < 10
      const strTime = `0${value - 1}`;
      return `${`${strTime.slice(-2)}`}h00`;
    },
    clickBackward() {
      this.scrollBackward();
    },
    clickForward() {
      this.scrollForward();
    },
    clickCalendarToday() {
      this.setCalendarToday();
    },
    clickCalendarBackward() {
      this.setCalendarBackward();
    },
    clickCalendarForward() {
      if (!this.isTomorrow) {
        this.setCalendarForward();
      }
    },
    filterFocus(status: boolean) {
      if (status) {
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
          this.setCategoryFilterFocus('icon', status);
        },
        100
      );
    },
    filterClick() {
      if (!this.debounce) {
        this.setCategoryFilterFocus('icon', !this.displayFilter);
      }
    }
  }
});
</script>
