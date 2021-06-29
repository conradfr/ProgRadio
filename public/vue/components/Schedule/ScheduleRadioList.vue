<template>
  <transition-group name="radio-list" tag="div" class="schedule-radio-list">
  <!--<div class="schedule-radio-list">-->
    <schedule-radio-list-one
        v-for="entry in radios"
        :key="entry.code_name"
        :radio="entry">
    </schedule-radio-list-one>
  <!--</div>-->
  </transition-group>

</template>

<script>
import { mapGetters } from 'vuex';

import ScheduleRadioListOne from './ScheduleRadioListOne.vue';

export default {
  compatConfig: {
    MODE: 3
  },
  components: { ScheduleRadioListOne },
  computed: {
    ...mapGetters({
      radios: 'rankedRadios',
    })
  }
};
</script>
