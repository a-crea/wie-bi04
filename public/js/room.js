$(function () {
    var db = firebase.firestore();
    var realTimeDb = firebase.database();
    var idRoom = null;
    var uid = null;
    var prof = null;
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            uid = user.uid;
            var docRef = db.collection("users").doc(uid);
            docRef.get().then(function (doc) {
                if (doc.exists && doc.data().role == "student" && doc.data().professor) {
                    prof = doc.data().professor;
                    connectToRTDB();
                    // $("#professor-name").html(user.displayName);
                    // let alreadyInDb = null;
                    // realTimeDb.ref(prof).once('value', function (snapshot) {
                    //   // console.log(snapshot)
                    //   alreadyInDb = snapshot.val()
                    //   if (alreadyInDb && alreadyInDb.rooms) {
                    //     setRoomsCreated(alreadyInDb)
                    //     console.log(alreadyInDb)
                    //   } else {
                    //     getStudents();
                    //   }
                    // });
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

    function connectToRTDB() {
        var studentRealTime = realTimeDb.ref(prof + '/students/' + uid);
        studentRealTime.on('value', function (snapshot) {
            console.log(snapshot)
            console.log(snapshot.val())
            if (snapshot.val().room){
                connectToRoom(snapshot.val().room);
            }
        });
    }
    function signOut() {
        firebase.auth().signOut().then(function () {
            window.location.replace(url + "/index.html");
        }).catch(function (error) {
            // An error happened.
        });
    }

    window.enableAdapter = true; // enable adapter.js
    function connectToRoom(roomId){
        isRoomExists = false;
        let roomid=roomId
        connection.openOrJoin(roomid, function (isRoomExists, roomid) {
            if (!isRoomExists) {
                // showRoomURL(roomid);
            }
        });
    }
    // ......................................................
    // ..................RTCMultiConnection Code.............
    // ......................................................

    var connection = new RTCMultiConnection();

    // by default, socket.io server is assumed to be deployed on your own URL
    connection.socketURL = '/';

    // comment-out below line if you do not have your own socket.io server
    connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

    connection.socketMessageEvent = 'audio-video-file-chat-demo';

    connection.enableFileSharing = true; // by default, it is "false".

    connection.session = {
        audio: true,
        video: true,
        data: true
    };

    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    };

    // https://www.rtcmulticonnection.org/docs/iceServers/
    // use your own TURN-server here!
    connection.iceServers = [{
        'urls': [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
            'stun:stun.l.google.com:19302?transport=udp',
        ]
    }];

    connection.videosContainer = document.getElementById('videos-container');
    connection.onstream = function (event) {
        event.mediaElement.removeAttribute('src');
        event.mediaElement.removeAttribute('srcObject');
        var video = document.createElement('video');
        video.classList.add("js-player");
        video.setAttribute("id", uid);
        video.controls = true;
        if (event.type === 'local') {
            video.muted = true;
        }
        video.srcObject = event.stream;
        
        connection.videosContainer.append(video);
    
        setTimeout(function () {
            video.play();
        }, 5000);

        // mediaElement.id = event.streamid;
    };
});