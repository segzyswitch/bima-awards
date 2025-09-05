// plugins/firebase.ts
import { defineNuxtPlugin } from '#app'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

export default defineNuxtPlugin(() => {
  const firebaseConfig = {
		apiKey: "AIzaSyAiu3cEZCMSWGzWvKOFHKuf1NP9r66zKOQ",
		authDomain: "bima-awards.firebaseapp.com",
		projectId: "bima-awards",
		storageBucket: "bima-awards.firebasestorage.app",
		messagingSenderId: "826809161484",
		appId: "1:826809161484:web:7afe36a302c48365fa1b29",
		measurementId: "G-LE2PEM88RR"
  }

  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)
  const auth = getAuth(app)

  return {
    provide: {
      db,
      auth
    }
  }
})
