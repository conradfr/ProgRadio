import remove from 'lodash/remove';

import { defineStore } from 'pinia';

import { TOAST_TYPE_ERROR, TOAST_DURATION } from '@/config/config';

import type { Toast } from '@/types/toast';
import type { Radio } from '@/types/radio';
import type { Stream } from '@/types/stream';

/* eslint-disable import/no-cycle */
import { useScheduleStore } from '@/stores/scheduleStore';
import { useStreamsStore } from '@/stores/streamsStore';

import typeUtils from '../utils/typeUtils';

interface State {
  loading: number
  toasts: Toast[]
}

/* eslint-disable import/prefer-default-export */
export const useGlobalStore = defineStore('global', {
  state: (): State => (
    {
      // based on an increment to allow concurrent ajax requests and a unified display indicator
      loading: 0,
      toasts: []
    }
  ),
  getters: {
    isLoading: state => state.loading > 0
  },
  actions: {
    setLoading(isLoading: boolean) {
      const incrValue = isLoading ? 1 : -1;
      let newStateValue = this.loading + incrValue;
      // sometimes actions do not set loading as true but always set false once completed.
      if (newStateValue < 0) {
        newStateValue = 0;
      }

      this.loading = newStateValue;
    },
    sendList(radio: Radio|Stream) {
      const scheduleStore = useScheduleStore();
      const streamsStore = useStreamsStore();

      if (typeUtils.isRadio(radio)) {
        scheduleStore.sendRadiosList(/* radio.code_name */);
      } else {
        streamsStore.sendStreamsList(/* radio.code_name */);
      }
    },
    displayToast(params: { message: string, type: 'success'|'error' }) {
      const toast: Toast = {
        message: params.message,
        id: `t${Date.now()}-${Math.floor(Math.random() * 100)}`,
        type: params.type || TOAST_TYPE_ERROR,
        duration: TOAST_DURATION
      };

      this.toasts.push(toast);
    },
    toastConsumed(id: string) {
      this.toasts = remove(this.toasts, (t: Toast) => t.id === id);
    }
  }
});
