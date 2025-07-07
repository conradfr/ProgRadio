<template>
  <div id="playerVideoModal" style="z-index:1300" class="modal fade"
       tabindex="-1" aria-labelledby="playerVideoModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
      <div class="modal-content">
        <div class="modal-body pb-0">
          <div class="modal-header p-0 pb-2">
            <h5 id="timerModalLabel" class="modal-title">
              {{ $t('message.player.video.title') }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"
              :aria-label="$t('message.player.timer.modal.close')"></button>
          </div>
          <div class="modal-body-row mt-3 mb-2">
            <iframe v-if="videoId && videoId[0] === VideoProvider.Youtube" width="469" height="264"
              :src="`https://www.youtube.com/embed/${videoId[1]}?enablejsapi=1`"
              title="YouTube video player" frameborder="0"
        sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation allow-presentation"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            <iframe v-if="videoId && videoId[0] === VideoProvider.Dailymotion" frameborder="0" width="325" height="183"
              :src="`https://geo.dailymotion.com/player/x3d09.html?video=${videoId[1]}`"
              allowfullscreen
              allow="autoplay; fullscreen; picture-in-picture; web-share">
            </iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {mapState} from 'pinia';

import VideoProvider from '@/types/video.ts';
import PlayerUtils from '@/utils/PlayerUtils';

import {usePlayerStore} from '@/stores/playerStore';


export default defineComponent({
  data(): {
    VideoProvider: any
  } {
    return {
      VideoProvider
    }
  },
  computed: {
    ...mapState(usePlayerStore, ['videoModalUrl']),
    videoId(): [VideoProvider, string]|null {
      if (!this.videoModalUrl) {
        return null;
      }

      return PlayerUtils.getVideoId(this.videoModalUrl);
    }
  },
});
</script>
