<template>
  <div style="z-index:1300" class="modal fade" id="timerModal"
       tabindex="-1" aria-labelledby="timerModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title" id="timerModalLabel">
            {{ $t('message.player.timer.modal.title') }}
          </h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal"
            :aria-label="$t('message.player.timer.modal.close')"></button>
        </div>
        <div class="modal-body pb-0">
          <div class="modal-body-row mt-2">
            <h6>{{ $t('message.player.timer.modal.quick') }}</h6>
            <div class="btn-group d-flex" role="group" aria-label="Set">
              <timer-modal-set-button minutes="30"></timer-modal-set-button>
              <timer-modal-set-button minutes="60"></timer-modal-set-button>
              <timer-modal-set-button minutes="90"></timer-modal-set-button>
              <timer-modal-set-button minutes="120" :hide-mobile="true" ></timer-modal-set-button>
            </div>
          </div>

          <div class="modal-body-row mt-2">
            <h6>{{ $t('message.player.timer.modal.add') }}</h6>
            <div class="btn-group d-flex" role="group" aria-label="Add">
              <timer-modal-add-button v-model="minutes" add="15"></timer-modal-add-button>
              <timer-modal-add-button v-model="minutes" add="30"></timer-modal-add-button>
              <timer-modal-add-button v-model="minutes" add="60"></timer-modal-add-button>
              <timer-modal-add-button v-model="minutes" add="120"
                :hide-mobile="true"></timer-modal-add-button>
            </div>
          </div>
          <div class="modal-body-row mt-2 mb-2">
            <h6>{{ $t('message.player.timer.modal.length') }}</h6>
            <div class="row">
              <div class="col-6 col-md-3">
                <form class="form-inline">
                  <div class="form-group">
                    <div class="input-group">
                      <input type="number" class="form-control"
                         aria-describedby="basic-addon-mn"
                         v-model="minutes" min="1"
                         :placeholder="$t('message.player.timer.modal.placeholder')">
                      <span class="input-group-text" id="basic-addon-mn">
                        {{ $t('message.player.timer.modal.abrv') }}
                      </span>
                    </div>
                  </div>
                </form>
              </div>
              <div class="col-6 col-md-5">
                <a role="button" class="btn btn-primary"
                   v-on:click="set()" :class="{'disabled': minutes < 1}">
                  {{ $t('message.player.timer.modal.set') }}
                </a>
              </div>
              <div class="col-12 col-md-4 mt-4 mt-sm-0 text-center"
                v-if="timer !== null && timer > 0">
                <a role="button" class="btn btn-danger"
                   v-on:click="set(null)">
                  {{ $t('message.player.timer.modal.cancel') }}
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer justify-content-center pb-1" v-if="timer !== null && timer > 0">
          <div class="text-center mt-2 mt-0">
            <i class="bi bi-clock"></i>
            &nbsp;&nbsp;{{ $tc('message.player.timer.end_in', timer, { minutes: timer }) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

import {
  DEFAULT_TIMER_MINUTES,
  COOKIE_LAST_TIMER,
  GTAG_ACTION_TIMER_SET,
  GTAG_ACTION_TIMER_ADD,
  GTAG_CATEGORY_TIMER,
  GTAG_ACTION_TIMER_CANCEL
} from '@/config/config';

/* eslint-disable import/no-cycle */
import { usePlayerStore } from '@/stores/playerStore';

import cookies from '../../utils/cookies';

import TimerModalSetButton from './TimerModalSetButton.vue';
import TimerModalAddButton from './TimerModalAddButton.vue';

export default defineComponent({
  components: {
    TimerModalSetButton,
    TimerModalAddButton
  },
  data() {
    return {
      minutes: parseInt(cookies.get(COOKIE_LAST_TIMER, DEFAULT_TIMER_MINUTES), 10)
    };
  },
  computed: mapState(usePlayerStore, ['timer']),
  methods: {
    ...mapActions(usePlayerStore, ['setTimer']),
    add(value: number|string) {
      let { minutes } = this;
      if (typeof minutes === 'string') {
        minutes = parseInt(minutes, 10);
      }

      const finalValue = typeof value === 'string' ? parseInt(value, 10) : value;

      (this as any).$gtag.event(GTAG_ACTION_TIMER_ADD, {
        event_category: GTAG_CATEGORY_TIMER,
        event_label: `${finalValue.toString()} minutes`,
        value: finalValue
      });

      this.minutes = minutes + finalValue;
    },
    set(value: number|string|null|undefined) {
      /* eslint-disable no-undef */
      const modalElem = document.getElementById('timerModal');
      // @ts-expect-error bootstrap is defined on global scope
      const modalInstance = bootstrap.Modal.getInstance(modalElem);

      if (modalInstance !== undefined && modalInstance !== null) {
        modalInstance.hide();
      }

      let finalValue = value;

      if (finalValue === undefined) {
        let { minutes } = this;
        if (typeof minutes === 'string') {
          minutes = parseInt(minutes, 10);
        }
        finalValue = minutes;
      }

      if (typeof finalValue === 'string') {
        finalValue = parseInt(finalValue, 10);
      }

      if (finalValue !== undefined && finalValue !== null) {
        (this as any).$gtag.event(GTAG_ACTION_TIMER_SET, {
          event_category: GTAG_CATEGORY_TIMER,
          event_label: `${finalValue.toString()} minutes`,
          value: finalValue
        });
      } else {
        // cancel
        (this as any).$gtag.event(GTAG_ACTION_TIMER_CANCEL, {
          event_category: GTAG_CATEGORY_TIMER,
          event_label: `${this.timer.toString()} minutes`,
          value: this.timer
        });
      }

      this.setTimer(finalValue);
    }
  }
});
</script>
