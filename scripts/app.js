// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC4MKEvFZtZzc7Uwz8NPL3vuL1MQKvjQK8",
    authDomain: "lexius-f29ec.firebaseapp.com",
    projectId: "lexius-f29ec",
    storageBucket: "lexius-f29ec.firebasestorage.app",
    messagingSenderId: "860036455823",
    appId: "1:860036455823:web:7c9872501048483014fffa",
    measurementId: "G-6XE1154JDL"
  };
  
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  
  const provider = new firebase.auth.GoogleAuthProvider();
  
  // Google Sign-In
  document.getElementById("googleSignInBtn").addEventListener("click", function() {
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        console.log("User signed in: ", user.displayName);
        document.getElementById("signOutBtn").style.display = "block";
        document.getElementById("editorContainer").style.display = "block";
      })
      .catch((error) => {
        console.error("Error signing in: ", error.message);
      });
  });
  
  // Listen for authentication state changes
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log("User is signed in:", user.displayName);
      document.getElementById("signOutBtn").style.display = "block";
      document.getElementById("editorContainer").style.display = "block";
    } else {
      console.log("User is signed out.");
      document.getElementById("googleSignInBtn").style.display = "block";
      document.getElementById("signOutBtn").style.display = "none";
      document.getElementById("editorContainer").style.display = "none";
    }
  });
  
  // Sign out logic
  document.getElementById("signOutBtn").addEventListener("click", function() {
    firebase.auth().signOut().then(() => {
      console.log("User signed out.");
      document.getElementById("googleSignInBtn").style.display = "block";
      document.getElementById("signOutBtn").style.display = "none";
      document.getElementById("editorContainer").style.display = "none";
    }).catch((error) => {
      console.error("Error signing out: ", error.message);
    });
  });
  