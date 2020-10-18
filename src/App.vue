<template>
  <div>
    <new-message-form @send="addMessage" />
    <message-list :messages="messages" />
    <simple />
    <audio-recorder/>
  </div>
</template>

<script>
import NewMessageForm from './components/NewMessageForm';
import MessageList from './components/MessageList';
import Simple from './components/Simple';
import AudioRecorder from './components/AudioRecorder';

export default {
  name: 'App',
  components: {
    NewMessageForm,
    MessageList,
    Simple,
    AudioRecorder,
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