<template>
  <div class="container now-page">
    <div class="row">
      <div class="col-12 col-sm-6">
        <h4 class="mt-2 mb-3">{{ $t('message.params_page.title') }}</h4>

        <h5>{{ $t('message.params_page.sub_title') }}</h5>

        <div class="alert alert-info">{{ $t('message.params_page.description') }}</div>
        <div class="form-check mb-3">
          <input class="form-check-input" type="radio" id="stream-deenabled"
            value="disabled" v-model="streamFlux">
          <label class="form-check-label" for="stream-default">
            {{ $t('message.params_page.deactivated') }}
          </label>
        </div>
        <div class="form-check mb-3">
          <input class="form-check-input" type="radio" id="stream-default"
            value="automatic" v-model="streamFlux" :disabled="flux.supported === false">
          <label class="form-check-label" for="stream-default">
            {{ $t('message.params_page.automatic') }}
          </label>
          <div class="form-text">{{ $t('message.params_page.automatic_help') }}</div>
          <div v-if="!flux.supported" class="mt-1 alert alert-warning">
            {{ $t('message.params_page.no_support') }}</div>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" id="stream-two"
            value="enabled" v-model="streamFlux">
          <label class="form-check-label" for="stream-default">
            {{ $t('message.params_page.two_flux') }}
          </label>

          <div class="mt-2 ms-3">
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" id="stream-enabled-10"
                :value="PLAYER_STOP_DELAY_LOWER_BANDWIDTH_MS"
                v-model="streamFluxDuration" :disabled="streamFlux !== 'enabled'">
              <label class="form-check-label" for="stream-default">
                {{ $t('message.params_page.duration_10') }}
              </label>
            </div>
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" id="stream-enabled-30"
                :value="PLAYER_STOP_DELAY_HIGH_BANDWIDTH_MS"
                v-model="streamFluxDuration" :disabled="streamFlux !== 'enabled'">
              <label class="form-check-label" for="stream-default">
                {{ $t('message.params_page.duration_30') }}
              </label>
            </div>
          </div>
        </div>

        <button class="mt-2 btn btn-primary" v-on:click="save">
          {{ $t('message.params_page.save') }}
        </button>

      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import cookies from '../utils/cookies';
import {
  COOKIE_PLAYER_FLUX,
  COOKIE_PLAYER_FLUX_DURATION,
  PLAYER_STOP_DELAY_HIGH_BANDWIDTH_MS,
  PLAYER_STOP_DELAY_LOWER_BANDWIDTH_MS
} from '../config/config';

export default {
  compatConfig: {
    MODE: 3
  },
  /* eslint-disable no-undef */
  data() {
    return {
      locale: this.$i18n.locale,
      streamFlux: this.$store.state.player.flux.selected,
      streamFluxDuration: this.$store.state.player.flux.delayBeforeStop,
      PLAYER_STOP_DELAY_LOWER_BANDWIDTH_MS,
      PLAYER_STOP_DELAY_HIGH_BANDWIDTH_MS
    };
  },
  mounted() {
    document.title = this.$i18n.t('message.params_page.title');
  },
  computed: {
    ...mapState({
      flux: state => state.player.flux
    })
  },
  methods: {
    save() {
      cookies.set(COOKIE_PLAYER_FLUX, this.streamFlux);
      if (this.streamFlux === 'enabled') {
        cookies.set(COOKIE_PLAYER_FLUX_DURATION, parseInt(this.streamFluxDuration, 10));
      }

      this.$store.dispatch('updateFlux');
      this.$store.dispatch('toast',
        {
          type: 'success',
          message: this.$i18n.tc('message.params_page.updated')
        });
    }
  }
};
</script>
