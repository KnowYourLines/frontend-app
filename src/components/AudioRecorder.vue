<template>
  <div>
    <input type="text" autocomplete="on" v-model.lazy.trim="character" />
    <button v-if="!isRecording" @click="recordAudio" type="button">
      Record
    </button>
    <button v-else @click="stop" type="button">Stop</button>
  </div>
</template>

<script>
export default {
  name: "AudioRecorder",
  data() {
    return { isRecording: false, character: "Harry Potter" };
  },
  methods: {
    recordAudio() {
      this.isRecording = true;
      this.dataArray = [];
      let device = navigator.mediaDevices.getUserMedia({ audio: true });
      device.then((stream) => {
        this.recorder = new MediaRecorder(stream);
        //0 for as little audio buffering as possible
        this.recorder.start(0);
        this.recorder.ondataavailable = (ev) => {
          this.dataArray.push(ev.data);
        };
      });
    },
    stop() {
      this.isRecording = false;
      this.recorder.stop();
      this.audioData = new Blob(this.dataArray, { type: "audio/wav" });
      this.audioSrc = window.URL.createObjectURL(this.audioData);
      this.$emit("recording-done", {
        character: this.character,
        recording: this.audioData,
      });
      let clip = new Audio(this.audioSrc);
      clip.play();
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
  border: 4px solid #f22f46;
  border-radius: 4px;
  transition: all 0.4s ease 0s;
  cursor: pointer;
  color: #f22f46;
  margin-bottom: 4em;
  display: grid;
}
button:hover,
button:focus {
  background: #f22f46;
  color: #fff;
}
input[type="text"] {
  font-size: 18px;
  padding: 5px;
  border: 2px solid #ccc;
  -webkit-border-radius: 5px;
  border-radius: 5px;
  border-color: #ccc;
  grid-column: 1;
  grid-row: 1;
  background-color: #f22f46;
  color: white;
}
</style>