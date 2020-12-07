<template>
  <div>
    <div>
      <p>
        Not working? Try
        <a
          href="https://support.google.com/chrome/answer/95346?co=GENIE.Platform%3DAndroid&hl=en&oco=0"
          >Google Chrome</a
        >
      </p>
    </div>
    <audio-player />
    <div>
    <new-message-form @send="addMessage" />
    <message-list :messages="messages" />
  </div>
  </div>

</template>

<script>
import AudioPlayer from "./components/AudioPlayer";
import NewMessageForm from "./components/NewMessageForm";
import MessageList from './components/MessageList';

export default {
  name: "App",
  components: {
    AudioPlayer,
    NewMessageForm,
    MessageList
  },
  data() {
    return {
      messages: []
    };
  },
  methods: {
    addMessage(text) {
      this.messages.unshift(text);
    }
  }
};
</script>