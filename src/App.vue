<template>
  <div>
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
import Auth0Lock from "auth0-lock";
import axios from "axios";

export default {
  name: "App",
  components: {
    AudioPlayer,
  },
  data() {
    var wm = new WeakMap();
    var privateStore = {};
    wm.set(privateStore, {
      appName: "example",
    });
    return {
      lock: new Auth0Lock(
        process.env.VUE_APP_CLIENT_ID,
        process.env.VUE_APP_AUTH0_DOMAIN,
        {
          auth: {
            audience: process.env.VUE_APP_AUDIENCE,
            redirect: false,
          },
        }
      ),
      wm: wm,
      privateStore: privateStore,
    };
  },
  mounted() {
    // Listening for the authenticated event
    this.lock.show();
    this.lock.on(
      "authenticated",
      function (authResult) {
        // Use the token in authResult to getUserInfo() and save it if necessary
        this.lock.getUserInfo(
          authResult.accessToken,
          function (error, profile) {
            if (error) {
              // Handle error
              return;
            }

            //we recommend not storing Access Tokens unless absolutely necessary
            this.wm.set(this.privateStore, {
              accessToken: authResult.accessToken,
            });

            this.wm.set(this.privateStore, {
              profile: profile,
            });
          }.bind(this)
        );
        const url = `${process.env.VUE_APP_BACKEND_URL}/scripts/`;
        return axios
          .get(url, {
            headers: { Authorization: `Bearer ${authResult.accessToken}` },
          })
          .then((response) => {
            console.log(response.data);
          });
      }.bind(this)
    );
  },
};
</script>