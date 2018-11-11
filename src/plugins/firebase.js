import firebase from 'firebase/app'
import firebaseui from 'firebaseui'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/firestore'

import "firebaseui/dist/firebaseui.css"

firebase.initializeApp({
  "apiKey": "AIzaSyADL2pDe43D1r7CCLYqU3Zbe5xSRqYaAn8",
  "databaseURL": "https://livebus-7dab7.firebaseio.com",
  "storageBucket": "livebus-7dab7.appspot.com",
  "authDomain": "livebus-7dab7.firebaseapp.com",
  "messagingSenderId": "595489917573",
  "projectId": "livebus-7dab7"
})

export const db = firebase.firestore()
export const auth = firebase.auth()
export default firebase

db.settings({
  timestampsInSnapshots: true
})


export const AuthUI = new firebaseui.auth.AuthUI(firebase.auth())


export function LoadAuthUI (element) {
  return new Promise((resolve, reject) => {
      const uiConfig = {
        callbacks: {
          signInSuccessWithAuthResult: (authResult, redirectUrl) => {
            resolve(authResult, redirectUrl)
            return true
          },
          signInFailure: error => {
            reject(error)
          },
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInSuccessUrl: '#',
        signInOptions: [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.PhoneAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
          firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          firebase.auth.TwitterAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: '#',
        // Privacy policy url.
        privacyPolicyUrl: '#'
      }
      AuthUI.start(element, uiConfig)
    })
}
