<template>
  <div>
    <input type="text" autocomplete="on" v-if="!isPlaying" v-model.lazy.trim="character" />
    <button
      v-if="!isRecording && !isPlaying"
      @click="
        recordAudio();
        transcribeSpeech();
      "
      type="button"
    >
      Record
    </button>
    <button v-else-if="isRecording && !isPlaying" @click="stop" type="button">Stop</button>
  </div>
</template>

<script>
export default {
  name: "AudioRecorder",
  props: {
    isPlaying: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      isRecording: false,
      character: "Character name",
      cue: "",
    };
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
      this.recognition.stop();
      this.audioData = new Blob(this.dataArray, { type: "audio/wav" });
      this.recognition.onend = function () {
        this.$emit("recording-done", {
          character: this.character,
          recording: this.audioData,
          cue: findShortestCue(this.cue),
        });
        this.cue = "";
      }.bind(this);
      this.audioSrc = window.URL.createObjectURL(this.audioData);
      let clip = new Audio(this.audioSrc);
      clip.play();
    },
    transcribeSpeech() {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (typeof SpeechRecognition !== "undefined") {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = "en-US";
        this.recognition.interimResults = true;
        this.recognition.continuous = true;
        this.recognition.start();
        this.recognition.onresult = function (event) {
          this.cue = event.results[event.resultIndex][0].transcript;
        }.bind(this);
      }
    },
  },
};
function findShortestCue(cue) {
  var words = cue.split(" ");
  var possible_cue = "";
  for (var i = words.length - 1; i > -1; i--) {
    possible_cue = words[i] + " " + possible_cue;
    var remaining = words.slice(0, i).join(" ");
    if (!isRepeated(remaining, possible_cue)) {
      return possible_cue;
    }
  }
  return possible_cue;
}
function isRepeated(remaining_text, candidate) {
  candidate = candidate.trim().toLowerCase();
  return (
    remaining_text.includes(candidate) || candidate.includes(remaining_text)
  );
}
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