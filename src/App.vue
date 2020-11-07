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
  </div>
</template>

<script>
import AudioPlayer from "./components/AudioPlayer";

export default {
  name: "App",
  components: {
    AudioPlayer,
  },
};
</script>