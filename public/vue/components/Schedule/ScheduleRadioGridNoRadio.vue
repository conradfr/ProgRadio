<template>
  <div class="schedule-radio-grid-no-radio alert alert-warning text-center"
     role="alert" :style="noRadioStyleObject">
    {{ $t(textKey) }}
  </div>
</template>

<script>
import { mapState } from 'vuex';

import { COLLECTION_FAVORITES } from '../../config/config';

export default {
  compatConfig: {
    MODE: 3
  },
  props: ['collection'],
  computed: {
    textKey() {
      if (this.collection === COLLECTION_FAVORITES) {
        return 'message.schedule.no_radio_favorites';
      }

      return 'message.schedule.no_radio';
    },
    ...mapState({
      noRadioStyleObject(state) {
        const newLeft = state.schedule.scrollIndex + (window.innerWidth / 2) - 200;
        return {
          left: `${newLeft}px`,
        };
      },
    })
  },
};
</script>
