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

<script>
import { mapState, mapGetters } from 'vuex';

import { PLAYER_TYPE_STREAM } from '../config/config';

import StreamsListFilters from './Streams/StreamsListFilters.vue';
import StreamsList from './Streams/StreamsList.vue';
import StreamsOne from './Streams/StreamsOne.vue';
import Loading from './Utils/Loading.vue';

export default {
  compatConfig: {
    MODE: 3
  },
  components: {
    StreamsListFilters,
    StreamsList,
    StreamsOne,
    Loading
  },
  created() {
    // this.$store.registerModule('streams', StreamsStore);
    this.$store.dispatch('getConfig');
    this.$store.dispatch('getCountries');
  },
  mounted() {
    const body = document.querySelector('body');
    body.classList.add('body-app');
    document.title = this.$i18n.tc('message.streaming.title');
  },
  beforeUnmount() {
    const body = document.querySelector('body');
    body.classList.remove('body-app');
  },
  computed: {
    ...mapState({
      favorites: state => state.streams.favorites,
      playingRadio: state => state.player.radio,
      playing: state => state.player.playing,
      radios: state => state.streams.streamRadios,
      solo: state => state.streams.soloExtended
    }),
    ...mapGetters([
      'currentSong',
      'isLoading'
    ])
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (to.params.countryOrCategoryOrUuid) {
        // this is a radio (uuid)
        if (to.params.countryOrCategoryOrUuid.indexOf('-') !== -1) {
          vm.$store.dispatch('setSoloExtended', to.params.countryOrCategoryOrUuid);
        } else {
          if (to.params.page) {
            vm.$store.dispatch('pageSet', to.params.page);
          }
          vm.$store.dispatch('countrySelection', to.params.countryOrCategoryOrUuid);
          vm.$store.dispatch('setSoloExtended', null);
        }
      } else {
        if (to.params.page) {
          vm.$store.dispatch('pageSet', to.params.page);
        }
        vm.$store.dispatch('getStreamRadios');
      }
    });
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.countryOrCategoryOrUuid) {
      // this is a radio (uuid)
      if (to.params.countryOrCategoryOrUuid.indexOf('-') !== -1) {
        this.$store.dispatch('setSoloExtended', to.params.countryOrCategoryOrUuid);
      } else {
        if (to.params.page) {
          this.$store.dispatch('pageSet', to.params.page);
        }
        this.$store.dispatch('countrySelection', to.params.countryOrCategoryOrUuid);
        this.$store.dispatch('setSoloExtended', null);
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
    updateTitle() {
      if (this.playing === true && this.playingRadio
          && this.playingRadio.type === PLAYER_TYPE_STREAM) {
        let preTitle = '♫ ';

        if (this.currentSong) {
          preTitle += `${this.currentSong} - `;
        }

        preTitle += `${this.playingRadio.name} - `;

        document.title = `${preTitle}${this.$i18n.tc('message.streaming.title')}`;
      } else {
        document.title = this.$i18n.tc('message.streaming.title');
      }
    }
  }
};
</script>
