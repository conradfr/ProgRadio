import { defineStore } from 'pinia';

import {
  COOKIE_SUBRADIOS,
  COOKIE_RADIO_FAVORITES,
  COOKIE_STREAM_FAVORITES,
  CACHE_KEY_RADIO_FAVORITES,
  CACHE_KEY_STREAM_FAVORITES
} from '@/config/config';

/* eslint-disable import/no-cycle */
import { useGlobalStore } from '@/stores/globalStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useStreamsStore } from '@/stores/streamsStore';

import type { Radio } from '@/types/radio';
import type { Stream } from '@/types/stream';

import typeUtils from '@/utils/typeUtils';
import cache from '@/utils/cache';
import cookies from '@/utils/cookies';
import i18n from '@/lang/i18n';

import UserApi from '@/api/UserApi';
import ScheduleApi from '@/api/ScheduleApi';
import StreamsApi from '@/api/StreamsApi';

interface State {
  logged: boolean
  isAdmin: boolean,
  storeHistory: boolean,
  subRadios: Record<string, string>
  songs: Record<string, string>
  favoritesRadio: Array<string>
  favoritesStream: Array<string>
}

/* eslint-disable import/prefer-default-export */
export const useUserStore = defineStore('user', {
  state: (): State => (
    {
      logged: false,
      isAdmin: false,
      storeHistory: false,
      subRadios: cookies.getJson(COOKIE_SUBRADIOS, {}),
      songs: {},
      favoritesRadio: cache.hasCache(CACHE_KEY_RADIO_FAVORITES)
        ? cache.getCache(CACHE_KEY_RADIO_FAVORITES) : [],
      favoritesStream: cache.hasCache(CACHE_KEY_STREAM_FAVORITES)
        ? cache.getCache(CACHE_KEY_STREAM_FAVORITES) : [],
    }
  ),
  /* eslint-disable max-len */
  getters: {
    getSubRadioCodeName: state => (radioCodeName: string): string | null => state.subRadios[radioCodeName] || null,
  },
  actions: {
    getUserData() {
      const scheduleStore = useScheduleStore();
      const streamsStore = useStreamsStore();

      setTimeout(
        async () => {
          const response = await UserApi.getUserData();
          if (response === null || !response.user) {
            return;
          }

          this.logged = response.user?.logged || false;
          this.isAdmin = response.user?.isAdmin || false;
          this.storeHistory = response.user?.storeHistory || false;
          this.songs = response.user?.songs || {};
          this.favoritesRadio = response.user?.favoritesRadio || [];
          this.favoritesStream = response.user?.favoritesStream || [];

          scheduleStore.setFavoritesCollection(this.favoritesRadio);
          streamsStore.setStreamFavorites(this.favoritesStream);

          cache.setCache(CACHE_KEY_RADIO_FAVORITES, response.user?.favoritesRadio);
          cache.setCache(CACHE_KEY_STREAM_FAVORITES, response.user?.favoritesStream);
        },
        15
      );
    },
    syncRadioFavorites() {
      const scheduleStore = useScheduleStore();
      scheduleStore.setFavoritesCollection(this.favoritesRadio);
    },
    toggleFavorite(radio: Radio|Stream) {
      if (typeUtils.isRadio(radio)) {
        this.toggleRadioFavorite(radio);
      } else if (typeUtils.isStream(radio)) {
        this.toggleStreamFavorite(radio);
      }
    },
    toggleRadioFavorite(radio: Radio|string, cascade = true) {
      const scheduleStore = useScheduleStore();

      const radioCodeName: string = typeof radio !== 'string' ? radio.code_name : radio;

      const radioIndex = this.favoritesRadio.indexOf(radioCodeName);
      let add = false;

      // is favorite
      if (radioIndex !== -1) {
        this.favoritesRadio.splice(radioIndex, 1);
      } else {
        this.favoritesRadio.push(radioCodeName);
        add = true;
      }

      setTimeout(
        async () => {
          if (this.logged === true) {
            await ScheduleApi.toggleFavoriteRadio(radioCodeName);
            this.getUserData();
            return;
          }

          const favoritesAsString = this.favoritesRadio.join('|');
          cookies.set(COOKIE_RADIO_FAVORITES, favoritesAsString);

          // check if radio has a corresponding stream and add it to favorites (only non-logged)
          if (cascade) {
            const stream = await StreamsApi.getBestFromRadio(radioCodeName);
            if (stream === null
              /* already in favorites */
              || (add && this.favoritesStream.indexOf(stream.code_name) !== -1)) {
              return;
            }

            this.toggleStreamFavorite(stream, false);
          }
        }, 500);

      scheduleStore.setFavoritesCollection(this.favoritesRadio);
      cache.setCache(CACHE_KEY_RADIO_FAVORITES, this.favoritesRadio);
    },
    toggleStreamFavorite(stream: Stream, cascade = true) {
      const streamsStore = useStreamsStore();

      const streamId = stream.code_name;

      const favoriteIndex = this.favoritesStream.indexOf(streamId);
      let add = false;

      if (favoriteIndex !== -1) {
        this.favoritesStream.splice(favoriteIndex, 1);
      } else {
        add = true;
        this.favoritesStream.push(streamId);
      }

      setTimeout(
        async () => {
          if (this.logged === true) {
            await StreamsApi.toggleFavoriteStream(streamId);
            this.getUserData();
            return;
          }

          cookies.set(COOKIE_STREAM_FAVORITES, this.favoritesStream.join('|'));

          // check if stream has a radio attached and add it to favorites (only non-logged)
          if (cascade) {
            const data = await StreamsApi.getStreams(streamId);
            if (data === null) {
              return;
            }

            if (data.streams.length === 0 || data.streams[0].radio_code_name === null
              /* already in favorites */
              || (add && this.favoritesRadio.indexOf(data?.streams[0]?.radio_code_name) !== -1)) {
              return;
            }

            this.toggleRadioFavorite(data.streams[0].radio_code_name, false);
          }
        }, 500);

      streamsStore.setStreamFavorites(this.favoritesStream);
      cache.setCache(CACHE_KEY_STREAM_FAVORITES, this.favoritesStream);
    },
    setSubRadio(radioCodeName: string, subRadioCodeName: string) {
      this.subRadios[radioCodeName] = subRadioCodeName;
      cookies.set(COOKIE_SUBRADIOS, this.subRadios);
    },
    async addSong(song: string) {
      const globalStore = useGlobalStore();

      const savedSong = await UserApi.saveSong(song);

      if (savedSong !== null && savedSong.status === 'OK') {
        globalStore.displayToast({
          message: i18n.global.tc('message.player.song_saved'),
          type: 'success'
        });

        this.songs[savedSong.id] = song;
      } else {
        globalStore.displayToast({
          message: i18n.global.tc('message.generic.error'),
          type: 'error'
        });
      }
    },
    async deleteSong(songId: number) {
      const deletedSong = await UserApi.removeSong(songId);

      if (deletedSong !== null && deletedSong.status === 'OK') {
        delete this.songs[songId];
      }
    }
  }
});
