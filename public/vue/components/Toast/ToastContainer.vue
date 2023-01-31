<template>
  <div class="toast-container position-fixed end-0 p-3">
    <toast
      v-for="toast in toasts"
      :key="toast.id"
      :toast="toast"
    ></toast>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

import { useGlobalStore } from '@/stores/globalStore';
import Toast from './Toast.vue';

export default defineComponent({
  components: {
    Toast
  },
  computed: mapState(useGlobalStore, ['toasts'])
});
</script>
