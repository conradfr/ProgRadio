<template>
  <div style="z-index:1300" class="modal fade" id="scheduleRadioRegionModal" v-if="radio"
       tabindex="-1" aria-labelledby="regionModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title" id="regionModalLabel">
            {{ $t('message.schedule.radio_list.pick_region_title') }}
          </h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal"
            :aria-label="$t('message.schedule.radio_list.region.modal.close')"></button>
        </div>
        <div class="modal-body pb-0">
          <div class="d-flex flex-row flex-wrap justify-content-evenly">
            <button v-for="sub_radio in radio.sub_radios" :key="sub_radio.code_name"
              v-on:click="regionClick(sub_radio.code_name)"
              type="button" class="btn btn-secondary m-2">{{ sub_radio.name }}</button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
            {{ $t('message.schedule.radio_list.region.modal.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

import {
  GTAG_ACTION_REGION_SELECT,
  GTAG_ACTION_REGION_VALUE,
  GTAG_CATEGORY_SCHEDULE
} from '@/config/config';

/* eslint-disable import/no-cycle */
import { useScheduleStore } from '@/stores/scheduleStore';
import { useUserStore } from '@/stores/userStore';

export default defineComponent({
  computed: mapState(useScheduleStore, { radio: 'radioForRegionModal' }),
  // computed: mapState(usePlayerStore, ['timer']),
  methods: {
    ...mapActions(useUserStore, ['setSubRadio']),
    regionClick(subRadioCodeName: string) {
      if (this.radio === null) {
        return;
      }

      /* eslint-disable no-undef */
      const modalElem = document.getElementById('scheduleRadioRegionModal');
      // @ts-expect-error bootstrap is defined on global scope
      const modalInstance = bootstrap.Modal.getInstance(modalElem);

      if (modalInstance !== undefined && modalInstance !== null) {
        modalInstance.hide();
      }

      (this as any).$gtag.event(GTAG_ACTION_REGION_SELECT, {
        event_category: GTAG_CATEGORY_SCHEDULE,
        event_label: this.radio?.code_name,
        value: GTAG_ACTION_REGION_VALUE
      });

      this.setSubRadio(this.radio.code_name, subRadioCodeName);
    }
  }
});
</script>
