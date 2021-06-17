<template>
  <div class="toast-container position-absolute end-0 p-3">
    <toast
      v-for="toast in toasts"
      :key="toast.id"
      :toast="toast"
    ></toast>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import Toast from './Toast.vue';

export default {
  compatConfig: {
    MODE: 3
  },
  components: {
    Toast
  },
  computed: mapState({
    toasts: state => state.toasts,
  })
};
</script>
