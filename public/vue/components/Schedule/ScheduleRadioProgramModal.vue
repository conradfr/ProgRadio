<template>
  <div style="z-index:1300" class="modal fade" id="scheduleRadioProgramModal" v-if="program"
       tabindex="-1" aria-labelledby="scheduleRadioProgramModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
      <div class="modal-content">
        <div class="modal-body pb-0">
          <button type="button" class="float-end btn-close" data-bs-dismiss="modal"
                  :aria-label="$t('message.player.timer.modal.close')"></button>
          <div class="modal-body-row mt-2">
            <radio-show :show="program"></radio-show>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

/* eslint-disable import/no-cycle */
import { useScheduleStore } from '@/stores/scheduleStore';

import RadioShow from '../Radio/RadioShow.vue';

export default defineComponent({
  components: {
    RadioShow
  },
  computed: mapState(useScheduleStore, { program: 'programForModal' })
});
</script>
