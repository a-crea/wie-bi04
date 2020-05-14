/*
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .then(function () {
                // Existing and future Auth states are now persisted in the current
                // session only. Closing the window would clear any existing state even if
                // a user forgets to sign out.
            });
        let url = window.location.origin;
        window.location.replace(url + "/professor.html"); //redirect regarding user type (prof or student)
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
*/