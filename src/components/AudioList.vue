<template>
  <div>
    <audio-recorder @recording-done="recordingDone" />
    <select v-model="selectedCharacters" multiple>
      <option v-for="name in uniqCharacters" :key="name">
        {{ name }}
      </option>
    </select>
    <span>Selected: {{ selectedCharacters }}</span>
    <button type="button" class="btn" @click="muteSelected">
      Mute Selected
    </button>
    <button type="button" class="btn" @click="unmuteSelected">
      Unmute Selected
    </button>
    <div class="btn-group">
      <button class="play" @click="playNonstop" v-if="!isPlaying" type="button">
        Play Nonstop
      </button>
      <button type="button" class="play" v-else @click="stopPlaying">
        Stop
      </button>
      <button
        class="edit"
        @click="toggleToItemEditForm"
        v-if="!isEditing"
        type="button"
      >
        Edit
      </button>
      <button type="button" v-else class="edit" @click="editDone">Done</button>
    </div>
    <draggable
      handle=".my-handle"
      ghost-class="ghost"
      :list="list"
      :move="checkMove"
      class="list-group"
    >
      <div class="list-group-item" v-for="element in list" :key="element.id">
        <span class="my-handle">{{ element.name }} Cue: {{ element.cue }}</span>
        <audio-edit
          :isEditing="isEditing"
          :element="element"
          @delete-line="deletion"
        />
      </div>
    </draggable>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import AudioRecorder from "./AudioRecorder";
import AudioEdit from "./AudioEdit";
import uniqueId from "lodash.uniqueid";
import uniqBy from "lodash.uniqby";
export default {
  name: "AudioList",
  components: {
    draggable,
    AudioRecorder,
    AudioEdit,
  },
  data() {
    return {
      list: [],
      isEditing: false,
      selectedCharacters: [],
    };
  },
  props: {
    isPlaying: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    uniqCharacters() {
      return uniqBy(this.list, "name").map((line) => line.name);
    },
  },
  methods: {
    checkMove: function (e) {
      window.console.log("Future index: " + e.draggedContext.futureIndex);
    },
    recordingDone: function (line) {
      this.list.push({
        name: line["character"],
        recording: line["recording"],
        cue: line["cue"],
        id: uniqueId("line-"),
        shouldPlay: true,
      });
    },
    playNonstop: function () {
      this.$emit("play-nonstop", this.list);
    },
    stopPlaying: function () {
      this.$emit("stop-playing");
    },
    deletion(lineId) {
      const lineIndex = this.list.findIndex((line) => line.id === lineId);
      this.list.splice(lineIndex, 1);
    },
    toggleToItemEditForm() {
      this.isEditing = true;
    },
    editDone() {
      this.isEditing = false;
    },
    muteSelected() {
      this.list.forEach((line) => {
        if (this.selectedCharacters.includes(line.name)) {
          line.shouldPlay = false;
        }
      });
    },
    unmuteSelected() {
      this.list.forEach((line) => {
        if (this.selectedCharacters.includes(line.name))  {
          line.shouldPlay = true;
        }
      });
    },
  },
};
</script>
<style scoped>
.btn-group button {
  width: 50%;
  font-size: 18px;
  font-weight: 200;
  padding: 1em;
  background: transparent;
  border: 4px solid #2257ca;
  border-radius: 4px;
  transition: all 0.4s ease 0s;
  cursor: pointer;
  color: #2257ca;
  margin-bottom: 4em;
  position: relative;
}

.btn-group button:hover,
.btn-group button:focus {
  background: #2257ca;
  color: #fff;
}
div.list-group-item {
  font-size: 18px;
  font-weight: 200;
  font-family: helvetica;
  padding: 1em;
  width: 50%;
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
  overflow: auto;
}

.ghost {
  opacity: 0.5;
}

.my-handle {
  cursor: move;
  cursor: -webkit-grabbing;
}
</style>
