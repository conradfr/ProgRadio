<template>
  <div class="container mb-3">
    <div v-if="radio" class="row">
      <div class="col-sm-2 col-12">
        <div class="radio-page-side">
          <div class="text-center mb-4">
            <img v-once :alt="radio.name" class="radio-page-logo" :src="picture">
          </div>
          <radio-streams v-if="radio.streaming_enabled" :radio="radio"></radio-streams>
        </div>
      </div>
      <div v-if="radio" class="col-sm-7 col-12 mb-3">
        <div class="row">
          <div class="col-md-6 col-12 text-center text-sm-start">
            <h4>{{ capitalizedDate }}</h4>
          </div>
        </div>

        <div class="row">
          <div class="col-md-12 mb-2 mt-2 mt-sm-0 text-center text-sm-start">
            <router-link v-if="collection"
                         :to="'/' + locale + '/schedule/' + collection.code_name">
              {{ $t('message.radio_page.back') }}
            </router-link>
          </div>
        </div>

        <div v-if="subRadios.length > 1" class="row">
          <div class="col-md-12 mt-sm-0 text-center text-sm-start">
               <ul class="nav nav-tabs">
              <li v-for="subRadio in subRadios" :key="subRadio.code_name"
                class="nav-item">
                <a class="nav-link" href="#"
                  :class="{ 'active': currentSubRadioCodeName === subRadio.radio_stream_code_name }"
                  :ariaSelected="currentSubRadioCodeName === subRadio.radio_stream_code_name ? 'true' : 'false'"
                   @click="regionClick(subRadio.radio_stream_code_name)">
                  {{ subRadio.name }}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div class="row">
          <div class="col-md-12 mt-3 text-center text-sm-start">
            <a href="#media-current">{{ $t('message.radio_page.current') }}</a>
          </div>
        </div>

        <live-song v-if="radio && subRadio" :key="subRadio.radio_stream_code_name" :stream="subRadio" />
        <live-song-history v-if="radio" :key="subRadio.radio_stream_code_name" :stream="subRadio" />
        <live-listeners v-if="radio" :stream="radio" />

        <div class="radio-page-shows mt-2">
          <radio-show v-for="entry in schedule" :key="entry.hash" :show="entry"></radio-show>
          <div v-if="schedule.length === 0" class="alert alert-warning" role="alert">
            {{ $t('message.radio_page.no_schedule') }}
          </div>
        </div>
      </div>
      <div v-if="!userLogged" class="col-sm-3 col-12 text-center">
        <adsense></adsense>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions, mapState, mapStores } from 'pinia';
import find from 'lodash/find';
import orderBy from 'lodash/orderBy';
import { DateTime } from 'luxon';

import type { Stream } from '@/types/stream';

import { useGlobalStore } from '@/stores/globalStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useUserStore } from '@/stores/userStore';

import {
  TIMEZONE,
  COLLECTION_ALL,
  THUMBNAIL_PAGE_PATH,
  GTAG_ACTION_REGION_SELECT,
  GTAG_ACTION_REGION_VALUE,
  GTAG_CATEGORY_SCHEDULE
} from '@/config/config';

import type { Radio } from '@/types/radio';
import type { Schedule } from '@/types/schedule';
import type { Collection } from '@/types/collection';

import RadioShow from './Radio/RadioShow.vue';
import RadioStreams from './Radio/RadioStreams.vue';
import Adsense from './Utils/Adsense.vue';
import LiveSong from './Live/LiveSong.vue';
import LiveSongHistory from "./Live/LiveSongHistory.vue";
import LiveListeners from './Live/LiveListeners.vue';
import filter from "lodash/filter";

