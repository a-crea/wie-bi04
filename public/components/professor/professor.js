$(function () {
    var db = firebase.firestore();
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            var docRef = db.collection("teaching").doc(user.uid);
            docRef.get().then(function (doc) {
                if (doc.exists) {
                    $("#professor-name").html(user.displayName);
                } else {
                    let url = window.location.origin;
                    window.location.replace(url + "/index.html");
                }
            }).catch(function (error) {
                console.log("Error getting document:", error);
            });
        } else {
            console.log("user not logged in");
            let url = window.location.origin;
            window.location.replace(url + "/index.html");
        }
    });
    function matchRandomly() {
        let url = window.location.href;
        let lastSlash = url.lastIndexOf('/');
        let basePath = url.slice(0, lastSlash + 1)
        window.location.replace(basePath + "users-randomly.html")
    }
    function matchManually() {
        $("#main-container").load("components/professor/match-manually.html");
    }
});

