<template>
  <div v-if="!isPlaying">
    <div class="bar">
      <div class="signup">
        <div class="signup-input">
          <div class="email-input">
            <input
              type="text"
              autocomplete="on"
              v-model.lazy.trim="email"
              ref="email"
            />
          </div>
          <div class="password-input">
            <input
              type="password"
              autocomplete="on"
              v-model.lazy.trim="password"
              ref="password"
            />
            <img
              v-if="hidePassword"
              @click="togglePassword"
              src="@/assets/eye.png"
              width="25"
            />
            <img
              v-else
              @click="togglePassword"
              src="@/assets/eye-hide.png"
              width="25"
            />
          </div>
        </div>
        <div class="signup-btn-group">
          <button v-if="!isLoggedIn" @click="logIn" type="button">Login</button>
          <button v-else-if="isLoggedIn" @click="logOut" type="button">
            Logout
          </button>
          <button @click="register" type="button">
            Email account activation
          </button>
          <button @click="reset" type="button">Email password reset</button>
        </div>
      </div>
      <div class="create">
        <div class="create-input">
          <input
            type="text"
            autocomplete="on"
            v-model.lazy.trim="scriptName"
            ref="scriptName"
          />
        </div>
        <div class="create-btn-group">
          <button @click="saveAsNew" type="button">Save as new</button>
        </div>
      </div>
      <div class="update">
        <div class="update-input">
          <select
            @change="scriptSelected"
            v-model="selectedScriptId"
            ref="scriptSelect"
          >
            <option :value="null" selected disabled hidden>
              Select your script here...
            </option>
            <option
              v-for="script in scripts"
              :value="script.id"
              :key="script.id"
            >
              {{ script.scriptName }}
            </option>
          </select>
        </div>
        <div class="update-btn-group">
          <button @click="saveChanges" type="button">Save changes</button>
          <button @click="deleteScript" type="button">Delete script</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
