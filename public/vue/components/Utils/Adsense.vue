<template>
  <div :ref="setRef" style="margin:auto;" class="mb-3 w-100">
    <ins v-if="mode === 'auto'" class="adsbygoogle"
      style="display:block; margin:auto;width: 195px;"
      :data-ad-client="adsense_key"
      :data-ad-slot="adsense_tag_vert_key"
      data-ad-format="auto"
      data-full-width-responsive="true"></ins>

    <ins v-if="mode === 'horizontal_fix'" class="adsbygoogle mt-2"
      style="display:block;min-width:360px;max-width:728px;height:100px;margin:auto;"
      :data-ad-client="adsense_key"
      :data-ad-slot="adsense_tag_horiz_fix_key"
      data-ad-format="auto"
      data-full-width-responsive="false"></ins>
  </div>
</template>

<script lang="ts">
/* distasteful code */

import { defineComponent } from 'vue';
import type { PropType } from 'vue';

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
  } {
    return {
      // @ts-expect-error defined on global scope
      adsense_key,
      // @ts-expect-error defined on global scope
      adsense_tag_vert_key,
      // @ts-expect-error defined on global scope
      adsense_tag_horiz_fix_key,
      tagRef: null,
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

    window.setTimeout(() => {
      const adScript = document.createElement('script');
      let text = '';
      text += '(adsbygoogle=window.adsbygoogle||[]).requestNonPersonalizedAds=0;';
      text += '(adsbygoogle=window.adsbygoogle || []).pauseAdRequests=0;';
      text += '(adsbygoogle=window.adsbygoogle || []).push({});';

      adScript.text = text;

      if (this.tagRef !== null) {
        this.tagRef.appendChild(adScript);
      }
    }, 2000);
  },
  methods: {
    setRef(el: HTMLElement) {
      if (el) {
        this.tagRef = el;
      }
    },
  }
});
</script>
