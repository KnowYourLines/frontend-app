<template>
  <div>
    <new-message-form @send="addMessage" />
    <message-list :messages="messages" />
    <audio-player/>
  </div>
</template>

<script>
import NewMessageForm from './components/NewMessageForm';
import MessageList from './components/MessageList';
import AudioPlayer from './components/AudioPlayer';

export default {
  name: 'App',
  components: {
    NewMessageForm,
    MessageList,
    AudioPlayer,
  },
  data() {
    return {
      messages: [],
    };
  },
  methods: {
    addMessage(text) {
      this.messages.unshift(text);
    }
  },
};
</script>