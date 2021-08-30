<template>
  <div class="app-streams">
    <streams-list></streams-list>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import { PLAYER_TYPE_STREAM } from '../config/config';

// import StreamsStore from '../store/StreamsStore';
import StreamsList from './Streams/StreamsList.vue';

export default {
  compatConfig: {
    MODE: 3
  },
  created() {
    // this.$store.registerModule('streams', StreamsStore);
    this.$store.dispatch('getConfig');
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
  components: {
    StreamsList
  },
  computed: {
    ...mapState({
      favorites: state => state.streams.favorites,
      playingRadio: state => state.player.radio,
      playing: state => state.player.playing
    }),
    ...mapGetters([
      'currentSong'
    ])
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (to.params.countryOrCategoryOrUuid) {
        // this is a radio (uuid)
        if (to.params.countryOrCategoryOrUuid.indexOf('-') !== -1) {
          vm.$store.dispatch('getStreamRadio', to.params.countryOrCategoryOrUuid);
        } else {
          vm.$store.dispatch('countrySelection', to.params.countryOrCategoryOrUuid);
        }
      }
    });
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.countryOrCategoryOrUuid) {
      // this is a radio (uuid)
      if (to.params.countryOrCategoryOrUuid.indexOf('-') !== -1) {
        this.$store.dispatch('getStreamRadio', to.params.countryOrCategoryOrUuid);
      } else {
        this.$store.dispatch('countrySelection', to.params.countryOrCategoryOrUuid);
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
