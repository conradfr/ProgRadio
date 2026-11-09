<template>
  <img :src="src" :class="['vueflag', `vueflag--${size}`]" alt="" @error="onError">
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

// Country flag from public/img/flags/, registered globally as <vue-flag> (replaces @growthbunker/vueflags).
// Sizes are in sass/components/flag.scss
export default defineComponent({
  props: {
    // ISO 3166-1 alpha-2, any case
    code: {
      type: String as PropType<string | null>,
      default: null
    },
    size: {
      type: String as PropType<'nano' | 'micro' | 'mini'>,
      required: true
    }
  },
  data() {
    return {
      // no svg for this code
      failed: false
    };
  },
  watch: {
    code() {
      this.failed = false;
    }
  },
  computed: {
    src(): string {
      const code = this.failed || !this.code ? 'unknown' : this.code.toLowerCase();
      return `${this.$CDN_BASE_URL}img/flags/${code}.svg`;
    }
  },
  methods: {
    // falls back to the unknown flag (no loop if that one fails too: the src doesn't change anymore)
    onError() {
      this.failed = true;
    }
  }
});
</script>
