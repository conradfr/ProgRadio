<template>
  <div ref="adtag">
    <div v-if="showToast" class="fixed-bottom p-4 toast-cookie-container-app">
      <div class="toast toast-cookie-app bg-dark text-white w-100 w-sm-25"
        role="alert" data-bs-autohide="false">
        <div class="toast-body p-2 d-flex flex-row justify-content-between align-items-center">
          <p class="flex-fill m-0 px-2 fs-6">
            {{ $t('message.consent.allow') }}<br>
            <small> {{ $t('message.consent.disclaimer') }}</small>
          </p>
          <div>
            <button type="button" class="btn btn-sm btn-outline-warning mr-3"
              v-on:click="clickNo">
              {{ $t('message.consent.deny') }}</button>
            <button type="button" class="btn btn-sm btn-outline-success"
              v-on:click="clickYes">
              {{ $t('message.consent.accept') }}</button>
          </div>
        </div>
      </div>
    </div>
    <ins class="adsbygoogle"
         style="display:block; margin:auto;"
         :data-ad-client="adsense_key"
         :data-ad-slot="adsense_tag_key "
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
  </div>
</template>

<script>
/* distasteful code */

import cookies from '../../utils/cookies';
import { COOKIE_CONSENT } from '../../config/config';

/* eslint-disable no-undef */
/* eslint-disable camelcase */
export default {
  compatConfig: {
    MODE: 3
  },
  data() {
    return {
      adsense_key,
      adsense_tag_key,
      toast: null,
      showToast: cookies.get(COOKIE_CONSENT, null) === null,
      consent: cookies.get(COOKIE_CONSENT, '0') === '1'
    };
  },
  mounted() {
    const adScriptExt = document.createElement('script');
    adScriptExt.setAttribute('async', '');
    adScriptExt.setAttribute('crossorigin', 'anonymous');
    adScriptExt.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense_key}`;
    this.$refs.adtag.appendChild(adScriptExt);

    const adScript = document.createElement('script');
    // let text = '(adsbygoogle = window.adsbygoogle || []).push({});';
    let text = '';
    if (this.consent === true) {
      text += '(adsbygoogle=window.adsbygoogle||[]).requestNonPersonalizedAds=0;';
      text += '(adsbygoogle = window.adsbygoogle || []).push({});';
    } else if (this.showToast === false) {
      text += '(adsbygoogle=window.adsbygoogle||[]).requestNonPersonalizedAds=1;';
      text += '(adsbygoogle = window.adsbygoogle || []).push({});';
    } else {
      text += '(adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1;';
    }
    adScript.text = text;
    this.$refs.adtag.appendChild(adScript);

    /* eslint-disable no-undef */
    if (this.showToast === true /* && typeof boostrap !== 'undefined' */) {
      const toastCookieElem = document.getElementsByClassName('toast-cookie-app')[0];
      /* eslint-disable no-undef */
      this.toast = new bootstrap.Toast(toastCookieElem);
      this.toast.show();
    }
  },
  methods: {
    clickYes() {
      cookies.set(COOKIE_CONSENT, 1);
      this.toast.hide();
      this.showToast = false;

      const adScript = document.createElement('script');
      adScript.text = '(adsbygoogle=window.adsbygoogle||[]).requestNonPersonalizedAds=0;(adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=0;(adsbygoogle = window.adsbygoogle || []).push({});';
      this.$refs.adtag.appendChild(adScript);
    },
    clickNo() {
      cookies.set(COOKIE_CONSENT, 0);
      this.toast.hide();
      this.showToast = false;

      const adScript = document.createElement('script');
      adScript.text = '(adsbygoogle=window.adsbygoogle||[]).requestNonPersonalizedAds=1;(adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=0;(adsbygoogle = window.adsbygoogle || []).push({});';
      this.$refs.adtag.appendChild(adScript);
    }
  }
};
</script>
