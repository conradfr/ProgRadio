<template>
  <div v-if="radio" id="scheduleRadioRegionModal" style="z-index:1300" class="modal fade"
    tabindex="-1" aria-labelledby="regionModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="regionModalLabel" class="modal-title">
            {{ $t('message.schedule.radio_list.pick_region_title') }}
          </h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal"
            :aria-label="$t('message.schedule.radio_list.region.modal.close')"></button>
        </div>
        <div class="modal-body pb-0">
          <div class="d-flex flex-row flex-wrap justify-content-evenly">
            <button v-for="sub_radio in subRadiosSorted" v-once :key="sub_radio.radio_stream_code_name"
              type="button" class="btn m-2"
              :class="{ 'btn-primary': currentSubRadioCodeName === sub_radio.radio_stream_code_name,
                'btn-secondary': currentSubRadioCodeName !== sub_radio.radio_stream_code_name }"
              @click="regionClick(sub_radio.radio_stream_code_name)">
              {{ sub_radio.name }}
            </button>
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

import PlayerStatus from '@/types/player_status';

import { useScheduleStore } from '@/stores/scheduleStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useUserStore } from '@/stores/userStore';

export default defineComponent({
  computed: {
    ...mapState(useScheduleStore, ['radios', 'getSubRadio']),
    ...mapState(useScheduleStore, { radio: 'radioForRegionModal' }),
    ...mapState(usePlayerStore, {
      playingStream: 'stream',
      playingRadio: 'radio',
      playing: 'playing'
    }),
    subRadiosSorted() {
      if (!this.radio || !this.radio.streams) {
        return [];
      }

      return Object.keys(this.radio.streams)
        .sort()
        .reduce(
        (obj, key) => {
          const stream = this.radio.streams[key];
          // filter web radios
          if (stream && stream.is_main_radio || stream.is_sub_radio) {
            /* eslint-disable no-param-reassign */
            // @ts-ignore
            obj[key] = this.radio.streams[key];
          }

          return obj;
        }, {}
      );
    },
    currentSubRadioCodeName() {
      if (!this.radio) {
        return null;
      }

      return this.getSubRadio(this.radio.code_name).radio_stream_code_name;
    },
  },
  // computed: mapState(usePlayerStore, ['timer']),
  methods: {
    ...mapActions(useUserStore, ['setSubRadio']),
    ...mapActions(usePlayerStore, ['playRadio']),
    regionClick(subRadioStreamCodeName: string) {
      if (this.radio === null || this.currentSubRadioCodeName === subRadioStreamCodeName) {
        return;
      }

      const modalElem = document.getElementById('scheduleRadioRegionModal');
      // @ts-expect-error bootstrap is defined on global scope
      // eslint-disable-next-line no-undef
      const modalInstance = bootstrap.Modal.getInstance(modalElem);

      if (modalInstance !== undefined && modalInstance !== null) {
        modalInstance.hide();
      }

      this.$gtag.event(GTAG_ACTION_REGION_SELECT, {
        event_category: GTAG_CATEGORY_SCHEDULE,
        event_label: this.radio?.code_name,
        value: GTAG_ACTION_REGION_VALUE
      });

      this.setSubRadio(this.radio.code_name, subRadioStreamCodeName);

      // if currently playing, change sub radio if same radio
      if (this.playing !== PlayerStatus.Stopped && this.playingRadio.code_name === this.radio.code_name) {
        this.playRadio({ radio: this.radio, stream: this.getSubRadio(this.radio.code_name) });
      }
    }
  }
});
</script>
