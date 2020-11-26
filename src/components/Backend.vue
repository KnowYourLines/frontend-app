<template>
  <div>
    <div class="bar">
      <div class="signup">
        <div class="signup-input">
          <input type="text" autocomplete="on" v-model.lazy.trim="email" />
          <input type="text" autocomplete="on" v-model.lazy.trim="password" />
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
          <input type="text" autocomplete="on" v-model.lazy.trim="scriptName" />
          <input type="text" autocomplete="on" v-model.lazy.trim="writer" />
        </div>
        <div class="create-btn-group">
          <button @click="saveAsNew" type="button">Save as new</button>
        </div>
              <div class="error-message">
        <ul v-if="errorData">
          {{
            errorData
          }}
        </ul>
      </div>
      </div>
      <div class="update">
        <div class="update-input">
          <select @change="scriptSelected" v-model="selectedScriptId">
            <option :value="null" selected disabled hidden>
              Select your script here...
            </option>
            <option
              v-for="script in scripts"
              :value="script.id"
              :key="script.id"
            >
              {{ script.scriptName }} by {{ script.writer }}
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
      writer: "Writer",
      token: null,
      scripts: [],
      selectedScriptId: null,
      errorData: null,
    };
  },
  props: {
    list: {
      type: Array,
      required: true,
    },
    alreadyLoggedIn: {
      type: Boolean,
      required: true,
    },
    alreadyLoggedInDetails: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    this.isLoggedIn = this.alreadyLoggedIn;
    if (this.isLoggedIn) {
      this.email = this.alreadyLoggedInDetails["email"];
      this.password = this.alreadyLoggedInDetails["password"];
      this.token = this.alreadyLoggedInDetails["token"];
      axios.defaults.headers.common = {
        Authorization: "Token " + this.token,
      };
      this.loadScripts();
    }
  },
  methods: {
    loadScripts() {
      axios
        .get(process.env.VUE_APP_BACKEND_URL + "scripts/")
        .then((response) => {
          response.data.forEach(
            function (script) {
              this.scripts.push({
                scriptName: script["scriptName"],
                writer: script["writer"],
                lines: script["lines"],
                id: script["id"],
              });
            }.bind(this)
          );
        })
        .catch(console.log);
    },
    deleteScript() {
      axios
        .delete(
          process.env.VUE_APP_BACKEND_URL +
            "scripts/" +
            this.selectedScriptId +
            "/"
        )
        .then(() => {
          this.scripts = [];
          this.loadScripts();
        })
        .catch(console.log);
    },
    saveChanges() {
      var lines = prepareLinesForSave(this.list);
      axios
        .patch(
          process.env.VUE_APP_BACKEND_URL +
            "scripts/" +
            this.selectedScriptId +
            "/",
          {
            scriptName: this.scriptName,
            writer: this.writer,
            lines: lines,
          }
        )
        .then(() => {
          this.scripts = [];
          this.loadScripts();
        })
        .catch(console.log);
    },
    scriptSelected() {
      const selectedScript = this.scripts.filter(
        (script) => script["id"] === this.selectedScriptId
      );
      this.$emit("script-selected", selectedScript[0]["lines"]);
    },
    saveAsNew() {
      var lines = prepareLinesForSave(this.list);
      axios
        .post(process.env.VUE_APP_BACKEND_URL + "scripts/", {
          scriptName: this.scriptName,
          writer: this.writer,
          lines: lines,
        })
        .then(() => {
          this.scripts = [];
          this.loadScripts();
        })
        .catch(console.log);
    },
    logIn() {
      axios
        .post(process.env.VUE_APP_BACKEND_URL + "accounts/login/", {
          username: this.email,
          password: this.password,
        })
        .then((response) => {
          this.token = response["data"]["token"];
          axios.defaults.headers.common = {
            Authorization: "Token " + this.token,
          };
          this.isLoggedIn = true;
          this.$emit("logged-in", {
            token: this.token,
            email: this.email,
            password: this.password,
          });
          this.loadScripts();
        })
        .catch(
          function (error) {
            if (error.response) {
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.headers);
              this.errorData = error.response.data;
            }
          }.bind(this)
        );
    },
    logOut() {
      axios
        .post(process.env.VUE_APP_BACKEND_URL + "accounts/logout/")
        .then(() => {
          this.isLoggedIn = false;
          this.selectedLines = [];
          this.scripts = [];
        });
    },
    register() {
      axios
        .post(process.env.VUE_APP_BACKEND_URL + "accounts/register/", {
          username: this.email,
          email: this.email,
          password: this.password,
        })
        .then(console.log)
        .catch(console.log);
    },
    reset() {
      axios
        .post(process.env.VUE_APP_BACKEND_URL + "accounts/reset-password/", {
          email: this.email,
        })
        .then(console.log)
        .catch(console.log);
    },
  },
};
function prepareLinesForSave(lines) {
  const result = addOrder(lines);
  result.forEach((line) => {
    if (!line["uploaded"]) {
      line["lineId"] = uuidv4();
      uploadLine(line);
      line["uploaded"] = true;
    }
  });
  return result;
}
function addOrder(lines) {
  for (var i = 0; i < lines.length; i++) {
    lines[i]["order"] = i;
  }
  return lines;
}
function uploadLine(line) {
  axios
    .get(
      process.env.VUE_APP_BACKEND_URL + "get_upload_url/" + line["lineId"] + "/"
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
          if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          }
        });
    })
    .catch(function (error) {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      }
    });
}
</script>
<style scoped>
.bar {
  display:grid;
  margin-bottom: 1em;
}
.signup {
  display: grid;
  grid-column:1;
  grid-row:1;
}
.signup-btn-group {
  grid-row: 2;
}
.signup-btn-group button {
  font-size: 15px;
  background: transparent;
  border: 4px solid #099237;
  border-radius: 4px;
  transition: all 0.4s ease 0s;
  cursor: pointer;
  color: #099237;
}
.signup-btn-group button:hover,
.signup-btn-group button:focus {
  background: #099237;
  color: #fff;
}
.signup-input input[type="text"] {
  font-size: 15px;
  border: 2px solid #ccc;
  -webkit-border-radius: 5px;
  border-radius: 5px;
  border-color: #ccc;
  grid-column: 1;
  grid-row: 1;
  background-color: #099237;
  color: white;
}
.create {
  display: grid;
  grid-column:2;
  grid-row:1;
}
.create-btn-group {
  grid-column: 2;
  grid-row: 1;
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
  grid-column: 1;
  grid-row: 1;
  background-color: #00968e;
  color: white;
}
.update {
  display: grid;
  grid-column:3;
  grid-row:1;
}
.update-btn-group {
  grid-column: 2;
  grid-row: 1;
}
.update-btn-group button {
  font-size: 15px;
  background: transparent;
  border: 4px solid #df6c00;
  border-radius: 4px;
  transition: all 0.4s ease 0s;
  cursor: pointer;
  color: #df6c00;
}
.update-btn-group button:hover,
.update-btn-group button:focus {
  background: #df6c00;
  color: #fff;
}
.update-input select {
  font-size: 15px;
  border: 2px solid #ccc;
  -webkit-border-radius: 5px;
  border-radius: 5px;
  border-color: #ccc;
  background-color: #df6c00;
  color: white;
  width: 100%;
}
</style>
