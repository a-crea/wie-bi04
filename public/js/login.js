/*
var db = firebase.firestore();
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .then(function () {
                // Existing and future Auth states are now persisted in the current
                // session only. Closing the window would clear any existing state even if
                // a user forgets to sign out.
            });
        var userRef = db.collection("users").doc(user.uid);
        userRef.get().then(function (doc) {
            let url = window.location.origin;
            if (doc.data().role == "professor") {
                window.location.replace(url + "/professor.html"); //redirect regarding user type (prof or student)
            } else {
                window.location.replace(url + "/students-view.html"); //redirect regarding user type (prof or student)
            }
        });
    } else {
        console.log("user not logged in");
    }
});
function login() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function (result) {
            console.log(result);
        }).catch(function (error) {
            console.log(error);
        });
}
$(function () {
    $("input").keypress(function (event) {
        if (event.keyCode === 13) {
            $("#btn-login").click();
        }
    }); 
});
*/