import { defineStore } from 'pinia';
import { toRaw } from 'vue';

import type { ChatMessage } from '@/types/chat_message';
import type { ChatParticipant, ParticipantMeta } from '@/types/chat_participant';

import { usePlayerStore } from '@/stores/playerStore';
import AndroidApi from '@/api/AndroidApi';

import {
  CHAT_NAME_MAX_LENGTH,
  CHAT_MAX_MESSAGES
} from '@/config/config';
import ChatUtils from '@/utils/chatUtils';

import { Presence } from '../../js/phoenix/index';

interface State {
  // topic of the joined channel ("chat:<stream id>"), one at a time: the stream of the player
  topic: string | null
  name: string
  // presence key of the current user, sent by the server on join
  presenceKey: string | null
  participants: ChatParticipant[]
  messages: ChatMessage[]
  // ctrls of the messages sent by this user (also used to know its own messages)
  msgCtrls: number[]
  modalShown: boolean
  // red dot on the chat icon: message received while the modal is closed
  hasNewMessages: boolean
}

// phoenix objects kept out of the state, they don't need (and don't like) to be reactive proxies
let channel: any = null;

const topicNameFor = (streamId: string) => `chat:${streamId}`;

export const useChatStore = defineStore('chat', {
  state: (): State => ({
    topic: null,
    name: ChatUtils.getSavedName() ?? ChatUtils.defaultName(),
    presenceKey: null,
    participants: [],
    messages: [],
    msgCtrls: [],
    modalShown: false,
    hasNewMessages: false,
  }),
  getters: {
    // chat only for the streams (uuid), not for the radios / sub radios, and not in the android app
    available(): boolean {
      const playerStore = usePlayerStore();
      return !AndroidApi.hasAndroid && ChatUtils.isChatStreamId(playerStore.stream?.id);
    },
    isOwnMessage: state => (message: ChatMessage) => state.msgCtrls.includes(message.ctrl),
  },
  actions: {
    // joins the chat of the stream (leaving the previous one), or only leaves for a radio / no stream
    joinStreamChat(streamId: string | null | undefined) {
      // no chat button in the android app: no need to join in the background
      if (AndroidApi.hasAndroid || !ChatUtils.isChatStreamId(streamId)) {
        this.leaveChat();
        return;
      }

      const topic = topicNameFor(streamId);

      if (this.topic === topic && channel !== null) {
        return;
      }

      this.leaveChat();

      // the socket is shared with the player store
      const playerStore = usePlayerStore();
      playerStore.connectSocket();

      if (!playerStore.socket) {
        return;
      }

      // params as a function so a rejoin (after a reconnection) sends the current name
      channel = toRaw(playerStore.socket).channel(topic, () => ({ name: this.name }));
      this.topic = topic;

      // listens to "presence_state" & "presence_diff" sent by the server
      const presence = new Presence(channel);
      presence.onSync(() => {
        // presence.js is untyped, list() returns the mapped array
        const participants = presence.list(
          (key: string, { metas }: { metas: ParticipantMeta[] }) => ({ key, name: metas[0].name })
        ) as unknown as ChatParticipant[];

        this.participants = participants.sort((a, b) => a.name.localeCompare(b.name));
      });

      channel.on('new:msg', (message: ChatMessage) => {
        this.receiveMessage(message);
      });

      channel.on('quit', () => {
        this.leaveChat();
      });

      channel.join()
        .receive('ok', (resp: { key: string, messages?: ChatMessage[] }) => {
          this.presenceKey = resp.key;
          this.receiveHistory(resp.messages ?? []);
        });
    },
    leaveChat() {
      if (channel !== null) {
        channel.leave();
        channel = null;
      }

      // another stream, another chat
      this.topic = null;
      this.presenceKey = null;
      this.participants = [];
      this.messages = [];
      this.msgCtrls = [];
      this.hasNewMessages = false;
    },
    // returns false when not sent (nothing to send, not joined)
    sendMessage(text: string): boolean {
      const msg = text.trim();

      if (msg === '' || !this.name || this.name === '' || channel === null) {
        return false;
      }

      // broadcast to everyone with the message, large range to avoid collisions between users
      const ctrl = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
      this.msgCtrls.push(ctrl);
      // same limit as the messages: the own messages still displayed always have their ctrl kept
      ChatUtils.keepLast(this.msgCtrls, CHAT_MAX_MESSAGES);

      // displayed immediately, replaced by the channel one when (and if) it arrives:
      // a message filtered by the server never arrives, the sender doesn't know it
      this.messages.push({
        id: `${ctrl}`,
        user: this.name,
        msg,
        datetime: new Date().toISOString(),
        ctrl,
      });
      ChatUtils.keepLast(this.messages, CHAT_MAX_MESSAGES);

      // the name is set by the server from the presence
      channel.push('new:msg', { msg, ctrl });

      return true;
    },
    // last messages of the chat, sent on join. Also on a rejoin after a reconnection:
    // merged with the displayed ones, to keep them and get the ones missed meanwhile
    receiveHistory(history: ChatMessage[]) {
      const ids = new Set(this.messages.map((message: ChatMessage) => message.id));
      const missing = history.filter((message: ChatMessage) => !ids.has(message.id));

      if (missing.length === 0) {
        return;
      }

      // sort is stable: the same datetime (server ones are truncated to the second) keeps the order
      this.messages = [...missing, ...this.messages]
        .sort((a, b) => Date.parse(a.datetime) - Date.parse(b.datetime));
      ChatUtils.keepLast(this.messages, CHAT_MAX_MESSAGES);
    },
    receiveMessage(message: ChatMessage) {
      // already received with the history of the join
      if (this.messages.some((localMessage: ChatMessage) => localMessage.id === message.id)) {
        return;
      }

      // own message already displayed locally: replaced in place
      if (this.isOwnMessage(message)) {
        const localIndex = this.messages.findIndex(
          (localMessage: ChatMessage) => localMessage.id === `${message.ctrl}`
        );

        if (localIndex !== -1) {
          this.messages[localIndex] = message;
          return;
        }
      }

      this.messages.push(message);
      ChatUtils.keepLast(this.messages, CHAT_MAX_MESSAGES);

      if (!this.modalShown) {
        this.hasNewMessages = true;
      }
    },
    updateName(newName: string) {
      const name = newName.trim().slice(0, CHAT_NAME_MAX_LENGTH);

      if (name === '') {
        return;
      }

      this.name = name;
      ChatUtils.saveName(name);

      if (channel === null) {
        return;
      }

      channel.push('update:name', { name })
        .receive('ok', (resp: { name: string }) => {
          // the server may have altered it
          this.name = resp.name;
          ChatUtils.saveName(resp.name);
        });
    },
    setModalShown(shown: boolean) {
      this.modalShown = shown;

      if (shown) {
        this.hasNewMessages = false;
      }
    },
  }
});
