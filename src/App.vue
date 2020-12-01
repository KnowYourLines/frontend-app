<template>
  <div>
    <button
      class="btn btn-primary btn-margin"
      v-if="!authenticated"
      @click="login()"
    >
      Log In
    </button>
    <button
      class="btn btn-primary btn-margin"
      v-if="authenticated"
      @click="privateMessage()"
    >
      Call Private
    </button>
    <button
      class="btn btn-primary btn-margin"
      v-if="authenticated"
      @click="logout()"
    >
      Log Out
    </button>
    <div>
      <p>
        Not working? Try
        <a
          href="https://support.google.com/chrome/answer/95346?co=GENIE.Platform%3DAndroid&hl=en&oco=0"
          >Google Chrome</a
        >
      </p>
    </div>
    <audio-player />
  </div>
</template>

<script>
import AudioPlayer from "./components/AudioPlayer";
import AuthService from "./auth/AuthService";
import axios from 'axios'
const API_URL = process.env.VUE_APP_BACKEND_URL
const auth = new AuthService();
export default {
  name: "App",
  components: {
    AudioPlayer,
  },
  data() {
    this.handleAuthentication();
    this.authenticated = false;

    auth.authNotifier.on("authChange", (authState) => {
      this.authenticated = authState.authenticated;
    });

    return {
      authenticated: false,
      message: "",
    };
  },
  methods: {
    // this method calls the AuthService login() method
    login() {
      auth.login();
    },
    handleAuthentication() {
      auth.handleAuthentication();
    },
    logout() {
      auth.logout();
    },
    privateMessage () {
      const url = `${API_URL}/scripts/`
      return axios.get(url, {headers: {Authorization: `Bearer ${auth.getAuthToken()}`}}).then((response) => {
        console.log(response.data)
        this.message = response.data || ''
      })
    }
  },
};
</script>