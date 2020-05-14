/*
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
var profUid;
var profUidSelected = null;
var students = {};
var studentsOld;
var professors = {};
$(function () {
    $("#professors-list").change(function () {
        profUidSelected = $("#professors-list option:selected").val();
        console.log("here")
        $("#students-list-selected").html("");
        $("#sstudents-list-already-assigned").html("");
        // console.log($("#professors-list option:selected").val());
        // Object.keys(students).forEach(function (key) {
        //   students[key].toSave = false;
        // });
        disableAlreadyAssigned();
        if (profUidSelected != null) {
            getListStudentsAlreadyAssignedForSelectedProf()
        };
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
            studentsOld = students;
            getListStudentsAlreadyAssigned();
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
}
function getListStudentsAlreadyAssigned() {
    let data = [];
    let arr, val;
    db.collection("teaching").get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                if (doc.data().students) {
                    let idProf = doc.id;
                    arr = doc.data().students;
                    arr.forEach(id => {
                        studentsOld[id].assignedTo = idProf;
                    });
                }
            });
            disableAlreadyAssigned();
        });
}
function getListStudentsAlreadyAssignedForSelectedProf() {
    let studentsAlreadyAssignedContainer = $("#students-already-assigned-container");
    let studentsAlreadyAssigned = $("#students-list-already-assigned");
    studentsAlreadyAssigned.html("")
    db.collection("teaching").doc(profUidSelected).get().then(function (doc) {
        if (Object.keys(doc.data()).length === 0 && doc.data().constructor === Object) {
            studentsAlreadyAssignedContainer.hide();
        } else {
            let data = doc.data().students;
            studentsAlreadyAssignedContainer.show();
            data.forEach(idStud => {
                console.log(idStud)
                studentsAlreadyAssigned.append('<p id="' + idStud + '">' + students[idStud].name + ' - ' + students[idStud].email + '<button class="btn btn-danger" onclick=deleteStudent("old","' + idStud + '")>Delete</button></p>');
                $("#students-list>#" + idStud).attr('disabled', 'disabled');
                students[idStud].toSave = true;
                students[idStud].assignedTo = profUidSelected;
            });
        }
    })
}
function addStudent(idStud) {
    let option = $("#students-list>#" + idStud);
    let studentsSelected = $("#students-list-selected");
    option.attr('disabled', 'disabled');
    studentsSelected.append('<p id="' + idStud + '">' + students[idStud].name + ' - ' + students[idStud].email + '<button class="btn btn-danger" onclick=deleteStudent("now","' + idStud + '")>Delete</button></p>');
    students[idStud].toSave = true;
    students[idStud].assignedTo = profUidSelected;
}
function deleteStudent(from, idStud) {
    let option = $("#students-list>#" + idStud);
    if (from == "now") {
        console.log("NOW " + idStud);
        $("#students-list-selected>#" + idStud).remove();
    } else {
        console.log("GIA " + idStud);
        $("#students-list-already-assigned>#" + idStud).remove();
    }
    option.removeAttr('disabled');
    let val = option.text();
    let index = val.lastIndexOf("Prof")
    val = val.slice(0, index - 2)
    option.text(val);
    students[idStud].toSave = false;
    students[idStud].assignedTo = null;
}

function clearSelected() {
    students = studentsOld;
}
function disableAlreadyAssigned() {
    let idProf, index;
    console.log(studentsOld)
    Object.keys(studentsOld).forEach(function (id) {
        if (studentsOld[id].assignedTo) {
            idProf = studentsOld[id].assignedTo;
            $("#students-list>#" + id).attr('disabled', 'disabled');
            val = $("#students-list>#" + id).text();
            index = val.lastIndexOf("Prof")
            val = val.slice(0, index - 2)
            val += " - Prof " + professors[idProf].name;
            $("#students-list>#" + id).text(val);
        }
    });

}

function save() {
    $("#save-button").hide();
    $("#saving-button").show();

    let tempStud = students;
    let selectedStudentsToSave = [];
    let errorFound = false;
    let updates;
    Object.keys(professors).forEach(function (keyProf) {
        Object.keys(students).forEach(function (keyStud) {
            if (students[keyStud].assignedTo == keyProf) {
                selectedStudentsToSave.push(keyStud);
                delete students[keyStud];
            }
        });
        if (selectedStudentsToSave.length > 0) {
            db.collection("teaching").doc(keyProf).set({
                students: selectedStudentsToSave
            }).then(() => {

            }).catch((error) => {
                errorFound = true;
                console.log(error);
            });
        }
        selectedStudentsToSave = [];

    });
    if (errorFound === false) {
        launchModal("Success", "Students correctly assigned!");
    } else {
        launchModal("Error", "An error occured. Please try again.");
    }
    errorFound = false;
    $("#save-button").show();
    $("#saving-button").hide();
    studentsOld = students;

    disableAlreadyAssigned();
}

function launchModal(label, body) {
    $('#modal-label').html(label);
    $('#modal-body').html(body);
    $('#modal-message').modal('toggle');
} 

*/