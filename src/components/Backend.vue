<template>
  <div>
    <input type="text" autocomplete="on" v-model.lazy.trim="email" />
    <input type="text" autocomplete="on" v-model.lazy.trim="password" />
    <button v-if="!isLoggedIn" @click="logIn" type="button">Login</button>
    <button v-else-if="isLoggedIn" @click="logOut" type="button">Logout</button>
    <button @click="register" type="button">Send registration</button>
    <button @click="reset" type="button">Send password reset</button>
    <input type="text" autocomplete="on" v-model.lazy.trim="scriptName" />
    <input type="text" autocomplete="on" v-model.lazy.trim="writer" />
    <button @click="saveAs" type="button">Save As</button>
    <select v-model="selectedLines">
      <option v-for="script in scripts" v-bind:value="script.lines" :key="script.id">
        {{ script.scriptName }} by {{script.writer}}
      </option>
    </select>
    <span>Selected: {{ selectedLines }}</span>

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
      selectedLines: []
    };
  },
  props: {
    list: {
      type: Array,
      required: true,
    },
  },
  methods: {
    saveAs() {
      axios
        .post(process.env.VUE_APP_BACKEND_URL + "scripts/", {
          scriptName: this.scriptName,
          writer: this.writer,
          lines: addOrder(this.list),
        })
        .then(console.log)
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
          this.$emit("loggedIn", this.token);
          axios
            .get(process.env.VUE_APP_BACKEND_URL + "users/")
            .then((response) => {
              var currentUser = response["data"].filter(
                (user) => user["username"] === this.email
              );
              var scriptEndpoints = currentUser[0]["scripts"];
              scriptEndpoints.forEach(function (e) {
                axios
                  .get(e)
                  .then((response) => {
                    this.scripts.push({
                      scriptName: response["data"]["scriptName"],
                      writer: response["data"]["writer"],
                      lines: response["data"]["lines"],
                      id: uuidv4()
                    });
                  })
                  .catch(console.log);
              }.bind(this));
            })
            .catch(console.log);
        })
        .catch(console.log);
    },
    logOut() {
      axios
        .post(process.env.VUE_APP_BACKEND_URL + "accounts/logout/")
        .then((this.isLoggedIn = false));
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

function addOrder(lines) {
  for (var i = 0; i < lines.length; i++) {
    lines[i]["order"] = i;
  }
  return lines;
}
</script>