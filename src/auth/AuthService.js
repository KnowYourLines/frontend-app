import auth0 from 'auth0-js'
import EventEmitter from 'eventemitter3'
import router from './../router'

export default class AuthService {
    authenticated = this.isAuthenticated()
    authNotifier = new EventEmitter()

    constructor() {
        this.login = this.login.bind(this)
        this.setSession = this.setSession.bind(this)
        this.logout = this.logout.bind(this)
        this.isAuthenticated = this.isAuthenticated.bind(this)
        this.handleAuthentication = this.handleAuthentication.bind(this)
    }

    // create an instance of auth0.WebAuth with your
    // API and Client credentials
    auth0 = new auth0.WebAuth({
        domain: process.env.VUE_APP_AUTH0_DOMAIN,
        clientID: process.env.VUE_APP_CLIENT_ID,
        redirectUri: process.env.VUE_APP_CALLBACK_URL,
        audience: process.env.VUE_APP_AUDIENCE,
        responseType: 'token id_token',
        scope: 'openid profile'
    })

    // this method calls the authorize() method
    // which triggers the Auth0 login page
    login() {
        this.auth0.authorize()
    }

    // this method calls the parseHash() method of Auth0
    // to get authentication information from the callback URL
    handleAuthentication() {
        // users returning from Auth0 (after authentication) will have params on the hash
        this.auth0.parseHash((err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                this.setSession(authResult)
                router.replace('/');
            } else if (err) {
                console.log(err)
            } else {
                // no authResult and no error? lets try silent auth
                this.silentAuth()
                    .then(() => {
                        console.log('user logged in through silent auth')
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            }
        })
    }
    silentAuth() {
        return new Promise((resolve, reject) => {
            this.auth0.checkSession({}, (err, authResult) => {
                if (err) return reject(err)
                this.setSession(authResult)
                resolve()
            })
        })
    }

    // stores the user's access_token, id_token, and a time at
    // which the access_token will expire in the local storage
    setSession(authResult) {
        this.accessToken = authResult.accessToken
        this.idToken = authResult.idToken
        this.profile = authResult.idTokenPayload
        this.expiresAt = authResult.expiresIn * 1000 + new Date().getTime()
        this.authNotifier.emit('authChange', { authenticated: true })
    }

    // remove the access and ID tokens from the
    // local storage and emits the authChange event
    logout() {
        delete this.accessToken
        delete this.idToken
        delete this.expiresAt
        this.authNotifier.emit('authChange', false)
    }

    // checks if the user is authenticated
    isAuthenticated() {
        // Check whether the current time is past the
        // access token's expiry time
        return new Date().getTime() < this.expiresAt
    }

    // a static method to get the access token
    getAuthToken() {
        return this.accessToken
    }

    // a method to get the User profile
    getUserProfile() {
        return this.profile
    }
}