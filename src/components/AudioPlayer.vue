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
      this.player.pause();
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
        this.recognition.interimResults = false;
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
                  this.recognition.interimResults = false;
                  this.recognition.continuous = true;
                  this.recognition.start();
                  var line_cue = recordings_to_play[index]["cue"];
                  this.recognition.onresult = function (event) {
                    this.cue =
                      event.results[event.results.length - 1][0].transcript;
                    // look for last word or specific cue?
                    if (this.cue == line_cue) {
                      console.log("hooray");
                      if (index < recordings_to_play.length - 1) {
                        console.log("next");
                        index++;
                        if (recognition_indexes.includes(index)) {
                          line_cue = recordings_to_play[index]["cue"];
                        } else {
                          this.recognition.stop();
                          line = recordings_to_play[index]["recording"];
                          this.player.src = window.URL.createObjectURL(line);
                          this.player.play();
                        }
                      }
                    } else {
                      index = 0;
                      console.log("restart");
                      line = recordings_to_play[index]["recording"];
                      this.player.src = window.URL.createObjectURL(line);
                      this.player.play();
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
      if (recognition_indexes[0] < 0) {
        console.log(recognition_indexes);
        console.log("no characters selected");
      }
      if (recognition_indexes[0] == 0) {
        console.log(recognition_indexes);
        console.log("goodbye world");
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