<template>
  <div>
    <audio-recorder @recording-done="recordingDone" />
    <button @click="playAll" type="button">Play All</button>
    <draggable :list="list" :move="checkMove" class="list-group">
      <div
        class="list-group-item"
        v-for="element in list"
        :key="element.recording"
      >
        {{ element.name }}
      </div>
    </draggable>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import AudioRecorder from "./AudioRecorder";
export default {
  name: "AudioList",
  components: {
    draggable,
    AudioRecorder,
  },
  data() {
    return {
      list: [],
    };
  },
  methods: {
    checkMove: function (e) {
      window.console.log("Future index: " + e.draggedContext.futureIndex);
    },
    recordingDone: function (recording) {
      let character = window.prompt("Enter character name", "Harry Potter");
      this.list.push({ name: character, recording: recording });
    },
    playAll: function () {
      var current = {}
      var index = 0
      var first_line = this.list[index];
      var player = new Audio()
      player.src = first_line["recording"];
      player.play();
      player.addEventListener(
        "ended",
        function () {
          index++;
          if (index > this.list.length - 1) {
            return
          }
          current = this.list[index];
          player.src = current['recording']
          player.play();
        }.bind(this)
      );
    },
  },
};
</script>
<style scoped>
</style>
