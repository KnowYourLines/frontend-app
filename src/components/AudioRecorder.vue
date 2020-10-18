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
      let audioSrc = window.URL.createObjectURL(this.audioData);
      let clip = new Audio(audioSrc);
      clip.play();
    },
  },
};
</script>
<style scoped>
* {
  box-sizing: border-box;
}
html,
body {
  min-height: 100vh;
  margin: 0;
  padding: 0;
}
body {
  font-family: Helvetica, Arial, sans-serif;
  color: #0d122b;
  display: flex;
  flex-direction: column;
  padding-left: 1em;
  padding-right: 1em;
}
h1 {
  text-align: center;
  font-weight: 100;
}
header {
  border-bottom: 1px solid #0d122b;
  margin-bottom: 2em;
}
main {
  flex-grow: 2;
  justify-content: space-around;
  align-items: center;
  background-color: #fff;
  border-radius: 12px;
  margin-bottom: 2em;
  padding-top: 4em;
  text-align: center;
}
@keyframes bg-pulse {
  0% {
    background-color: #fff;
  }

  50% {
    background-color: #c7ecee;
  }

  100% {
    backgrouond-color: #fff;
  }
}
main.speaking {
  animation: bg-pulse 1.5s alternate ease-in-out infinite;
}
#result {
  color: #666;
  font-style: italic;
  text-align: center;
}
#result .final {
  color: #0d122b;
  font-style: normal;
}
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

a {
  color: #0d122b;
}
.error {
  color: #f22f46;
  text-align: center;
}
footer {
  border-top: 1px solid #0d122b;
  text-align: center;
}
</style>