<template>
  <transition appear>
    <div class="loading" v-if="isLoading">
      <div class="d-flex align-items-center alert alert-progradio" role="alert">
        <div class="spinner-border" role="status"></div>
        <div class="flex-grow-1 alert-progradio-text text-center" v-once>
          {{ $t('message.loading') }}
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

/* eslint-disable import/no-cycle */
import { useGlobalStore } from '@/stores/globalStore';

export default defineComponent({
  computed: mapState(useGlobalStore, ['isLoading']),
});
</script>
