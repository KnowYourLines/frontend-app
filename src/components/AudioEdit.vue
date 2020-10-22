<template>
  <form class="stack-small" @submit.prevent="onSubmit">
    <div>
      <label class="edit-label">Editting Name for &quot;{{ name }}&quot;</label>
      <input
        :id="id"
        type="text"
        autocomplete="on"
        v-model.lazy.trim="newName"
      />
    </div>
    <div class="btn-group">
      <button type="button" class="btn" @click="onCancel">Cancel</button>
      <button type="submit" class="btn btn__primary">Save</button>
    </div>
  </form>
</template>
<script>
export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      newName: this.name,
    };
  },
  methods: {
    onCancel() {
      this.$emit("edit-cancelled");
    },
    onSubmit() {
      this.$emit("item-edited", this.newName, this.id);
    },
  },
};
</script>