<template>
  <div>
    <div class="btn-group" v-if="!isEditing && !isPlaying">
        <input type="checkbox" v-model="element.shouldPlay" />
        <label class="edit-label">Play</label>
        <button type="button" class="btn" @click="deleteLine(element.id)">
        Delete
      </button>
    </div>
    <div v-else-if="isEditing">
      <label class="edit-label">Edit name: </label>
      <input type="text" autocomplete="on" v-model.lazy.trim="element.name" />
      <label class="edit-label">Edit cue: </label>
      <input type="text" autocomplete="on" v-model.lazy.trim="element.cue" />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    isEditing: {
      type: Boolean,
      required: true,
    },
    isPlaying: {
      type: Boolean,
      required: true,
    },
    element: {
      type: Object,
      required: true,
    },
  },
  methods: {
    deleteLine(lineId) {
      this.$emit("delete-line", lineId);
    },
  },
};
</script>
<style scoped>
button {
  font-size: 18px;
  font-weight: 200;
  background: transparent;
  border: 4px solid #87169e;
  border-radius: 4px;
  transition: all 0.4s ease 0s;
  cursor: pointer;
  color: #87169e;
  display: inline-block;
  margin-left: 2em
}
button:hover,
button:focus {
  background: #87169e;
  color: #fff;
}
input[type="text"] {
  font-size: 18px;
  padding: 5px;
  border: 2px solid #87169e;
  -webkit-border-radius: 5px;
  border-radius: 5px;
  border-color: #ccc;
  grid-column: 1;
  grid-row: 1;
  background-color: #87169e;
  color: white;
}
div {
  display: inline;
  margin-left: 5em;
}
</style>