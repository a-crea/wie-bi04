/*
var db = firebase.firestore();
var profUid;
var profUidSelected = null;
var students = {};
var students;
var professors = {};
var notSaved = true;
$(function () {
    $("#professors-list").change(function () {
            profUidSelected = $("#professors-list option:selected").val();
            $("#students-list-assigned").html("");
            getListStudentsAlreadyAssignedForSelectedProfLocal();
    });
});
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        profUid = user.uid;
        var docRef = db.collection("teaching").doc(profUid);
        docRef.get().then(function (doc) {
            if (!doc.exists) {
                let url = window.location.origin;
                window.location.replace(url + "/index.html");
            }
            else {
                getListProfs();
            }
        })
    } else {
        console.log("user not logged in");
        let url = window.location.origin;
        window.location.replace(url + "/index.html");
    }
});
function getListProfs() {
    let selectProf = $("#professors-list");
    db.collection("users").where("role", "==", "professor")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                if (profUidSelected == null) {
                    profUidSelected = doc.id;
                }
                professors[doc.id] = {
                    name: doc.data().name,
                    email: doc.data().email
                }
                selectProf.append('<option value="' + doc.id + '">' + doc.data().name + ' - ' + doc.data().email + '</option>');
            });
            getListStudents();
            getListStudentsAlreadyAssignedForSelectedProf();
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });

}

function getListStudents() {
    $("#students-container").show();
    let selectStudents = $("#students-list");
    db.collection("users").where("role", "==", "student")
        .get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                selectStudents.append('<option onclick=addStudent("' + doc.id + '") id="' + doc.id + '">' + doc.data().name + ' - ' + doc.data().email + '</option>');
                let id = doc.id;
                let name = doc.data().name;
                let email = doc.data().email;
                students[id] = {
                    id: id,
                    name: name,
                    email: email,
                    toSave: false,
                    assignedTo: null
                };
            });
            getListStudentsAlreadyAssigned();
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
}
function getListStudentsAlreadyAssigned() {
    let arr;
    db.collection("teaching").get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                if (doc.data().students) {
                    let idProf = doc.id;
                    arr = doc.data().students;
                    arr.forEach(id => {
                        students[id].assignedTo = idProf;
                    });
                }
            });
            disableAlreadyAssigned();
        });
}
function getListStudentsAlreadyAssignedForSelectedProf() {
    let studentsAlreadyAssigned = $("#students-list-assigned");
    studentsAlreadyAssigned.html("")
    db.collection("teaching").doc(profUidSelected).get().then(function (doc) {
        if (Object.keys(doc.data()).length === 0 && doc.data().constructor === Object) {
        } else {
            let data = doc.data().students;
            data.forEach(idStud => {
                studentsAlreadyAssigned.append('<p id="' + idStud + '">' + students[idStud].name + ' - ' + students[idStud].email + '<button class="btn btn-danger" onclick=deleteStudent("' + idStud + '")>Delete</button></p>');
                $("#students-list>#" + idStud).attr('disabled', 'disabled');
                students[idStud].toSave = true;
                students[idStud].assignedTo = profUidSelected;
            });
        }
    })
}
function getListStudentsAlreadyAssignedForSelectedProfLocal() {
    let studentsAlreadyAssigned = $("#students-list-assigned");
    studentsAlreadyAssigned.html("")
    Object.keys(students).forEach(function (id) {
        if (students[id].assignedTo == profUidSelected) {
            studentsAlreadyAssigned.append('<p id="' + id + '">' + students[id].name + ' - ' + students[id].email + '<button class="btn btn-danger" onclick=deleteStudent("' + id + '")>Delete</button></p>');
            $("#students-list>#" + id).attr('disabled', 'disabled');
            students[id].toSave = true;
            students[id].assignedTo = profUidSelected;
        }
    });
}

function addStudent(idStud) {
    let val;
    let option = $("#students-list>#" + idStud);
    let studentsSelected = $("#students-list-assigned");
    option.attr('disabled', 'disabled');
    studentsSelected.append('<p id="' + idStud + '">' + students[idStud].name + ' - ' + students[idStud].email + '<button class="btn btn-danger" onclick=deleteStudent("' + idStud + '")>Delete</button></p>');
    students[idStud].toSave = true;
    students[idStud].assignedTo = profUidSelected;
    val = students[idStud].name + " - " + students[idStud].email;
    val += " - Prof " + professors[profUidSelected].name;
    $("#students-list>#" + idStud).text(val);
}
function deleteStudent(idStud) {
    let option = $("#students-list>#" + idStud);
    $("#students-list-assigned>#" + idStud).remove();
    option.removeAttr('disabled');
    option.text(students[idStud].name + " - " + students[idStud].email);
    students[idStud].toSave = false;
    students[idStud].assignedTo = null;
}

function disableAlreadyAssigned() {
    let idProf;
    Object.keys(students).forEach(function (id) {
        if (students[id].assignedTo) {
            idProf = students[id].assignedTo;
            $("#students-list>#" + id).attr('disabled', 'disabled');
            val = students[id].name + " - " + students[id].email;
            val += " - Prof " + professors[idProf].name;
            $("#students-list>#" + id).text(val);
        }
    });
}

function save() {
    $("#save-button").hide();
    $("#saving-button").show();

    let tempStud = Object.assign({}, students);;
    let selectedStudentsToSave = [];
    let errorFound = false;
    let studentsUpdated = false;
    Object.keys(professors).forEach(function (keyProf) {
        Object.keys(students).forEach(function (keyStud) {
            if (studentsUpdated==false){
                db.collection("users").doc(keyStud).set({
                    professor: students[keyStud].assignedTo,
                }, { merge: true }).then(() => {

                }).catch((error) => {
                    errorFound = true;
                    console.log(error);
                });
            }
            if (students[keyStud].assignedTo == keyProf) {
                selectedStudentsToSave.push(keyStud);
                delete students[keyStud];
            }
        });
            db.collection("teaching").doc(keyProf).set({
                students: selectedStudentsToSave
            }).then(() => {

            }).catch((error) => {
                errorFound = true;
                console.log(error);
            });
        selectedStudentsToSave = [];
        studentsUpdated = true;
     
    });
    if (errorFound === false) {
        launchModal("Success", "Students correctly assigned!");
    } else {
        launchModal("Error", "An error occured. Please try again.");
    }
    errorFound = false;
    $("#save-button").show();
    $("#saving-button").hide();
    students = tempStud;
    disableAlreadyAssigned();
}

function launchModal(label, body) {
    $('#modal-label').html(label);
    $('#modal-body').html(body);
    $('#modal-message').modal('toggle');
} 
*/