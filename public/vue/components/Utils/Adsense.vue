<template>
  <div :ref="setRef" style="margin:auto;">
    <div v-if="showToast" class="fixed-bottom p-4 toast-cookie-container-app">
      <div class="toast toast-cookie-app bg-dark text-white"
        role="alert" data-bs-autohide="false">
        <div class="toast-body p-2 d-flex flex-row justify-content-between align-items-center">
          <p class="flex-fill m-0 px-2 fs-6">
            {{ $t('message.consent.allow') }}<br>
            <small> {{ $t('message.consent.disclaimer') }}</small>
          </p>
          <div>
            <button type="button" class="btn btn-sm btn-outline-success"
              v-on:click="clickYes">
              {{ $t('message.consent.accept') }}</button>
            <button type="button" class="btn btn-sm btn-outline-warning mr-3"
              v-on:click="clickNo">
              {{ $t('message.consent.deny') }}</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="mode === 'auto'">
      <ins class="adsbygoogle"
        style="display:block; margin:auto;"
        :data-ad-client="adsense_key"
        :data-ad-slot="adsense_tag_vert_key"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
    </div>
    <div class="mt-2" v-if="mode === 'horizontal_fix'">
      <ins class="adsbygoogle"
        style="display:block;min-width:360px;max-width:728px;height:100px;margin:auto;"
        :data-ad-client="adsense_key"
        :data-ad-slot="adsense_tag_horiz_fix_key"
        data-full-width-responsive="true"></ins>
    </div>
  </div>
</template>

<script lang="ts">
/* distasteful code */

import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import { COOKIE_CONSENT } from '@/config/config';
import cookies from '../../utils/cookies';

/* eslint-disable no-undef */
/* eslint-disable camelcase */
export default defineComponent({
  props: {
    mode: {
      type: String as PropType<string>,
      default: 'auto',
      required: false
    },
  },
  /* eslint-disable indent */
  data(): {
    adsense_key: string,
    adsense_tag_vert_key: string,
    adsense_tag_horiz_fix_key: string,
    tagRef: HTMLElement|null,
    toast: any|null,
    showToast: boolean,
    consent: boolean
  } {
    return {
      // @ts-expect-error defined on global scope
      adsense_key,
      // @ts-expect-error defined on global scope
      adsense_tag_vert_key,
      // @ts-expect-error defined on global scope
      adsense_tag_horiz_fix_key,
      tagRef: null,
      toast: null,
      showToast: cookies.get(COOKIE_CONSENT, null) === null,
      consent: cookies.get(COOKIE_CONSENT, '0') === '1',
    };
  },
  mounted() {
    const adScriptExt = document.createElement('script');
    adScriptExt.setAttribute('async', '');
    adScriptExt.setAttribute('crossorigin', 'anonymous');
    /* eslint-disable max-len */
    // @ts-expect-error defined on global scope
    adScriptExt.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense_key}`;

    if (this.tagRef !== null) {
      this.tagRef.appendChild(adScriptExt);
    }

    const adScript = document.createElement('script');
    let text = '';
    if (this.consent) {
      text += '(adsbygoogle=window.adsbygoogle||[]).requestNonPersonalizedAds=0;';
      text += '(adsbygoogle = window.adsbygoogle || []).push({});';

      /*
        data-ad-test="on"
        data-adtest="on"
        data-adbreak-test="on"
      */
      // text += 'const adBreak = adConfig = function(o) {adsbygoogle.push(o);}';
    } else if (!this.showToast) {
      text += '(adsbygoogle=window.adsbygoogle||[]).requestNonPersonalizedAds=1;';
      text += '(adsbygoogle = window.adsbygoogle || []).push({});';
    } else {
      text += '(adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1;';
    }
    adScript.text = text;

    if (this.tagRef !== null) {
      this.tagRef.appendChild(adScriptExt);
    }

    /* eslint-disable no-undef */
    if (this.showToast /* && typeof boostrap !== 'undefined' */) {
      setTimeout(() => {
        const toastCookieElem = document.getElementsByClassName('toast-cookie-app')[0];
        /* eslint-disable no-undef */
        // @ts-expect-error bootstrap is defined on global scope
        this.toast = new bootstrap.Toast(toastCookieElem);
        this.toast?.show();
      }, 250);
    }
  },
  methods: {
    setRef(el: HTMLElement) {
      if (el) {
        this.tagRef = el;
      }
    },
    clickYes() {
      cookies.set(COOKIE_CONSENT, 1);
      this.toast.hide();
      this.showToast = false;

      const adScript = document.createElement('script');
      /* eslint-disable max-len */
      adScript.text = '(adsbygoogle=window.adsbygoogle||[]).requestNonPersonalizedAds=0;(adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=0;(adsbygoogle = window.adsbygoogle || []).push({});';

      if (this.tagRef !== null) {
        this.tagRef.appendChild(adScript);
      }
    },
    clickNo() {
      cookies.set(COOKIE_CONSENT, 0);
      this.toast.hide();
      this.showToast = false;

      const adScript = document.createElement('script');
      /* eslint-disable max-len */
      adScript.text = '(adsbygoogle=window.adsbygoogle||[]).requestNonPersonalizedAds=1;(adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=0;(adsbygoogle = window.adsbygoogle || []).push({});';

      if (this.tagRef !== null) {
        this.tagRef.appendChild(adScript);
      }
    }
  }
});
</script>
