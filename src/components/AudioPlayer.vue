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
      var first_line = recordings[index];
      var player = new Audio()
      player.src = first_line["recording"];
      player.play();
      player.addEventListener(
        "ended",
        function () {
          index++;
          if (index > recordings.length - 1) {
            return
          }
          let current_line = recordings[index];
          player.src = current_line['recording']
          player.play();
        }.bind(this)
      );
    },
  },
};
</script>