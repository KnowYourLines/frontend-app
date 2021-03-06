<template>
  <div v-if="!isPlaying">
    <meta name="viewport" content="width=1350" />
    <div class="container">
      <audio-recorder @recording-done="recordingDone" />
      <div class="selection" ref="selection">
        <div v-for="name in uniqCharacters" :key="name">
          <input type="checkbox" v-model="selectedCharacters" :value="name" />
          <label>{{ name }}</label>
        </div>
      </div>
    </div>
    <div class="selected-btn-group">
      <button type="button" class="btn" @click="playCharacters">
        Play and listen for character(s)
      </button>
      <button type="button" class="btn" @click="muteSelected">
        Skip lines for character(s)
      </button>
      <button type="button" class="btn" @click="unmuteSelected">
        Unskip lines for character(s)
      </button>
    </div>
    <div class="btn-group">
      <button class="play" @click="playNonstop" type="button">
        Play all nonstop
      </button>
      <button
        class="edit"
        @click="toggleToItemEditForm"
        v-if="!isEditing"
        type="button"
      >
        Edit
      </button>
      <button
        type="button"
        v-else-if="isEditing"
        class="edit"
        @click="editDone"
      >
        Done
      </button>
    </div>
    <draggable
      handle=".my-handle"
      ghost-class="ghost"
      :list="list"
      :move="checkMove"
      class="list-group"
    >
      <div class="list-group-item" v-for="element in list" :key="element.id">
        <div class="item-container">
          <div class="container">
            <div>
              <span class="my-handle">
                <img src="@/assets/reorder.png" />
              </span>
            </div>
            <div>
              <span class="my-handle">{{ element.name }}</span
              ><br /><span class="my-handle">Cue: {{ element.cue }}</span>
            </div>
          </div>
          <audio-edit
            :isEditing="isEditing"
            :element="element"
            @delete-line="deletion"
          />
        </div>
      </div>
    </draggable>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import AudioRecorder from "./AudioRecorder";
import AudioEdit from "./AudioEdit";
import { v4 as uuidv4 } from "uuid";
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
    loadScript: function (script) {
      this.list = script["lines"];
      this.list.forEach(function (item) {
        item["listItemId"] = uuidv4();
      });
      this.$emit("list-update", this.list);
    },
    checkMove: function (e) {
      window.console.log("Future index: " + e.draggedContext.futureIndex);
      this.$emit("list-update", this.list);
    },
    recordingDone: function (line) {
      var newLine = {
        name: line["character"],
        recording: line["recording"],
        cue: line["cue"],
        listItemId: uuidv4(),
        shouldPlay: true,
        uploaded: false,
      };
      this.list.push(newLine);
      this.$emit("list-update", this.list);
    },
    playNonstop: function () {
      if (this.list.length !== 0) {
        this.$emit("play-nonstop", this.list);
      }
    },
    blinkCharacterSelect: function () {
      let normal = this.$refs.selection.style.backgroundColor;
      this.$refs.selection.style.backgroundColor = "red";
      setTimeout(() => {
        this.$refs.selection.style.backgroundColor = normal;
      }, 500);
    },
    playCharacters: function () {
      if (this.selectedCharacters.length == 0) {
        this.blinkCharacterSelect();
      } else {
        this.$emit("play-on-cue", this.list, this.selectedCharacters);
      }
    },
    deletion(id) {
      const lineIndex = this.list.findIndex((line) => line.listItemId === id);
      this.list.splice(lineIndex, 1);
      this.$emit("list-update", this.list);
    },
    toggleToItemEditForm() {
      if (this.list.length > 0) {
        this.isEditing = true;
      }
    },
    editDone() {
      this.isEditing = false;
      this.$emit("list-update", this.list);
    },
    muteSelected() {
      if (this.selectedCharacters.length == 0) {
        this.blinkCharacterSelect();
      } else {
        this.list.forEach((line) => {
          if (this.selectedCharacters.includes(line.name)) {
            line.shouldPlay = false;
          }
        });
        this.$emit("list-update", this.list);
      }
    },
    unmuteSelected() {
      if (this.selectedCharacters.length == 0) {
        this.blinkCharacterSelect();
      } else {
        this.list.forEach((line) => {
          if (this.selectedCharacters.includes(line.name)) {
            line.shouldPlay = true;
          }
        });
        this.$emit("list-update", this.list);
      }
    },
  },
};
</script>
<style scoped>
label {
  color: #2257ca;
  font-size: 18px;
  font-weight: 200;
  font-family: helvetica;
}
.item-container {
  display: flex;
  justify-content: space-between;
}

.container {
  display: flex;
  width: 50%;
  margin: 0 auto;
}

.selection {
  width: 300px;
  height: 100px;
  overflow-y: scroll;
  background: transparent;
  border: 4px solid #2257ca;
  border-radius: 4px;
}
.btn-group button {
  width: 50%;
  font-size: 18px;
  font-weight: 200;
  padding: 1em;
  background: transparent;
  border: 4px solid #87169e;
  border-radius: 4px;
  transition: all 0.4s ease 0s;
  cursor: pointer;
  color: #87169e;
  margin-bottom: 4em;
  position: relative;
}

.btn-group button:hover,
.btn-group button:focus {
  background: #87169e;
  color: #fff;
}
.selected-btn-group button {
  width: 33.3%;
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

.selected-btn-group button:hover,
.selected-btn-group button:focus {
  background: #2257ca;
  color: #fff;
}

div.list-group-item {
  font-size: 18px;
  font-weight: 200;
  font-family: helvetica;
  padding: 0.7em;
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
  margin: 5px;
}
</style>
