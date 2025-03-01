<template>
  <div class="player-output d-none d-md-block">
    <div class="dropdown">
      <div class="dropdown-toggle cursor-pointer" style="margin-top: 4px; margin-left: -1px;"
        data-bs-auto-close="outside" data-bs-toggle="dropdown" aria-expanded="false"
        :title="$t('message.player.output.choose')">
      </div>
      <div class="dropdown-menu p-2" style="min-width: 300px;">
        <div v-if="!displaySelector">
          <a class="dropdown-item cursor-pointer" v-on:click="listDevices()">
            <small>{{ $t('message.player.output.choose') }}</small>
          </a>
        </div>
        <div v-if="displaySelector">
          <label class="form-check-label mb-2 ps-2" for="output-select">
            <small>{{ $t('message.player.output.choose_label') }}</small>
          </label>
          <select class="form-select form-select-sm select-output" name="output-select" aria-label="Audio output select"
            v-model="selectedDevice" placeholder="Select device">
            <option v-for="choice in deviceOptions" :key="choice.deviceId" :value="choice.deviceId">
              {{ choice.label }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions } from 'pinia';

import {
  GTAG_CATEGORY_PLAYER,
  GTAG_ACTION_OUTPUT_CHANGE,
  GTAG_ACTION_OUTPUT_VALUE,
} from '@/config/config';

import { useGlobalStore } from '@/stores/globalStore';

export default defineComponent({
  props: {
    selectedDeviceId: {
      type: String,
      required: false
    },
  },
  /* eslint-disable indent */
  data(): {
    displaySelector: boolean,
    deviceOptions: Array<MediaDeviceInfo>,
  } {
    return {
      displaySelector: false,
      deviceOptions: [],
    };
  },
  mounted() {
    if (this.selectedDeviceId && this.selectedDeviceId !== '' && this.selectedDeviceId !== 'default') {
      this.displaySelector = true;
    }

    navigator.mediaDevices.addEventListener('devicechange', this.deviceChanged);

    /*
    // Firefox launches the permission dialog instead of just returning the permissions so we don't use this yet
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
      if (permissionStatus.state === 'granted') {
        this.listDevices();
      }
    } catch (error) {
      this.displaySelector = false;
    } */
  },
  onBeforeUnmount() {
    navigator.mediaDevices.removeEventListener('devicechange', this.deviceChanged);
  },
  computed: {
    selectedDevice: {
      get() {
        console.log(this.selectedDeviceId);
        return this.selectedDeviceId;
      },
      set(value: string) {
        (this as any).$gtag.event(GTAG_ACTION_OUTPUT_CHANGE, {
          event_category: GTAG_CATEGORY_PLAYER,
          event_label: null,
          value: GTAG_ACTION_OUTPUT_VALUE
        });

        this.$emit('changeOutput', value);
      }
    }
  },
  methods: {
    ...mapActions(useGlobalStore, ['displayToast']),
    async deviceChanged() {
      await this.listDevices();

      console.log('heee');
      console.log(this.selectedDeviceId);
      if (!this.selectedDeviceId || this.selectedDeviceId === '') {
        return;
      }

      console.log('hooo');
      console.log(this.deviceOptions.map(device => device.deviceId));

      // if current device does not exist anymore we fall back to default
      if (!this.deviceOptions.map(device => device.deviceId).includes(this.selectedDeviceId)) {
        console.log('not here');
        this.$emit('changeOutput', 'default');
      }
    },
    async listDevices() {
      const options: Array<any> = [];
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();

        devices.forEach((device) => {
          if (device.kind === 'audiooutput') {
            options.push(device);
          }
        });

        this.displaySelector = true;
      } catch (error) {
        this.displaySelector = false;

        this.displayToast({
          message: (this.$i18n as any).tc('message.generic.error'),
          type: 'error'
        });
      }

      this.deviceOptions = options;
      return Promise.resolve();
    },
  }
});
</script>
