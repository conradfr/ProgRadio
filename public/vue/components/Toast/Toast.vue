<template>
  <div ref="root" class="toast text-white"
    :class="{
      'bg-danger': toast.type === 'error',
      'bg-success': toast.type === 'success'
    }"
    role="alert" aria-live="assertive" aria-atomic="true">
    <div class="d-flex justify-content-center align-items-center p-3">
      <div class="toast-icon"><i class="bi"
        :class="{
          'bi-x-circle-fill': toast.type === 'error',
          'bi-check-circle-fill': toast.type === 'success'
        }"></i>
      </div>
      <div class="toast-body flex-fill py-0 text-center align-middle">
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
  compatConfig: {
    MODE: 3
  },
  props: {
    toast: Object
  },
  setup(props) {
    const store = useStore();
    const root = ref(null);

    onMounted(() => {
      /* eslint-disable no-undef */
      const toastBs = new bootstrap.Toast(root.value, { delay: props.toast.duration });
      toastBs.show();

      setTimeout(
        () => {
          toastBs.hide();
          store.dispatch('toastConsumed', props.toast.id);
        },
        props.toast.duration + 500
      );
    });

    return {
      root
    };
  }
};
</script>
