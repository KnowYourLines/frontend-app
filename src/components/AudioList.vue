<template>
  <div>
    <audio-recorder @recording-done="recordingDone" />
    <button @click="playNonstop" type="button">Play Nonstop</button>
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
    playNonstop: function (){
        this.$emit('play-nonstop', this.list);
    },
  },
};
</script>
<style scoped>
</style>
