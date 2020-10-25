<template>
  <div>
    <audio-list
      :isPlaying="isPlaying"
      @play-nonstop="playAll"
      @stop-playing="pause"
    />
  </div>
</template>

<script>
import AudioList from "./AudioList";
export default {
  name: "AudioPlayer",
  components: {
    AudioList,
  },
  data() {
    return {
      player: new Audio(),
      isPlaying: false,
    };
  },
  methods: {
    playAll: function (recordings) {
      var index = 0;
      var line = recordings[index]["recording"];
      this.player.src = window.URL.createObjectURL(line);
      this.player.play();
      this.isPlaying = true;
      this.player.addEventListener(
        "ended",
        function () {
          index++;
          if (index == recordings.length) {
            index = 0;
          }
          if (index < recordings.length) {
            line = recordings[index]["recording"];
            this.player.src = window.URL.createObjectURL(line);
            this.player.play();
          }
        }.bind(this)
      );
    },
    pause: function () {
      this.isPlaying = false;
      this.player.pause();
    },
  },
};
</script>