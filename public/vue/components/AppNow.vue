<template>
  <div class="container now-page">
    <div class="row">
      <div class="col-md-12">
        <h4 class="mb-3">{{ $t('message.now_page.title') }}</h4>
        <ul class="nav nav-tabs" role="tablist">
          <li class="nav-item" role="presentation"
              v-for="entry in rankedCollections" :key="entry.code_name">
            <button class="nav-link" role="tab" type="button"
              :id="entry.code_name + '-tab'"
              :class="{ 'active': currentCollection === entry.code_name}"
              :ariaSelected="currentCollection === entry.code_name ? 'true' : 'false'"
              :aria-controls="entry.code_name"
              v-on:click="setActiveCollection(entry.code_name)"
            >
              {{ entry.name_FR }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <div class="tab-content tab-now">
          <div class="mt-3 mb-4">
            <router-link :to="'/' + locale + '/schedule/' + currentCollection">
              {{ $t('message.radio_page.back') }}
            </router-link>
          </div>
          <now-radio
              v-for="radio in rankedRadios"
              :key="radio.code_name"
              :radio="radio"
          ></now-radio>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import NowRadio from './Now/NowRadio.vue';

export default {
  compatConfig: {
    MODE: 3
  },
  components: {
    NowRadio
  },
  /* eslint-disable no-undef */
  data() {
    return {
      locale: this.$i18n.locale
    };
  },
  created() {
    this.$store.dispatch('getRadiosData');
    this.$store.dispatch('getSchedule',
      {
        collection: this.$route.params.collection
          ? this.$route.params.collection : this.$store.state.schedule.currentCollection
      });
    if (this.$route.params.collection) {
      this.$store.dispatch('switchCollection', this.$route.params.collection);
    }

    setTimeout(
      () => {
        this.$store.dispatch('getSchedule');
      },
      3500
    );
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.$store.dispatch('calendarToday');
    });
  },
  // TODO fix this hack
  mounted() {
    const body = document.querySelector('body');
    body.classList.remove('body-app');

    const app = document.getElementById('app');
    app.classList.add('no-background');

    document.title = this.$i18n.t('message.now_page.title');
  },
  beforeUnmount() {
    const body = document.querySelector('body');
    body.classList.add('body-app');

    const app = document.getElementById('app');
    app.classList.remove('no-background');
  },
  computed: {
    ...mapState({
      radios: state => state.schedule.radios,
      currentCollection: state => state.schedule.currentCollection,
    }),
    ...mapGetters([
      'rankedCollections',
      'rankedRadios'
    ]),
  },
  methods: {
    setActiveCollection(collectionCodeName) {
      this.$store.dispatch('switchCollection', collectionCodeName);
    },
  }
};
</script>
