import firebase from 'firebase/app'

import 'firebase/auth'
import 'firebase/database'
import 'firebase/firestore'

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
