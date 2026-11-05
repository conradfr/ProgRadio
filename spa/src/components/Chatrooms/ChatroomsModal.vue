<template>
  <div id="chatroomsModal" style="z-index:1300" class="modal fade"
    tabindex="-1" aria-labelledby="chatroomsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-header justify-content-between align-items-center py-2">
          <div class="flex-fill">
            <h1 id="chatroomsModalLabel" class="modal-title fs-5">
              {{ stream
                ? $t('message.player.chat.page_title', { radio: stream.name })
                : $t('message.player.chat.title') }}
            </h1>
          </div>
          <div class="d-flex justify-content-end align-items-center">
            <div v-if="song" class="me-4"><span class="note-title">♫</span>&nbsp;{{ song }}</div>
            <PlayerPlayPause v-if="stream" class="me-4" :stream="stream" :playing="playing"
              @togglePlay="() => togglePlay()" />
            <button type="button" class="btn-close" data-bs-theme="dark" data-bs-dismiss="modal"
              :aria-label="$t('message.player.chat.close')">
            </button>
          </div>
        </div>

        <div class="modal-body">
          <div class="container-fluid gx-0 h-100 d-flex flex-column">
            <!-- messages + participants -->
            <div class="row gx-2 flex-grow-1 overflow-hidden mb-3" style="min-height: 0">
              <div class="col-8 col-md-10 h-100">
                <div ref="messagesList" class="chat-messages h-100 overflow-auto border rounded p-2">
                  <div v-for="message in messages" :key="message.id" class="chat-message mb-1">
                    <span class="chat-message-time text-body-secondary small">{{ formatTime(message.datetime) }}</span>
                    {{ ' ' }}
                    <strong class="chat-message-user" :class="{ 'text-primary': isOwnMessage(message) }">
                      {{ message.user }}
                    </strong>
                    {{ ' ' }}
                    <span class="chat-message-body">{{ message.msg }}</span>
                  </div>
                </div>
              </div>

              <div class="col-4 col-md-2 h-100">
                <div class="chat-participants h-100 overflow-auto border rounded p-2">
                  <ul class="list-unstyled mb-0">
                    <li v-for="participant in participants" :key="participant.key"
                      class="chat-participant text-truncate"
                      :class="{ 'fw-bold': participant.key === presenceKey }">
                      {{ participant.name }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- message input + name input -->
            <div class="row gx-2">
              <div class="col-8 col-md-9">
                <form class="chat-form" autocomplete="off" @submit.prevent="send()">
                  <div class="input-group">
                    <input ref="messageInput" v-model="newMessage" type="text" name="message"
                      class="form-control chat-input ps-3" :maxlength="CHAT_MESSAGE_MAX_LENGTH"
                      :placeholder="$t('message.player.chat.message_placeholder')"
                      :aria-label="$t('message.player.chat.send')">
                    <button class="btn btn-primary" type="submit" :title="$t('message.player.chat.send')">
                      <i class="bi bi-send"></i>
                    </button>
                  </div>
                </form>
              </div>

              <div class="col-4 col-md-3">
                <!-- same gutter as the parent rows, label sized to its text -->
                <div class="row gx-2">
                  <label for="chatroomsInputName" class="d-none d-sm-block col-auto col-form-label ps-2">
                    {{ $t('message.player.chat.name') }}
                  </label>
                  <div class="col ps-2">
                    <input id="chatroomsInputName" v-model="nameInput" type="text"
                      class="form-control chat-input ps-3" :maxlength="CHAT_NAME_MAX_LENGTH"
                      @change="updateName(nameInput)">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

import { usePlayerStore } from '@/stores/playerStore';
import { useChatStore } from '@/stores/chatStore';

import { CHAT_NAME_MAX_LENGTH } from '@/config/config';
import ChatUtils from '@/utils/chatUtils';

import PlayerPlayPause from '../Player/Common/PlayerPlayPause.vue';

// same as the api limit (ChatUtils @msg_max_length)
const CHAT_MESSAGE_MAX_LENGTH = 500;

export default defineComponent({
  components: {
    PlayerPlayPause
  },
  data(): {
    newMessage: string,
    nameInput: string,
    CHAT_NAME_MAX_LENGTH: number,
    CHAT_MESSAGE_MAX_LENGTH: number,
  } {
    return {
      newMessage: '',
      nameInput: useChatStore().name,
      CHAT_NAME_MAX_LENGTH,
      CHAT_MESSAGE_MAX_LENGTH,
    };
  },
  mounted() {
    // bootstrap modal events, on the root element (#chatroomsModal)
    this.$el.addEventListener('show.bs.modal', this.onShow);
    this.$el.addEventListener('shown.bs.modal', this.onShown);
    // any dismiss: close button, Escape, backdrop click (fired once the hide transition is over)
    this.$el.addEventListener('hidden.bs.modal', this.onHidden);
  },
  beforeUnmount() {
    this.$el.removeEventListener('show.bs.modal', this.onShow);
    this.$el.removeEventListener('shown.bs.modal', this.onShown);
    this.$el.removeEventListener('hidden.bs.modal', this.onHidden);
  },
  watch: {
    // the chat is the one of the stream in the player, joined as soon as it's loaded
    // (messages received in the background: red dot on the chat icon)
    streamId: {
      handler(newStreamId: string | null) {
        this.joinStreamChat(newStreamId);
      },
      immediate: true
    },
    lastMessageId() {
      this.scrollToBottom();
    },
    // the server may alter the name
    name(newName: string) {
      this.nameInput = newName;
    },
  },
  computed: {
    ...mapState(usePlayerStore, ['stream', 'radio', 'playing', 'liveSong']),
    ...mapState(useChatStore, ['name', 'messages', 'participants', 'presenceKey', 'isOwnMessage']),
    streamId(): string | null {
      return this.stream ? this.stream.id : null;
    },
    song(): string | null {
      if (!this.stream) {
        return null;
      }

      const liveSong = this.liveSong(this.stream, this.radio);
      return liveSong ? liveSong[0] : null;
    },
    // changes on a new message and when an own message is replaced by the channel one
    lastMessageId(): string | null {
      return this.messages.length > 0 ? this.messages[this.messages.length - 1].id : null;
    },
  },
  methods: {
    ...mapActions(usePlayerStore, ['togglePlay']),
    ...mapActions(useChatStore, ['joinStreamChat', 'sendMessage', 'updateName', 'setModalShown']),
    formatTime: ChatUtils.formatTime,
    send() {
      if (this.sendMessage(this.newMessage)) {
        this.newMessage = '';
      }
    },
    // follows the last message, after the list has been rendered
    scrollToBottom() {
      this.$nextTick(() => {
        const list = this.$refs.messagesList as HTMLElement | undefined;

        if (list) {
          list.scrollTop = list.scrollHeight;
        }
      });
    },
    onShow() {
      this.setModalShown(true);
    },
    onShown() {
      // messages received while the modal was hidden: the list can't be scrolled until it is displayed
      this.scrollToBottom();
      // autofocus has no effect in Bootstrap modals (it focuses the modal itself once shown)
      (this.$refs.messageInput as HTMLInputElement | undefined)?.focus();
    },
    onHidden() {
      this.setModalShown(false);
    },
  }
});
</script>
