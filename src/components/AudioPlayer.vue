<template>
  <div>
    <audio-list
      :isPlaying="isPlaying"
      @play-nonstop="playAll"
      @stop-playing="pause"
      @play-on-cue="playOnCue"
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
    };
  },
  methods: {
    playAll: function (recordings) {
      var recordings_to_play = recordings.filter(
        (recording) => recording.shouldPlay
      );
      var index = 0;
      var line = recordings_to_play[index]["recording"];
      this.player = new Audio();
      this.player.src = window.URL.createObjectURL(line);
      this.player.play();
      this.isPlaying = true;
      this.player.addEventListener(
        "ended",
        function () {
          index++;
          if (index == recordings_to_play.length) {
            index = 0;
            recordings_to_play = recordings.filter(
              (recording) => recording.shouldPlay
            );
            this.isPlaying = !(recordings_to_play.length == 0);
          }
          if (index < recordings_to_play.length) {
            line = recordings_to_play[index]["recording"];
            this.player.src = window.URL.createObjectURL(line);
            this.player.play();
          }
        }.bind(this)
      );
    },
    pause: function () {
      this.isPlaying = false;
      this.recognition.abort();
      this.recognition.onend = function () {
        this.recognition.abort();
      }.bind(this);
      this.player.pause();
      this.recognition.onresult = function (){
        this.recognition.abort()
      }.bind(this)
    },
    playOnCue: function (recordings, characters) {
      var recordings_to_play = recordings.filter(
        (recording) => recording.shouldPlay
      );
      var recognition_indexes = OnCueIndexes(recordings_to_play, characters);
      console.log(recognition_indexes);
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (typeof SpeechRecognition !== "undefined") {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = "en-US";
        this.recognition.interimResults = true;
        this.recognition.continuous = true;
      }
      if (recognition_indexes[0] > 0) {
        var index = 0;
        var line = recordings_to_play[index]["recording"];
        this.player = new Audio();
        this.player.src = window.URL.createObjectURL(line);
        this.player.play();
        this.isPlaying = true;
        this.player.addEventListener(
          "ended",
          function () {
            index++;
            if (index == recordings_to_play.length) {
              index = 0;
              recognition_indexes = OnCueIndexes(
                recordings_to_play,
                characters
              );
              recordings_to_play = recordings.filter(
                (recording) => recording.shouldPlay
              );
            }
            if (index < recordings_to_play.length) {
              if (recognition_indexes.includes(index)) {
                const SpeechRecognition =
                  window.SpeechRecognition || window.webkitSpeechRecognition;
                if (typeof SpeechRecognition !== "undefined") {
                  this.recognition = new SpeechRecognition();
                  this.recognition.lang = "en-US";
                  this.recognition.interimResults = true;
                  this.recognition.continuous = true;
                  this.recognition.start();
                  var line_cue = recordings_to_play[index]["cue"];
                  this.recognition.onresult = function (event) {
                    this.cue = event.results[event.resultIndex][0].transcript;
                    console.log(line_cue);
                    console.log(this.cue);
                    if (
                      this.cue
                        .trim()
                        .toLowerCase()
                        .includes(line_cue.trim().toLowerCase())
                    ) {
                      console.log("hooray");
                      this.recognition.abort();
                      if (index < recordings_to_play.length - 1) {
                        console.log("next");
                        index++;
                        if (recognition_indexes.includes(index)) {
                          this.recognition.onend = function () {
                            this.recognition.start();
                          }.bind(this);
                          line_cue = recordings_to_play[index]["cue"];
                        } else {
                          this.recognition.abort();
                          line = recordings_to_play[index]["recording"];
                          this.player.src = window.URL.createObjectURL(line);
                          this.player.play();
                        }
                      } else {
                        index = 0;
                        console.log("restart");
                        line = recordings_to_play[index]["recording"];
                        this.player.src = window.URL.createObjectURL(line);
                        this.player.play();
                      }
                    }
                  }.bind(this);
                }
              } else {
                line = recordings_to_play[index]["recording"];
                this.player.src = window.URL.createObjectURL(line);
                this.player.play();
              }
            }
          }.bind(this)
        );
      }
      if (recognition_indexes[0] == 0) {
        index = 0;
        this.recognition.start();
        this.isPlaying = true;
        var line_cue = recordings_to_play[index]["cue"];
        this.recognition.onresult = function (event) {
          this.cue = event.results[event.resultIndex][0].transcript;
          console.log(line_cue);
          console.log(this.cue);
          if (
            this.cue
              .trim()
              .toLowerCase()
              .includes(line_cue.trim().toLowerCase())
          ) {
            this.recognition.abort();
            if (index < recordings_to_play.length - 1) {
              console.log("next");
              index++;
              if (recognition_indexes.includes(index)) {
                this.recognition.onend = function () {
                  this.recognition.start();
                }.bind(this);
                line_cue = recordings_to_play[index]["cue"];
                console.log("here");
              } else {
                line = recordings_to_play[index]["recording"];
                this.player = new Audio();
                this.player.src = window.URL.createObjectURL(line);
                this.player.play();
                this.player.addEventListener(
                  "ended",
                  function () {
                    index++;
                    if (index == recordings_to_play.length) {
                      index = 0;
                      recordings_to_play = recordings.filter(
                        (recording) => recording.shouldPlay
                      );
                      recognition_indexes = OnCueIndexes(
                        recordings_to_play,
                        characters
                      );
                      line_cue = recordings_to_play[index]["cue"];
                      console.log("restart");
                      this.recognition.start();
                    }

                    if (recognition_indexes.includes(index)) {
                      line_cue = recordings_to_play[index]["cue"];
                      this.recognition.start();
                    } else {
                      line = recordings_to_play[index]["recording"];
                      this.player.src = window.URL.createObjectURL(line);
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
</script>