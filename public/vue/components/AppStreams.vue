<template>
  <div class="app-streams">
    <streams-list></streams-list>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import { PLAYER_TYPE_STREAM } from '../config/config';

import StreamsList from './Streams/StreamsList.vue';

export default {
  created() {
    this.$store.dispatch('getConfig');
  },
  mounted() {
    const body = document.querySelector('body');
    body.classList.add('body-app');
    document.title = this.$i18n.tc('message.streaming.title');
  },
  beforeDestroy() {
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
    })
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (to.params.countryOrCategoryOrUuid) {
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
    // update the stream menu that is outside the Vue app for now
    favorites(val) {
      const menuItem = document.getElementById('streaming-menu-favorites');

      if (val.length === 0) {
        menuItem.classList.add('disabled');
      } else {
        menuItem.classList.remove('disabled');
      }
    },
  },
  methods: {
    updateTitle() {
      if (this.playing === true && this.playingRadio
          && this.playingRadio.type === PLAYER_TYPE_STREAM) {
        let preTitle = '♫ ';
        preTitle += `${this.playingRadio.name} - `;

        document.title = `${preTitle}${this.$i18n.tc('message.streaming.title')}`;
      } else {
        document.title = this.$i18n.tc('message.streaming.title');
      }
    }
  }
};
</script>
