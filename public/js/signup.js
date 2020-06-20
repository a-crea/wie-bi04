(function () {
    'use strict';
    window.addEventListener('load', function () {
        var forms = document.getElementsByClassName('needs-validation');
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === true) {
                    addUser();
                }
                event.preventDefault();
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();
var db = firebase.firestore();
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        var docRef = db.collection("teaching").doc(user.uid);
        docRef.get().then(function (doc) {
            if (!doc.exists) {
                let url = window.location.origin;
                window.location.replace(url + "/index.html");
            }
        })
    } else {
        console.log("user not logged in");
        let url = window.location.origin;
        window.location.replace(url + "/index.html");
    }
});
function addUser() {
    let name = $("input[name=name]").val();
    let email = $("input[name=email]").val();
    let psw = $("input[name=password]").val();
    let role = $("input[name=role]:checked").val();
    if (name != null && email != null && psw != null && role != null) {
        $("#save-button").hide();
        $("#saving-button").show();
        let signUp = firebase.functions().httpsCallable('signUpUser');
        let send = {
            name: name,
            email: email,
            psw: psw,
            role: role
        }
        signUp(send).then((result) => {
            $("#save-button").show();
            $("#saving-button").hide();
            if (result.data.state == true) {
                launchModal("Success", "User correctly registered!");
                resetInputs();
            } else {
                launchModal("Warning", "Something went wrong, please try again.");
            }
        })
    }
    else {
        launchModal("Warning", "Please, check the values inserted.");
    }
}
function launchModal(label, body) {
    $('#modal-label').html(label);
    $('#modal-body').html(body);
    $('#modal-message').modal('toggle');
}
function resetInputs() {
    $("#signup-form").removeClass("was-validated");
    $("input[name=name]").val("");
    $("input[name=email]").val("");
    $("input[name=password]").val("");
}