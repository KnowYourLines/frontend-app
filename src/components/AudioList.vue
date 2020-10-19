<template>
  <div>
    <audio-recorder @recording-done="recordingDone" />
    <draggable
      :list="list"
      :move="checkMove"
      class="list-group"
    >
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
      let character = window.prompt('Enter character name', 'Harry Potter')
      this.list.push({ name: character, id: recording });
    },
  },
};
</script>
<style scoped>
.buttons {
  margin-top: 35px;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
