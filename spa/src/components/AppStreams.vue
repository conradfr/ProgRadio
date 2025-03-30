<template>
  <div class="app-streams">
    <div class="container">
      <loading></loading>
      <div class="row">
        <div class="col-md-12">
          <streams-list-filters></streams-list-filters>
          <streams-one v-if="solo" :code-name="solo"></streams-one>
          <streams-list v-if="solo === null"></streams-list>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

import { useGlobalStore } from '@/stores/globalStore';
import { useStreamsStore } from '@/stores/streamsStore';
import { usePlayerStore } from '@/stores/playerStore';

import PlayerStatus from '@/types/player_status';

import { PLAYER_TYPE_STREAM } from '@/config/config';

import StreamsListFilters from './Streams/StreamsListFilters.vue';
import StreamsList from './Streams/StreamsList.vue';
import StreamsOne from './Streams/StreamsOne.vue';
import Loading from './Utils/Loading.vue';

export default defineComponent({
  components: {
    StreamsListFilters,
    StreamsList,
    StreamsOne,
    Loading
  },
  data() {
    return {
      PlayerStatus,
    };
  },
  created() {
    setTimeout(
      () => {
        this.getConfig();
        this.getCountries();
      },
      20
    );
  },
  mounted() {
    const body = document.querySelector('body');
    body?.classList.add('body-app');
    document.title = this.$i18n.t('message.streaming.title');

    // favorites shortcut
    const mobileFavoritesShortcut = document.getElementById('mobile-streaming-favorites-shortcut');
    mobileFavoritesShortcut?.classList.remove('d-none');
  },
  beforeUnmount() {
    const body = document.querySelector('body');
    body?.classList.remove('body-app');

    // favorites shortcut
    const mobileFavoritesShortcut = document.getElementById('mobile-streaming-favorites-shortcut');
    mobileFavoritesShortcut?.classList.add('d-none');
  },
  beforeRouteEnter(to, _from, next) {
    next(() => {
      const streamsStore = useStreamsStore();

      if (to.params.hasOwnProperty('countryOrCategoryOrUuid')) {
        // this is a radio (uuid)
        if (to.params.countryOrCategoryOrUuid.indexOf('-') !== -1) {
          streamsStore.setSoloExtended((to.params.countryOrCategoryOrUuid as string));
        } else {
          if (to.params.hasOwnProperty('page') && to.params.page !== '') {
            streamsStore.pageSet(parseInt((to.params.page as string), 10));
          }

          streamsStore.countrySelection(to.params.countryOrCategoryOrUuid as string);
          streamsStore.setSoloExtended(null);
        }
      } else {
        if (to.params.hasOwnProperty('page') && to.params.page !== '') {
          streamsStore.pageSet(parseInt((to.params.page as string), 10));
        }

        streamsStore.getStreamRadios();
      }
    });
  },
  beforeRouteUpdate(to, _from, next) {
    const streamsStore = useStreamsStore();

    if (to.params.hasOwnProperty('countryOrCategoryOrUuid')) {
      // this is a radio (uuid)
      if (to.params.countryOrCategoryOrUuid.indexOf('-') !== -1) {
        streamsStore.setSoloExtended((to.params.countryOrCategoryOrUuid as string));
      } else {
        if (to.params.hasOwnProperty('page') && to.params.page !== '') {
          streamsStore.pageSet(parseInt((to.params.page as string), 10));
        }

        streamsStore.countrySelection((to.params.countryOrCategoryOrUuid as string));
        streamsStore.setSoloExtended(null);
      }
    }
    next();
  },
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
  computed: {
    ...mapState(useGlobalStore, ['isLoading']),
    ...mapState(useStreamsStore, {
      solo: 'soloExtended'
    }),
    ...mapState(usePlayerStore, {
      playing: 'playing',
      playingRadio: 'radio',
      currentSong: 'currentSong'
    })
  },
  methods: {
    ...mapActions(useStreamsStore, ['getConfig', 'getCountries']),
    updateTitle() {
      if (this.playing === PlayerStatus.Playing && this.playingRadio
          && this.playingRadio.type === PLAYER_TYPE_STREAM) {
        let preTitle = '♫ ';

        if (this.currentSong && this.currentSong[0]) {
          preTitle += `${this.currentSong[0]} - `;
        }

        preTitle += `${this.playingRadio.name} - `;

        document.title = `${preTitle}${this.$i18n.t('message.streaming.title')}`;
      } else {
        document.title = this.$i18n.t('message.streaming.title');
      }
    }
  }
});
</script>
