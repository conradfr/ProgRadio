<template>
  <div class="container now-page" style="direction:ltr/*rtl:ignore*/;">
    <div class="row">
      <div class="col-md-12">
        <h4 class="mb-3">{{ $t('message.now_page.title') }}</h4>
        <ul class="nav nav-tabs" role="tablist">
          <li v-for="entry in rankedCollections" :key="entry.code_name" class="nav-item" role="presentation">
            <button
              :id="entry.code_name + '-tab'"
              class="nav-link"
              :class="{ 'active': currentCollection === entry.code_name}"
              :ariaSelected="currentCollection === entry.code_name ? 'true' : 'false'"
              :aria-controls="entry.code_name"
              role="tab" type="button"
              @click="setActiveCollection(entry.code_name)">
              {{ entry[`name_${locale.toUpperCase()}`] }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div class="row">
      <div class="col-12 col-sm-9">
        <div class="tab-content tab-now">
          <div class="mt-3 mb-4">
            <router-link :to="'/' + locale + '/schedule/' + currentCollection">
              {{ $t('message.radio_page.back') }}
            </router-link>
          </div>
          <now-radio
              v-for="radio in rankedRadios"
              :key="radio.code_name"
              :radio="radio">
          </now-radio>
        </div>
      </div>
      <div v-if="!userLogged" class="col-12 col-sm-3 text-center">
        <adsense></adsense>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

import { useScheduleStore } from '@/stores/scheduleStore';
import { useUserStore } from '@/stores/userStore';

import NowRadio from './Now/NowRadio.vue';
import Adsense from './Utils/Adsense.vue';

export default defineComponent({
  components: {
    NowRadio,
    Adsense
  },
  data() {
    return {
      locale: this.$i18n.locale
    };
  },
  created() {
    this.getRadiosData();
    this.getSchedule(
      {
        collection: this.$route.params.collection
          ? this.$route.params.collection : this.currentCollection
      }
    );
    if (this.$route.params.collection) {
      this.switchCollection(this.$route.params.collection);
    }

    setTimeout(
      () => {
        this.getSchedule();
      },
      3500
    );
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
  beforeRouteEnter(_to, _from, next) {
    next(() => {
      const schedule = useScheduleStore();
      schedule.setCalendarToday();
    });
  },
  computed: {
    ...mapState(useScheduleStore,
      [
        'radios',
        'currentCollection',
        'rankedCollections',
        'rankedRadios'
      ]
    ),
    ...mapState(useUserStore, {
      userLogged: 'logged'
    }),
  },
  methods: {
    ...mapActions(useScheduleStore, ['getSchedule', 'switchCollection', 'getRadiosData']),
    setActiveCollection(collectionCodeName) {
      this.switchCollection(collectionCodeName);
    },
  }
});
</script>