export default defineComponent({
  components: {
    RadioShow,
    RadioStreams,
    LiveSong,
    LiveSongHistory,
    LiveListeners,
    Adsense
  },
  data() {
    return {
      locale: this.$i18n.locale,
      // @ts-expect-error locale is defined on global scope
      // eslint-disable-next-line no-undef
      date: DateTime.local().setZone(TIMEZONE).setLocale(locale)
        .toLocaleString(
          {
            year: 'numeric', weekday: 'long', month: 'long', day: '2-digit'
          }
        )
    };
  },
  created() {
    this.scheduleStore.getRadiosData();
    this.scheduleStore.getSchedule({ radio: this.$route.params.radio });
  },
  // TODO fix this hack
  mounted() {
    const body = document?.querySelector('body');
    body?.classList.remove('body-app');

    const app = document.getElementById('app');
    app?.classList.add('no-background');

    if (this.radio !== null) {
      document.title = this.$t(
        'message.radio_page.title',
        { radio: this.radio.name }
      );
    }
  },
  beforeUnmount() {
    const body = document.querySelector('body')!;
    body.classList.add('body-app');

    const app = document.getElementById('app')!;
    app.classList.remove('no-background');
  },
  computed: {
    ...mapStores(useGlobalStore, useScheduleStore),
    ...mapState(useGlobalStore, ['isLoading']),
    ...mapState(useUserStore, { userLogged: 'logged' }),
    ...mapState(useScheduleStore, { storeSchedule: 'schedule' }),
    ...mapState(
      useScheduleStore,
      ['radios', 'collections', 'currentCollection', 'hasSchedule', 'getSubRadio']
    ),
    subRadios() {
      if (!this.radio) {
        return [];
      }

      return filter(this.radio.streams, s => s.is_sub_radio);
    },
    subRadio(): Stream|null {
      if (!this.radio) {
        return null;
      }

      return this.getSubRadio(this.radio.code_name);
    },
    currentSubRadioCodeName(): string|null {
      return this.subRadio ? this.subRadio.radio_stream_code_name : null
    },
    radio(): Radio|null {
      if (this.$route.params.radio === undefined || this.$route.params.radio === null) {
        return null;
      }

      // @ts-ignore
      return this.radios[this.$route.params.radio] === undefined ? null
        // @ts-ignore
        : this.radios[this.$route.params.radio];
    },
    schedule(): Schedule|[] {
      if (this.hasSchedule === true
          && this.$route.params.radio
          && this.currentSubRadioCodeName
          && this.storeSchedule[this.$route.params.radio as string]
          && this.storeSchedule[this.$route.params.radio as string][this.currentSubRadioCodeName]) {
        // @ts-ignore
        return orderBy(this.storeSchedule[this.$route.params.radio][this.currentSubRadioCodeName],
          ['start_at'],
          ['asc']
        );
      }

      return [];
    },
    collection(): Collection|null {
      if (this.radio === null || this.currentCollection === null
        || this.currentCollection === COLLECTION_ALL) {
        return null;
      }

      // find if part of current collection to go back
      if (this.collections[this.currentCollection].radios.indexOf(this.radio.code_name) !== -1) {
        return this.collections[this.currentCollection];
      }

      // find first collection to have this radio
      const collection = find(
        this.collections,
        (c: Collection) => c.radios.indexOf(this.radio!.code_name) !== -1
      );

      return collection === undefined ? null : collection;
    },
    picture(): string {
      if (this.radio === null) {
        return '';
      }

      return `${this.$CDN_BASE_URL}${THUMBNAIL_PAGE_PATH}${this.radio.code_name}.png`;
    },
    capitalizedDate(): string {
      if (!this.date) return '';
      const valueString = this.date.toString();

      return valueString.charAt(0).toUpperCase() + valueString.slice(1);
    }
  },
  methods: {
    ...mapActions(useUserStore, ['setSubRadio']),
    click() {
      this.globalStore.setLoading(true);
    },
    regionClick(subRadioCodeName: string) {
      if (this.radio === null) {
        return;
      }

      this.$gtag.event(GTAG_ACTION_REGION_SELECT, {
        event_category: GTAG_CATEGORY_SCHEDULE,
        event_label: this.radio?.code_name,
        value: GTAG_ACTION_REGION_VALUE
      });

      this.setSubRadio(this.radio.code_name, subRadioCodeName);
    }
  }
});
</script>
