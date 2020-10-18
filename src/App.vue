<template>
  <div>
    <new-message-form @send="addMessage" />
    <message-list :messages="messages" />
    <audio-list />
  </div>
</template>

<script>
import NewMessageForm from './components/NewMessageForm';
import MessageList from './components/MessageList';
import AudioList from './components/AudioList'

export default {
  name: 'App',
  components: {
    NewMessageForm,
    MessageList,
    AudioList
  },
  data() {
    return {
      messages: [],
    };
  },
  methods: {
    addMessage(text) {
      this.messages.unshift(text);
    },
  },
};
</script>