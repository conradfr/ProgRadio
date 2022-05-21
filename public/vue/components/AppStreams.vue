<template>
  <div class="app-streams">
    <div class="container">
      <loading></loading>
      <div class="row">
        <div class="col-md-12">
          <streams-list-filters></streams-list-filters>
          <streams-one v-if="solo" :code-name="solo"></streams-one>
          <streams-list v-if="solo === null"></streams-list>
          <adsense v-if="!userLogged" mode="horizontal_fix"></adsense>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

/* eslint-disable import/no-cycle */
import { useGlobalStore } from '@/stores/globalStore';
import { useStreamsStore } from '@/stores/streamsStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useUserStore } from '@/stores/userStore';

import { PLAYER_TYPE_STREAM } from '@/config/config';

import StreamsListFilters from './Streams/StreamsListFilters.vue';
import StreamsList from './Streams/StreamsList.vue';
import StreamsOne from './Streams/StreamsOne.vue';
import Adsense from './Utils/Adsense.vue';
import Loading from './Utils/Loading.vue';

export default defineComponent({
  components: {
    StreamsListFilters,
    StreamsList,
    StreamsOne,
    Loading,
    Adsense
  },
  created() {
    this.getConfig();
    this.getCountries();
  },
  mounted() {
    const body = document.querySelector('body');
    body?.classList.add('body-app');
    document.title = (this.$i18n as any).tc('message.streaming.title');
  },
  beforeUnmount() {
    const body = document.querySelector('body');
    body?.classList.remove('body-app');
  },
  computed: {
    ...mapState(useGlobalStore, ['isLoading']),
    ...mapState(useStreamsStore, {
      radios: 'streamRadios',
      favorites: 'favorites',
      solo: 'soloExtended'
    }),
    ...mapState(usePlayerStore, {
      playing: 'playing',
      playingRadio: 'radio',
      currentSong: 'currentSong'
    }),
    ...mapState(useUserStore, {
      userLogged: 'logged'
    })
  },
  beforeRouteEnter(to, from, next) {
    next(() => {
      const streamsStore = useStreamsStore();

      if (to.params.countryOrCategoryOrUuid) {
        // this is a radio (uuid)
        if (to.params.countryOrCategoryOrUuid.indexOf('-') !== -1) {
          streamsStore.setSoloExtended((to.params.countryOrCategoryOrUuid as string));
        } else {
          if (to.params.page) {
            streamsStore.pageSet(parseInt((to.params.page as string), 10));
          }

          streamsStore.countrySelection((to.params.countryOrCategoryOrUuid as string));
          streamsStore.setSoloExtended(null);
        }
      } else {
        if (to.params.page) {
          streamsStore.pageSet(parseInt((to.params.page as string), 10));
        }
        streamsStore.getStreamRadios();
      }
    });
  },
  beforeRouteUpdate(to, from, next) {
    const streamsStore = useStreamsStore();

    if (to.params.countryOrCategoryOrUuid) {
      // this is a radio (uuid)
      if (to.params.countryOrCategoryOrUuid.indexOf('-') !== -1) {
        streamsStore.setSoloExtended((to.params.countryOrCategoryOrUuid as string));
      } else {
        if (to.params.page) {
          streamsStore.pageSet(parseInt((to.params.page as string), 10));
        }
        streamsStore.countrySelection((to.params.countryOrCategoryOrUuid as string));
        streamsStore.setSoloExtended(null);
      }
    }
    next();
  },
  /* eslint-disable func-names */
  watch: {
    playing() {
      this.updateTitle();
    },
    playingRadio() {
      this.updateTitle();
    },
    currentSong() {
      this.updateTitle();
    },
  },
  methods: {
    ...mapActions(useStreamsStore, ['getConfig', 'getCountries']),
    updateTitle() {
      if (this.playing === true && this.playingRadio
          && this.playingRadio.type === PLAYER_TYPE_STREAM) {
        let preTitle = '♫ ';

        if (this.currentSong) {
          preTitle += `${this.currentSong} - `;
        }

        preTitle += `${this.playingRadio.name} - `;

        document.title = `${preTitle}${(this.$i18n as any).tc('message.streaming.title')}`;
      } else {
        document.title = (this.$i18n as any).tc('message.streaming.title');
      }
    }
  }
});
</script>
