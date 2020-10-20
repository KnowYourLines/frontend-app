<template>
  <div>
    <button @click="recordAudio" type="button">Record</button>
    <button type="button" @click="stop">Stop</button>
  </div>
</template>

<script>
export default {
  name: "AudioRecorder",
  methods: {
    recordAudio() {
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
      this.recorder.stop();
      this.audioData = new Blob(this.dataArray, { type: "audio/wav"});
      this.audioSrc = window.URL.createObjectURL(this.audioData);
      this.$emit('recording-done', this.audioData);
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
}
button:hover,
button:focus {
  background: #f22f46;
  color: #fff;
}
</style>