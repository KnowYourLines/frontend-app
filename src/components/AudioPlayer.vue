<template>
  <div>
    <div v-if="isPlaying" class="play-controls">
      <button type="button" class="play" @click="stopAll">Stop</button>
      <h2>{{ characterPrompt }}<br />{{ cuePrompt }}<br />{{ speechHeard }}</h2>
    </div>
    <audio-list
      :isPlaying="isPlaying"
      :stayingLoggedIn="stayLoggedIn"
      :stayingLoggedInDetails="loginDetails"
      :savingScriptId="savedScriptId"
      @play-nonstop="playAll"
      @play-on-cue="playOnCue"
      @stay-logged-in="loggedIn"
      @selected-script-id="saveScriptId"
    />
  </div>
</template>

<script>
import AudioList from "./AudioList";
export default {
  name: "AudioPlayer",
  components: {
    AudioList,
  },
  data() {
    return {
      isPlaying: false,
      characterPrompt: "",
      speechHeard: "",
      cuePrompt: "",
      stayLoggedIn: false,
      loginDetails: {},
      savedScriptId: null,
    };
  },
  methods: {
    saveScriptId: function (id){
      this.savedScriptId = id;
    },
    loggedIn: function (details){
      this.stayLoggedIn = true;
      this.loginDetails = details
    },
    playAll: function (recordings) {
      var recordings_to_play = recordings.filter(
        (recording) => recording.shouldPlay
      );
      var index = 0;
      var line = recordings_to_play[index]["recording"];
      this.characterPrompt =
        "Playing for: " + recordings_to_play[index]["name"];
      this.player = new Audio();
      if (typeof line !== "undefined") {
        this.player.src = window.URL.createObjectURL(line);
      } else {
        line = recordings_to_play[index]["downloadUrl"];
        this.player.src = line;
      }
      this.player.play();
      this.isPlaying = true;
      this.player.addEventListener(
        "ended",
        function () {
          index++;
          if (index == recordings_to_play.length) {
            index = 0;
          }
          if (index < recordings_to_play.length) {
            line = recordings_to_play[index]["recording"];
            if (index == 0) {
              this.characterPrompt =
                "Restart...playing for: " + recordings_to_play[index]["name"];
            } else {
              this.characterPrompt =
                "Playing for: " + recordings_to_play[index]["name"];
            }
            if (typeof line !== "undefined") {
              this.player.src = window.URL.createObjectURL(line);
            } else {
              line = recordings_to_play[index]["downloadUrl"];
              this.player.src = line;
            }
            this.player.play();
          }
        }.bind(this)
      );
    },
    stopAll: function () {
      this.isPlaying = false;
      this.characterPrompt = "";
      this.speechHeard = "";
      this.cuePrompt = "";
      if (typeof this.player !== "undefined") {
        this.player.pause();
      }
      if (typeof this.recognition !== "undefined") {
        this.recognition.abort();
        this.recognition.onend = function () {
          this.recognition.abort();
        }.bind(this);
      }
    },
    playOnCue: function (recordings, characters) {
      var recordings_to_play = recordings.filter(
        (recording) => recording.shouldPlay
      );
      var recognition_indexes = OnCueIndexes(recordings_to_play, characters);
      console.log(recognition_indexes);
      if (recognition_indexes[0] > 0) {
        var index = 0;
        var line = recordings_to_play[index]["recording"];
        this.characterPrompt =
          "Playing for: " + recordings_to_play[index]["name"];
        this.player = new Audio();
        if (typeof line !== "undefined") {
          this.player.src = window.URL.createObjectURL(line);
        } else {
          line = recordings_to_play[index]["downloadUrl"];
          this.player.src = line;
        }
        this.player.play();
        this.isPlaying = true;
        this.player.addEventListener(
          "ended",
          function () {
            index++;
            if (index == recordings_to_play.length) {
              index = 0;
            }
            if (index < recordings_to_play.length) {
              if (recognition_indexes.includes(index)) {
                this.recognition = newSpeechRecognition();
                this.recognition.start();
                var line_cue = recordings_to_play[index]["cue"];
                this.characterPrompt =
                  "Listening for: " + recordings_to_play[index]["name"];
                this.cuePrompt = "Cue: " + line_cue;
                this.recognition.onresult = function (event) {
                  this.cue = event.results[event.resultIndex][0].transcript;
                  this.cue = " " + this.cue.trim().toLowerCase() + " ";
                  this.speechHeard = "Heard: " + this.cue;
                  line_cue = " " + line_cue.trim().toLowerCase() + " ";
                  console.log(line_cue);
                  console.log(this.cue);
                  if (this.cue.includes(line_cue)) {
                    console.log("hooray");
                    this.speechHeard = "";
                    this.cuePrompt = "";
                    this.recognition.abort();
                    if (index < recordings_to_play.length - 1) {
                      console.log("next");
                      index++;
                      if (recognition_indexes.includes(index)) {
                        this.recognition.onend = function () {
                          this.recognition.start();
                        }.bind(this);
                        line_cue = recordings_to_play[index]["cue"];
                        this.characterPrompt =
                          "Listening for: " + recordings_to_play[index]["name"];
                        this.cuePrompt = "Cue: " + line_cue;
                      } else {
                        this.recognition.abort();
                        line = recordings_to_play[index]["recording"];
                        this.characterPrompt =
                          "Playing for: " + recordings_to_play[index]["name"];
                        if (typeof line !== "undefined") {
                          this.player.src = window.URL.createObjectURL(line);
                        } else {
                          line = recordings_to_play[index]["downloadUrl"];
                          this.player.src = line;
                        }
                        this.player.play();
                      }
                    } else {
                      index = 0;
                      console.log("restart");
                      line = recordings_to_play[index]["recording"];
                      this.characterPrompt =
                        "Restart...playing for: " +
                        recordings_to_play[index]["name"];
                      if (typeof line !== "undefined") {
                        this.player.src = window.URL.createObjectURL(line);
                      } else {
                        line = recordings_to_play[index]["downloadUrl"];
                        this.player.src = line;
                      }
                      this.player.play();
                    }
                  }
                }.bind(this);
              } else {
                line = recordings_to_play[index]["recording"];
                if (index == 0) {
                  this.characterPrompt =
                    "Restart...playing for: " +
                    recordings_to_play[index]["name"];
                } else {
                  this.characterPrompt =
                    "Playing for: " + recordings_to_play[index]["name"];
                }
                if (typeof line !== "undefined") {
                  this.player.src = window.URL.createObjectURL(line);
                } else {
                  line = recordings_to_play[index]["downloadUrl"];
                  this.player.src = line;
                }
                this.player.play();
              }
            }
          }.bind(this)
        );
      }
      if (recognition_indexes[0] == 0) {
        index = 0;
        var line_cue = recordings_to_play[index]["cue"];
        this.isPlaying = true;
        this.characterPrompt =
          "Listening for: " + recordings_to_play[index]["name"];
        this.cuePrompt = "Cue: " + line_cue;
        this.recognition = newSpeechRecognition();
        this.recognition.start();
        this.recognition.onresult = function (event) {
          this.cue = event.results[event.resultIndex][0].transcript;
          this.cue = " " + this.cue.trim().toLowerCase() + " ";
          this.speechHeard = "Heard: " + this.cue;
          line_cue = " " + line_cue.trim().toLowerCase() + " ";
          console.log(line_cue);
          console.log(this.cue);
          if (this.cue.includes(line_cue)) {
            this.recognition.abort();
            this.speechHeard = "";
            this.cuePrompt = "";
            if (index < recordings_to_play.length - 1) {
              console.log("next");
              index++;
              if (recognition_indexes.includes(index)) {
                this.recognition.onend = function () {
                  this.recognition.start();
                }.bind(this);
                line_cue = recordings_to_play[index]["cue"];
                this.characterPrompt =
                  "Listening for: " + recordings_to_play[index]["name"];
                this.cuePrompt = "Cue: " + line_cue;
              } else {
                line = recordings_to_play[index]["recording"];
                this.characterPrompt =
                  "Playing for: " + recordings_to_play[index]["name"];
                this.player = new Audio();
                if (typeof line !== "undefined") {
                  this.player.src = window.URL.createObjectURL(line);
                } else {
                  line = recordings_to_play[index]["downloadUrl"];
                  this.player.src = line;
                }
                this.player.play();
                this.player.addEventListener(
                  "ended",
                  function () {
                    index++;
                    if (index == recordings_to_play.length) {
                      index = 0;
                      console.log("restart");
                    }
                    if (recognition_indexes.includes(index)) {
                      line_cue = recordings_to_play[index]["cue"];
                      if (index == 0) {
                        this.characterPrompt =
                          "Restart...listening for: " +
                          recordings_to_play[index]["name"];
                      } else {
                        this.characterPrompt =
                          "Listening for: " + recordings_to_play[index]["name"];
                      }
                      this.cuePrompt = "Cue: " + line_cue;
                      this.recognition.start();
                    } else {
                      line = recordings_to_play[index]["recording"];
                      this.characterPrompt =
                        "Playing for: " + recordings_to_play[index]["name"];
                      if (typeof line !== "undefined") {
                        this.player.src = window.URL.createObjectURL(line);
                      } else {
                        line = recordings_to_play[index]["downloadUrl"];
                        this.player.src = line;
                      }
                      this.player.play();
                    }
                  }.bind(this)
                );
              }
            } else {
              console.log("restart");
              this.recognition.onend = function () {
                this.recognition.start();
              }.bind(this);
              index = 0;
              line_cue = recordings_to_play[index]["cue"];
              this.characterPrompt =
                "Restart...listening for: " + recordings_to_play[index]["name"];
              this.cuePrompt = "Cue: " + line_cue;
            }
          }
        }.bind(this);
      }
    },
  },
};
function OnCueIndexes(recordings, characters) {
  var indexes = [],
    i;
  for (i = 0; i < recordings.length; i++)
    if (characters.includes(recordings[i].name)) {
      indexes.push(i);
    }
  return indexes;
}
function newSpeechRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (typeof SpeechRecognition !== "undefined") {
    var recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
  }
  return recognition;
}
</script>
<style scoped>
h2 {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 200;
  font-family: helvetica;
  color: #87169e;
}
button {
  width: 100%;
  font-size: 32px;
  font-weight: 200;
  padding: 1em;
  background: transparent;
  border: 4px solid #f22f46;
  border-radius: 4px;
  transition: all 0.4s ease 0s;
  cursor: pointer;
  color: #f22f46;
  margin-bottom: 4em;
  position: relative;
}

button:hover,
button:focus {
  background: #f22f46;
  color: #fff;
}
</style>