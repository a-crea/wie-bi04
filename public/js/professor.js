$(function () {
    $("#students-list").html("");
    $("#main-container").load("components/professor/main.html");
});

/*
var studentsInfo = {};
var groups = [];
var db = firebase.firestore();
var realTimeDb = firebase.database();
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        var docRef = db.collection("teaching").doc(user.uid);
        docRef.get().then(function (doc) {
            if (doc.exists) {
                $("#professor-name").html(user.displayName);
                getStudents(doc);
                // createRealTimeDb(user.uid);
                // REFER TO REALTIMEDB.JSON
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
function createRealTimeDb(id) {
    realTimeDb.ref(id).set({
        time: 00
    });
}
function getStudents(doc) {
    let students = doc.data().students;
    let name, node;
    students.forEach(id => {
        db.collection("users").doc(id).get().then(function (user) {
            name = user.data().name;
            node = '<li class="list-group-item" onclick="addToArrGroups(\'' + id + '\')">' + name + '</li>';
            $("#students-list").append(node);
            studentsInfo[id] = {
                state: 'away',
                name: user.data().name,
                room: null
            }
            realTimeDb.ref(id).set({
                state: 'away',
                name: user.data().name,
                room: null
            });
            // realTimeDb.ref(id).set({
            //   state: 'away',
            //   name: user.data().name,
            //   room: null
            // }); PUSH SOLO QUANDO HA ANCHE IL TIMER? SALVARE TUTTO COSì STUDENT LISTEN SUL SUO ID E QUANDO C'è LA ROOM ALLORA IL PULSANTE SI PUò CLICCARE
        })
    });
    console.log(studentsInfo)
}
function addToArrGroups(id) {
    if (groups.length >= 3) {
        createGroup();
        console.log("Max Capacity");
    } else {
        groups.push(id);
    }
}
function createGroup() {
    let idRoom;
    idRoom = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    groups.forEach(id => {
        console.log("id " + id + " room " + idRoom)
        //   let updates = {};
        //   updates['/'+id+'/room'] = idRoom;
        //   // updates['/user-posts/' + uid + '/' + newPostKey] = postData;
        //  realTimeDb.ref().update(updates);PUSH SOLO QUANDO HA ANCHE IL TIMER? SALVARE TUTTO COSì STUDENT LISTEN SUL SUO ID E QUANDO C'è LA ROOM ALLORA IL PULSANTE SI PUò CLICCARE
        let updates = {};
        updates['/' + id + '/room'] = idRoom;
        // updates['/user-posts/' + uid + '/' + newPostKey] = postData;
        realTimeDb.ref().update(updates);
    });
}
function createRooms(groups) {

}

function matchRandomly() {
    let url = window.location.href;
    let lastSlash = url.lastIndexOf('/');
    let basePath = url.slice(0, lastSlash + 1)
    window.location.replace(basePath + "users-randomly.html")
}
function matchManually() {
    let url = window.location.href;
    let lastSlash = url.lastIndexOf('/');
    let basePath = url.slice(0, lastSlash + 1)
    window.location.replace(basePath + "users-manually.html")
}
*/