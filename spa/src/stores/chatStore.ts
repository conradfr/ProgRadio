import { defineStore } from 'pinia';
import { nextTick } from 'vue';

import { usePlayerStore } from '@/stores/playerStore';

interface State {
  channels: any
  messages: any
}

const topicNameFor = (streamId: string) => `chat:${streamId}`;

export const useChatStore = defineStore('chat', {
  state: (): State => ({
    channels: {},
    messages: {},
  }),
  getters: {

  },
  actions: {
    joinChatChannel(streamId: string) {
      // should not happen but...
      if (!streamId) {
        return false;
      }

      const topicName = topicNameFor(streamId);
      const playerStore = usePlayerStore();

      // the socket is shared with the player store
      playerStore.connectSocket();

      // Channel already exists?
      if (Object.prototype.hasOwnProperty.call(this.channels, topicName)) {
        return false;
      }

      return nextTick(() => {
        setTimeout(() => {
          if (playerStore.socket === null
            || Object.prototype.hasOwnProperty.call(this.channels, topicName)) {
            return;
          }

          this.channels[topicName] = playerStore.socket.channel(topicName);

          this.channels[topicName].on('new:msg', (chatData: any) => {
            console.log(chatData);
          });

          this.channels[topicName].on('quit', () => {
            this.leaveChatChannel(streamId);
          });

          this.channels[topicName].join()
            // .receive('ok', ({ messages }) => console.log('catching up', messages))
            .receive('error', () => {
              // this.leaveChatChannel(streamId);
            })
            .receive('timeout', () => {
              // this.leaveChatChannel(streamId);
            });
        }, 50);
      });
    },
    leaveChatChannel(streamId: string) {
      // should not happen but...
      if (!streamId) {
        return false;
      }

      const topicName = topicNameFor(streamId);

      if (!Object.prototype.hasOwnProperty.call(this.channels, topicName)) {
        return;
      }

      this.channels[topicName].leave();
      delete this.channels[topicName];
    },
  }
});
