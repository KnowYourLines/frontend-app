<template>
  <div>
    <div class="btn-group" v-if="!isEditing">
      <button type="button" class="btn" @click="deleteLine(element.id)">
        Delete
      </button>
    </div>
    <div v-else>
      <label class="edit-label">Edit name: </label>
      <input type="text" autocomplete="on" v-model.lazy.trim="element.name" />
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