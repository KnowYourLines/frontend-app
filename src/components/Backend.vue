<template>
  <div>
    <input type="text" autocomplete="on" v-model.lazy.trim="email" />
    <input type="text" autocomplete="on" v-model.lazy.trim="password" />
    <button v-if="!isLoggedIn" @click="logIn" type="button">Login</button>
    <button v-else-if="isLoggedIn" @click="logOut" type="button">Logout</button>
    <button @click="register" type="button">Send registration</button>
    <button @click="reset" type="button">Send password reset</button>
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
      token: null,
    };
  },
  methods: {
    logIn() {
      axios
        .post(
          process.env.VUE_APP_BACKEND_URL + "accounts/login/",
          {
            username: this.email,
            password: this.password,
          }
        )
        .then((response) => {
          this.token = response["data"]["token"];
          axios.defaults.headers.common = {
            Authorization: "Token " + this.token,
          };
          this.isLoggedIn = true;
        });
    },
    logOut() {
      axios
        .post(
          process.env.VUE_APP_BACKEND_URL + "accounts/logout/"
        )
        .then((this.isLoggedIn = false));
    },
    register() {
      axios
        .post(
          process.env.VUE_APP_BACKEND_URL + "accounts/register/",
          {
            username: this.email,
            email: this.email,
            password: this.password,
          }
        )
        .then(console.log)
        .catch(console.log);
    },
    reset() {
      axios
        .post(
          process.env.VUE_APP_BACKEND_URL + "accounts/reset-password/",
          {
            email: this.email,
          }
        )
        .then(console.log)
        .catch(console.log);
    },
  },
};
</script>