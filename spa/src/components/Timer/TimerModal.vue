<template>
  <div id="timerModal" style="z-index:1300" class="modal fade"
    tabindex="-1" aria-labelledby="timerModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="timerModalLabel" class="modal-title">
            {{ $t('message.player.timer.modal.title') }}
          </h3>
          <button type="button" class="btn-close" data-bs-dismiss="modal"
            :aria-label="$t('message.player.timer.modal.close')">
          </button>
        </div>
        <div class="modal-body pb-0">
          <div class="modal-body-row mt-3">
            <h6 class="mb-3">{{ $t('message.player.timer.modal.quick') }}</h6>
            <div class="btn-group d-flex mb-3" role="group" aria-label="Set">
              <timer-modal-set-button minutes="15"></timer-modal-set-button>
              <timer-modal-set-button minutes="20"></timer-modal-set-button>
              <timer-modal-set-button minutes="30"></timer-modal-set-button>
              <timer-modal-set-button minutes="45"></timer-modal-set-button>
            </div>

            <div class="btn-group d-flex mb-3" role="group" aria-label="Set">
              <timer-modal-set-button minutes="60"></timer-modal-set-button>
              <timer-modal-set-button minutes="90"></timer-modal-set-button>
              <timer-modal-set-button minutes="120" :as-hour="true"></timer-modal-set-button>
              <timer-modal-set-button minutes="180" :as-hour="true"></timer-modal-set-button>
            </div>

            <div class="btn-group d-flex" role="group" aria-label="Set">
              <timer-modal-set-button minutes="240" :as-hour="true"></timer-modal-set-button>
              <timer-modal-set-button minutes="360" :as-hour="true"></timer-modal-set-button>
              <timer-modal-set-button minutes="480" :as-hour="true"></timer-modal-set-button>
              <timer-modal-set-button minutes="600" :as-hour="true"></timer-modal-set-button>
            </div>
          </div>

          <div class="modal-body-row mt-3 mb-3">
            <h6>{{ $t('message.player.timer.modal.length') }}</h6>
            <div class="row">
              <div class="col-6 col-md-4">
                <form class="form-inline">
                  <div class="form-group">
                    <div class="input-group">
                      <input
                        v-model="minutes"
                        type="number"
                        min="1"
                        class="form-control"
                        aria-describedby="basic-addon-mn"
                        :placeholder="$t('message.player.timer.modal.placeholder')"
                      >
                      <span id="basic-addon-mn" class="input-group-text">
                        {{ $t('message.player.timer.modal.abrv') }}
                      </span>
                    </div>
                  </div>
                </form>
              </div>
              <div class="col-6 col-md-8 text-end">
                <a :class="{'disabled': minutes < 1}"
                  role="button" class="btn btn-info"
                  @click="set()">
                  {{ $t('message.player.timer.modal.set') }}
                </a>
              </div>
            </div>
            <div class="row">
              <div class="btn-group btn-group-sm mt-3" role="group" aria-label="Add">
                <timer-modal-add-button v-model="minutes" :add="-1"></timer-modal-add-button>
                <timer-modal-add-button v-model="minutes" :add="-5"></timer-modal-add-button>
                <timer-modal-add-button v-model="minutes" :add="1"></timer-modal-add-button>
                <timer-modal-add-button v-model="minutes" :add="5"></timer-modal-add-button>
                <timer-modal-add-button v-model="minutes" :add="10"></timer-modal-add-button>
              </div>
            </div>
          </div>
          <div v-if="timer !== null && timer > 0" class="modal-body-row text-center mt-4 mb-3">
            <a role="button" class="btn btn-danger" @click="set(null)">
              {{ $t('message.player.timer.modal.cancel') }}
            </a>
          </div>
        </div>
        <div v-if="timer !== null && timer > 0" class="modal-footer justify-content-center pb-1">
          <div class="text-center mt-2 mt-0">
            <i class="bi bi-clock"></i>
            &nbsp;&nbsp;{{ $t('message.player.timer.end_in', { minutes: timer }) }}
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

import { usePlayerStore } from '@/stores/playerStore';

import cookies from '@/utils/cookies';

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

      this.$gtag.event(GTAG_ACTION_TIMER_ADD, {
        event_category: GTAG_CATEGORY_TIMER,
        event_label: `${finalValue.toString()} minutes`,
        value: finalValue
      });

      this.minutes = minutes + finalValue;
    },
    set(value: number|string|null|undefined) {
      const modalElem = document.getElementById('timerModal');
      // @ts-expect-error bootstrap is defined on global scope
      // eslint-disable-next-line no-undef
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
        this.$gtag.event(GTAG_ACTION_TIMER_SET, {
          event_category: GTAG_CATEGORY_TIMER,
          event_label: `${finalValue.toString()} minutes`,
          value: finalValue
        });
      } else {
        // cancel
        this.$gtag.event(GTAG_ACTION_TIMER_CANCEL, {
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
