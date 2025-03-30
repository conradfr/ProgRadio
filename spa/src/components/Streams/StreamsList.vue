<template>
  <div v-if="radios.length" class="streams d-flex justify-content-center">
    <TransitionGroup name="stream-list">
      <streams-list-one
        v-for="entry in radios"
        :key="entry.code_name"
        :radio="entry">
      </streams-list-one>
    </TransitionGroup>
  </div>
  <div v-else-if="isLoading === false" class="row">
    <div class="offset-md-3 col-md-6">
      <div class="alert alert-warning space-up-20 text-center" role="alert">
        {{ $t('message.streaming.no_results') }}
      </div>
    </div>
  </div>
  <streams-list-pagination v-if="radios.length"></streams-list-pagination>
  <div v-if="locale !== 'fr' || !isProgRadio || !userLogged" class="mt-0 mt-sm-2">
    <adsense mode="horizontal_fix"></adsense>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

import { useGlobalStore } from '@/stores/globalStore';
import { useStreamsStore } from '@/stores/streamsStore';
import { useUserStore } from '@/stores/userStore';

import StreamsListPagination from './StreamsListPagination.vue';
import StreamsListOne from './StreamsListOne.vue';
import Adsense from '../Utils/Adsense.vue';

export default defineComponent({
  components: {
    StreamsListPagination,
    StreamsListOne,
    Adsense
  },
  data(): {
    locale: string,
    isProgRadio: boolean
  } {
    return {
      locale: this.$i18n.locale,
      // @ts-expect-error defined on global scope
      // eslint-disable-next-line no-undef
      isProgRadio
    };
  },
  computed: {
    ...mapState(useGlobalStore, ['isLoading']),
    ...mapState(useUserStore, {
      userLogged: 'logged'
    }),
    ...mapState(useStreamsStore, {
      radios: 'streamRadios'
    })
  },
});
</script>
