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
    <backend @script-selected="selectScript" :list="list" :isPlaying="isPlaying"/>
    <audio-player
      @stop-playing="stopPlaying"
      ref="player"
      :isPlaying="isPlaying"
    />
    <audio-list
      ref="list"
      @play-nonstop="triggerNonstop"
      @play-on-cue="triggerOnCue"
      @list-update="updateList"
      :isPlaying="isPlaying"
    />
  </div>
</template>

<script>
import AudioPlayer from "./components/AudioPlayer";
import Backend from "./components/Backend.vue";
import AudioList from "./components/AudioList.vue";

export default {
  name: "App",
  components: {
    AudioPlayer,
    Backend,
    AudioList,
  },
  data() {
    return {
      list: [],
      isPlaying: false,
    };
  },
  methods: {
    selectScript: function (script) {
      this.$refs.list.loadScript(script);
    },
    updateList: function (updatedScript) {
      this.list = updatedScript;
    },
    triggerNonstop: function (script) {
      this.isPlaying = true;
      this.$refs.player.playAll(script);
    },
    triggerOnCue: function (script, characters) {
      this.isPlaying = true;
      this.$refs.player.playOnCue(script, characters);
    },
    stopPlaying: function () {
      this.isPlaying = false;
    },
  },
};
</script>