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

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import type { PropType } from 'vue';

import type { Toast } from '@/types/toast';
import { useGlobalStore } from '@/stores/globalStore';

export default defineComponent({
  props: {
    toast: {
      type: Object as PropType<Toast>,
      required: true
    }
  },
  setup(props) {
    const globalStore = useGlobalStore();
    const root = ref(null);

    onMounted(() => {
      // @ts-expect-error boostrap is defined on the global scope
      // eslint-disable-next-line no-undef
      const toastBs = new bootstrap.Toast(root.value, { delay: props.toast.duration });
      toastBs!.show();

      setTimeout(
        () => {
          toastBs.hide();
          globalStore.toastConsumed(props.toast.id);
        },
        props.toast.duration + 500
      );
    });

    return {
      root
    };
  }
});
</script>
