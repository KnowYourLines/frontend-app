<template>
  <div>
    <audio-recorder @recording-done="recordingDone" />
    <button @click="playNonstop" type="button">Play Nonstop</button>
    <draggable :list="list" :move="checkMove" class="list-group">
      <div class="list-group-item" v-for="element in list" :key="element.id">
        {{ element.name }}
      </div>
    </draggable>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import AudioRecorder from "./AudioRecorder";
import uniqueId from "lodash.uniqueid";
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
    recordingDone: function (line) {
      this.list.push({
        name: line['character'],
        recording: line['recording'],
        id: uniqueId("line-"),
      });
    },
    playNonstop: function () {
      this.$emit("play-nonstop", this.list);
    },
  },
};
</script>
<style scoped>
button {
  font-size: 18px;
  font-weight: 200;
  padding: 1em;
  width: 200px;
  background: transparent;
  border: 4px solid #2257ca;
  border-radius: 4px;
  transition: all 0.4s ease 0s;
  cursor: pointer;
  color: #2257ca;
  margin-bottom: 4em;
  margin: 0;
  position: relative;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
}
button:hover,
button:focus {
  background: #2257ca;
  color: #fff;
}
div.list-group-item {
  font-size: 18px;
  font-weight: 200;
  font-family: helvetica;
  padding: 1em;
  width: 500px;
  background: transparent;
  border: 4px solid #87169e;
  border-radius: 4px;
  transition: all 0.4s ease 0s;
  cursor: pointer;
  color: #87169e;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
