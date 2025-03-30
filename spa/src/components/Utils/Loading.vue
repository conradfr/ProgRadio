<template>
  <Transition appear>
    <div v-if="isLoading" class="loading">
      <div class="d-flex align-items-center alert alert-progradio" role="alert">
        <div class="spinner-border" role="status"></div>
        <div v-once class="flex-grow-1 alert-progradio-text text-center">
          {{ $t('message.loading') }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

import { useGlobalStore } from '@/stores/globalStore';

export default defineComponent({
  computed: mapState(useGlobalStore, ['isLoading']),
});
</script>
