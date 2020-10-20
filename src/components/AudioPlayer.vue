<template>
  <div>
      <audio-list @play-nonstop="playAll"/>
  </div>
</template>

<script>
import AudioList from "./AudioList";
export default {
    name: "AudioPlayer",
    components: {
    AudioList
  },
    methods: {
    playAll: function (recordings) {
      var index = 0
      var player = new Audio()
      var line = recordings[index]["recording"]
      player.src = window.URL.createObjectURL(line);
      player.play();
      player.addEventListener(
        "ended",
        function () {
          index++;
          if (index > recordings.length - 1) {
            return
          }
          line = (recordings[index]["recording"])
          player.src = window.URL.createObjectURL(line);
          player.play();
        }.bind(this)
      );
    },
  },
};
</script>