export default {
  name: "Backend",
  data() {
    return {
      isLoggedIn: false,
      email: "email@address.com",
      password: "password",
      scriptName: "Script Title",
      token: null,
      scripts: [],
      selectedScriptId: null,
      hidePassword: true,
      maxRetries: 3,
      maxAttempts: this.maxRetries + 1,
    };
  },
  props: {
    list: {
      type: Array,
      required: true,
    },
    isPlaying: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    prepareLinesForSave(lines, retries = this.maxRetries) {
      const result = this.addOrder(lines);
      const requests = [];
      result.forEach((line) => {
        if (!line["uploaded"]) {
          line["lineId"] = uuidv4();
          requests.push(this.uploadLine(line));
        }
      });
      Promise.all(requests)
        .then(
          result.forEach((line) => {
            if (!line["uploaded"]) {
              line["uploaded"] = true;
            }
          })
        )
        .catch(function (error) {
          if (retries > 0) {
            var attemptNumber = this.maxAttempts - retries + 1;
            console.log("Attempt " + attemptNumber + " to upload all lines");
            return this.prepareLinesForSave(lines, retries - 1);
          } else {
            this.catchError(error);
          }
        });
      return result;
    },
    addOrder(lines) {
      for (var i = 0; i < lines.length; i++) {
        lines[i]["order"] = i;
      }
      return lines;
    },
    uploadLine(line, retries = this.maxRetries) {
      const request = axios
        .get(
          process.env.VUE_APP_BACKEND_URL +
            "/get_upload_url/" +
            line["lineId"] +
            "/"
        )
        .then((response) => {
          var postUrl = response["data"]["s3Request"]["url"];
          var postData = new FormData();
          for (var key in response["data"]["s3Request"]["fields"]) {
            postData.append(key, response["data"]["s3Request"]["fields"][key]);
          }
          postData.append("file", line["recording"]);
          axios
            .post(postUrl, postData, { headers: { Authorization: "" } })
            .catch(function (error) {
              if (retries > 0) {
                var attemptNumber = this.maxAttempts - retries + 1;
                console.log(
                  "Attempt " +
                    attemptNumber +
                    " to upload line " +
                    line["lineId"] +
                    " to S3"
                );
                return this.uploadLine(line, retries - 1);
              } else if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
              }
            });
        })
        .catch(function (error) {
          if (retries > 0) {
            var attemptNumber = this.maxAttempts - retries + 1;
            console.log(
              "Attempt " +
                attemptNumber +
                " get upload URL for line " +
                line["lineId"]
            );
            return this.uploadLine(line, retries - 1);
          } else if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          }
        });
      return request;
    },
    togglePassword() {
      this.hidePassword = !this.hidePassword;
      if (this.hidePassword) {
        this.$refs.password.type = "password";
      } else {
        this.$refs.password.type = "text";
      }
    },
    catchError(error) {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      }
    },
    loadScripts(retries = this.maxRetries) {
      axios
        .get(process.env.VUE_APP_BACKEND_URL + "/scripts/")
        .then((response) => {
          response.data.forEach(
            function (script) {
              this.scripts.push({
                scriptName: script["scriptName"],
                lines: script["lines"],
                id: script["id"],
              });
            }.bind(this)
          );
        })
        .catch(function (error) {
          if (retries > 0) {
            var attemptNumber = this.maxAttempts - retries + 1;
            console.log("Attempt " + attemptNumber + " to load scripts");
            return this.loadScripts(retries - 1);
          } else {
            this.catchError(error);
          }
        });
    },
    deleteScript(retries = this.maxRetries) {
      axios
        .delete(
          process.env.VUE_APP_BACKEND_URL +
            "/scripts/" +
            this.selectedScriptId +
            "/"
        )
        .then(() => {
          this.scripts = [];
          this.loadScripts();
        })
        .catch(
          function (error) {
            if (retries > 0) {
              var attemptNumber = this.maxAttempts - retries + 1;
              console.log("Attempt " + attemptNumber + " to delete script");
              return this.deleteScript(retries - 1);
            } else {
              this.catchErrorAndBlink(error, this.blinkScriptUpdate);
            }
          }.bind(this)
        );
    },
    saveChanges(retries = this.maxRetries) {
      var lines = this.prepareLinesForSave(this.list);
      axios
        .patch(
          process.env.VUE_APP_BACKEND_URL +
            "/scripts/" +
            this.selectedScriptId +
            "/",
          {
            lines: lines,
          }
        )
        .then(() => {
          this.scripts = [];
          this.loadScripts();
        })
        .catch(
          function (error) {
            if (retries > 0) {
              var attemptNumber = this.maxAttempts - retries + 1;
              console.log("Attempt " + attemptNumber + " to save changes");
              return this.saveChanges(retries - 1);
            } else {
              this.catchErrorAndBlink(error, this.blinkScriptUpdate);
            }
          }.bind(this)
        );
    },
    blinkScriptUpdate(error) {
      if (error.response.status == 403 || error.response.status == 401) {
        this.blinkLogIn(error);
      } else {
        let scriptSelectNormalColour =
          this.$refs.scriptSelect.style.backgroundColor;
        this.$refs.scriptSelect.style.backgroundColor = "red";
        setTimeout(() => {
          this.$refs.scriptSelect.style.backgroundColor =
            scriptSelectNormalColour;
        }, 500);
      }
    },
    scriptSelected() {
      const selectedScript = this.scripts.filter(
        (script) => script["id"] === this.selectedScriptId
      );
      this.$emit("script-selected", {
        lines: selectedScript[0]["lines"],
      });
    },
    saveAsNew(retries = this.maxRetries) {
      var lines = this.prepareLinesForSave(this.list);
      axios
        .post(process.env.VUE_APP_BACKEND_URL + "/scripts/", {
          scriptName: this.scriptName,
          lines: lines,
        })
        .then((response) => {
          this.scripts = [];
          this.loadScripts();
          this.selectedScriptId = response.data["id"];
          this.$emit("script-selected", {
            lines: response.data["lines"],
          });
        })
        .catch(
          function (error) {
            if (retries > 0) {
              var attemptNumber = this.maxAttempts - retries + 1;
              console.log("Attempt " + attemptNumber + " to save new script");
              return this.saveAsNew(retries - 1);
            } else {
              this.catchErrorAndBlink(error, this.blinkSaveNew);
            }
          }.bind(this)
        );
    },
    catchErrorAndBlink(error, blinker) {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        blinker(error);
      }
    },
    blinkSaveNew(error) {
      if (error.response.status == 403 || error.response.status == 401) {
        this.blinkLogIn(error);
      } else {
        let scriptNameNormalColour =
          this.$refs.scriptName.style.backgroundColor;
        this.$refs.scriptName.style.backgroundColor = "red";
        setTimeout(() => {
          this.$refs.scriptName.style.backgroundColor = scriptNameNormalColour;
        }, 500);
      }
    },
    logIn(retries = this.maxRetries) {
      axios
        .post(process.env.VUE_APP_BACKEND_URL + "/accounts/login/", {
          username: this.email,
          password: this.password,
        })
        .then((response) => {
          this.token = response["data"]["token"];
          axios.defaults.headers.common = {
            Authorization: "Token " + this.token,
          };
          this.isLoggedIn = true;
          this.loadScripts();
        })
        .catch(
          function (error) {
            if (retries > 0) {
              var attemptNumber = this.maxAttempts - retries + 1;
              console.log("Attempt " + attemptNumber + " to log in");
              return this.logIn(retries - 1);
            } else {
              this.catchErrorAndBlink(error, this.blinkLogIn);
            }
          }.bind(this)
        );
    },
    blinkLogIn(error) {
      if (
        (Object.keys(error.response.data).includes("email") ||
          Object.keys(error.response.data).includes("username")) &&
        !Object.keys(error.response.data).includes("password")
      ) {
        this.blinkEmail();
      } else if (
        !(
          Object.keys(error.response.data).includes("email") ||
          Object.keys(error.response.data).includes("username")
        ) &&
        Object.keys(error.response.data).includes("password")
      ) {
        this.blinkPassword();
      } else {
        this.blinkPassword();
        this.blinkEmail();
      }
    },
    logOut() {
      axios
        .post(process.env.VUE_APP_BACKEND_URL + "/accounts/logout/")
        .then(() => {
          this.isLoggedIn = false;
          this.selectedScriptId = null;
          this.scripts = [];
          this.token = null;
          axios.defaults.headers.common = {};
        });
    },
    register(retries = this.maxRetries) {
      axios
        .post(process.env.VUE_APP_BACKEND_URL + "/accounts/register/", {
          username: this.email,
          email: this.email,
          password: this.password,
        })
        .catch(
          function (error) {
            if (retries > 0) {
              var attemptNumber = this.maxAttempts - retries + 1;
              console.log("Attempt " + attemptNumber + " to register");
              return this.register(retries - 1);
            } else {
              this.catchErrorAndBlink(error, this.blinkLogIn);
            }
          }.bind(this)
        );
    },
    blinkEmail() {
      let emailNormalColour = this.$refs.email.style.backgroundColor;
      this.$refs.email.style.backgroundColor = "red";
      setTimeout(() => {
        this.$refs.email.style.backgroundColor = emailNormalColour;
      }, 500);
    },
    blinkPassword() {
      let passwordNormalColour = this.$refs.password.style.backgroundColor;
      this.$refs.password.style.backgroundColor = "red";
      setTimeout(() => {
        this.$refs.password.style.backgroundColor = passwordNormalColour;
      }, 500);
    },
    reset(retries = this.maxRetries) {
      axios
        .post(process.env.VUE_APP_BACKEND_URL + "/accounts/reset-password/", {
          email: this.email,
        })
        .catch(
          function (error) {
            if (retries > 0) {
              var attemptNumber = this.maxAttempts - retries + 1;
              console.log("Attempt " + attemptNumber + " to reset password");
              return this.reset(retries - 1);
            } else {
              this.catchErrorAndBlink(error, this.blinkEmail);
            }
          }.bind(this)
        );
    },
  },
};
</script>
<style scoped>
.email-input {
  flex: 1;
}
.password-input {
  flex: 20;
  margin-right: 100px;
}
.password-input {
  position: relative;
  width: 140px;
}
.password-input input {
  border: none;
  background-color: #fff;
  display: block;
  width: 100%;
  box-sizing: border-box;
}
.password-input img {
  position: absolute;
  top: -1px;
  right: 5px;
}
.bar {
  display: grid;
  margin-bottom: 4em;
}
.signup {
  display: grid;
  grid-column: 1;
  grid-row: 1;
}
.signup-btn-group {
  grid-row: 2;
}
.signup-btn-group button {
  font-size: 15px;
  background: transparent;
  border: 4px solid #00968e;
  border-radius: 4px;
  transition: all 0.4s ease 0s;
  cursor: pointer;
  color: #00968e;
}
.signup-btn-group button:hover,
.signup-btn-group button:focus {
  background: #00968e;
  color: #fff;
}
.signup-input {
  display: flex;
}
.signup-input input[type="text"] {
  font-size: 15px;
  border: 2px solid #ccc;
  -webkit-border-radius: 5px;
  border-radius: 5px;
  border-color: #ccc;
  grid-column: 1;
  grid-row: 1;
  background-color: #00968e;
  color: white;
}
.signup-input input[type="password"] {
  font-size: 15px;
  border: 2px solid #ccc;
  -webkit-border-radius: 5px;
  border-radius: 5px;
  border-color: #ccc;
  grid-column: 1;
  grid-row: 1;
  background-color: #00968e;
  color: white;
}
.create {
  display: grid;
  grid-column: 2;
  grid-row: 1;
  column-gap: 0rem;
}
.create-btn-group {
  grid-column: 1;
  grid-row: 2;
}
.create-btn-group button {
  font-size: 15px;
  background: transparent;
  border: 4px solid #00968e;
  border-radius: 4px;
  transition: all 0.4s ease 0s;
  cursor: pointer;
  color: #00968e;
}
.create-btn-group button:hover,
.create-btn-group button:focus {
  background: #00968e;
  color: #fff;
}
.create-input input[type="text"] {
  font-size: 15px;
  border: 2px solid #ccc;
  -webkit-border-radius: 5px;
  border-radius: 5px;
  border-color: #ccc;
  background-color: #00968e;
  color: white;
}
.update {
  display: grid;
  grid-column: 3;
  grid-row: 1;
}
.update-btn-group {
  grid-column: 2;
  grid-row: 1;
}
.update-btn-group button {
  font-size: 15px;
  background: transparent;
  border: 4px solid #00968e;
  border-radius: 4px;
  transition: all 0.4s ease 0s;
  cursor: pointer;
  color: #00968e;
}
.update-btn-group button:hover,
.update-btn-group button:focus {
  background: #00968e;
  color: #fff;
}
.update-input select {
  font-size: 15px;
  border: 2px solid #ccc;
  -webkit-border-radius: 5px;
  border-radius: 5px;
  border-color: #ccc;
  background-color: #00968e;
  color: white;
  width: 100%;
}
</style>
