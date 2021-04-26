<template>
  <div style="z-index:1300" class="modal fade" id="timerModal" tabindex="-1"
    role="dialog" aria-labelledby="timerModalLabel">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 class="modal-title" id="timerModalLabel">
            {{ $t('message.player.timer.modal.title') }}
          </h4>
        </div>
        <div class="modal-body">
          <div class="modal-body-row">
            <h6>{{ $t('message.player.timer.modal.quick') }}</h6>
            <div class="btn-group btn-group-justified" role="group" aria-label="...">
              <timer-modal-set-button minutes="30"></timer-modal-set-button>
              <timer-modal-set-button minutes="60"></timer-modal-set-button>
              <timer-modal-set-button minutes="90"></timer-modal-set-button>
              <timer-modal-set-button minutes="120" hide-mobile="true" ></timer-modal-set-button>
            </div>
          </div>

          <div class="modal-body-row">
            <h6>{{ $t('message.player.timer.modal.add') }}</h6>
            <div class="btn-group btn-group-justified" role="group" aria-label="...">
              <timer-modal-add-button v-model="minutes" add="15"></timer-modal-add-button>
              <timer-modal-add-button v-model="minutes" add="30"></timer-modal-add-button>
              <timer-modal-add-button v-model="minutes" add="60"></timer-modal-add-button>
              <timer-modal-add-button v-model="minutes" add="120"
                hide-mobile="true"></timer-modal-add-button>
            </div>
          </div>
          <div class="modal-body-row">
            <h6>{{ $t('message.player.timer.modal.length') }}</h6>
            <div class="row">
              <div class="col-xs-12 col-md-3">
                <form class="form-inline">
                  <div class="form-group">
                    <div class="input-group">
                      <input type="number" class="form-control"
                         v-model="minutes" min="1"
                         :placeholder="$t('message.player.timer.modal.placeholder')">
                      <div class="input-group-addon">
                        {{ $t('message.player.timer.modal.abrv') }}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div class="col-xs-push-6 col-xs-4 col-sm-push-0 col-md-push-0 col-md-4">
                <a role="button" class="btn btn-primary"
                   v-on:click="set()" :class="{'disabled': minutes < 1}">
                  {{ $t('message.player.timer.modal.set') }}
                </a>
              </div>
              <div class="col-xs-pull-4 col-xs-7 col-sm-pull-0 col-md-pull-0 col-md-5"
                v-if="timer !== null && timer > 0">
                <a role="button" class="btn btn-danger"
                   v-on:click="set(null)">
                  {{ $t('message.player.timer.modal.cancel') }}
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer" v-if="timer !== null && timer > 0">
          <div class="text-center">
            <span class="glyphicon glyphicon-time" aria-hidden="true"></span>
            &nbsp;&nbsp;{{ $tc('message.player.timer.end_in', timer, { minutes: timer }) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';

import {
  DEFAULT_TIMER_MINUTES,
  COOKIE_LAST_TIMER,
  GTAG_ACTION_TIMER_SET,
  GTAG_ACTION_TIMER_ADD,
  GTAG_CATEGORY_TIMER,
  GTAG_ACTION_TIMER_CANCEL
} from '../../config/config';

import TimerModalSetButton from './TimerModalSetButton.vue';
import TimerModalAddButton from './TimerModalAddButton.vue';

const VueCookie = require('vue-cookie');

Vue.use(VueCookie);

export default {
  components: {
    TimerModalSetButton,
    TimerModalAddButton
  },
  data() {
    return {
      minutes: Vue.cookie.get(COOKIE_LAST_TIMER)
        ? parseInt(Vue.cookie.get(COOKIE_LAST_TIMER), 10) : DEFAULT_TIMER_MINUTES,
    };
  },
  computed: {
    ...mapState({
      timer: state => state.player.timer
    })
  },
  methods: {
    add(value) {
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
    set(value) {
      /* eslint-disable no-undef */
      $('#timerModal').modal('hide');

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

      this.$store.dispatch('setTimer', finalValue);
    }
  }
};
</script>
