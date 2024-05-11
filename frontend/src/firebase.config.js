import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyC7rJfX4j27UYIleA8k_5kCum73-xI-B8Y",
    authDomain: "ethba-ddff3.firebaseapp.com",
    projectId: "ethba-ddff3",
    storageBucket: "ethba-ddff3.appspot.com",
    messagingSenderId: "828206962127",
    appId: "1:828206962127:web:acbd3b8fc9bd7e4f036eba",
    measurementId: "G-M7Y59ZHT6Z"
  };

  
let app;
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

const db = app.firestore();
const auth = firebase.auth();

export { db, auth };
