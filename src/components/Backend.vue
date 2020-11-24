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
    <button @click="saveAsNew" type="button">Save as new</button>
    <select @change="scriptSelected" v-model="selectedScriptId">
      <option v-for="script in scripts" :value="script.id" :key="script.id">
        {{ script.scriptName }} by {{ script.writer }} {{ script.id }}
      </option>
    </select>
    <button @click="saveChanges" type="button">Save changes</button>
  </div>
</template>

<script>
import axios from "axios";
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
    };
  },
  props: {
    list: {
      type: Array,
      required: true,
    },
  },
  methods: {
    saveChanges() {
      axios
        .patch(process.env.VUE_APP_BACKEND_URL + "scripts/" + this.selectedScriptId + "/", {
          scriptName: this.scriptName,
          writer: this.writer,
          lines: addOrder(this.list),
        })
        .then(console.log)
        .catch(console.log);
    },
    scriptSelected() {
      const selectedScript = this.scripts.filter(
        (script) => script["id"] === this.selectedScriptId
      );
      this.$emit("script-selected", selectedScript[0]["lines"]);
    },
    saveAsNew() {
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
        })
        .catch(console.log);
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

function addOrder(lines) {
  for (var i = 0; i < lines.length; i++) {
    lines[i]["order"] = i;
  }
  return lines;
}
</script>