/*
$(function () {
    var db = firebase.firestore();
    var realTimeDb = firebase.database();
    var name = null;
    var idRoom = null;
    var peersInfo = {};
    var uid = null;
    var prof = null;
    var roomWasActivated = false;
    var remainingTime = null;
    var endTimeGlobal = null;
    var countdown = null;
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            uid = user.uid;
            var docRef = db.collection("users").doc(uid);
            name = user.displayName
            docRef.get().then(function (doc) {
                if (doc.exists && doc.data().role == "student" && doc.data().professor) {
                    prof = doc.data().professor;
                    connectToRTDBStud();
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

    document.getElementById("btn-send").addEventListener("click", sendMessage);
    document.getElementById("request-time-btn").addEventListener("click", requireMoreTime);

    function connectToRTDBStud() {
        var studentRealTime = realTimeDb.ref(prof + '/students/' + uid);
        studentRealTime.on('value', function (snapshot) {
            if (snapshot.val().hasOwnProperty('room') && idRoom == null){
                $("#room-waiting").css("display","none");
                $(".room-active").css("display","flex");
                idRoom = snapshot.val().room
                connectToRoom();
                connectToRTDBRoom();
                roomWasActivated = true;
            } else if (!snapshot.val().hasOwnProperty('room') && roomWasActivated === true) {
                location.reload();
            }
        });
    }

    function connectToRTDBRoom(){
        var endTimeRT = realTimeDb.ref(prof + '/rooms/' + idRoom + '/endtime');
        endTimeRT.on('value', function (snapshot) {
            endTimeGlobal = new Date(snapshot.val());
            countdownInit()
        });
        var moreTimeRT = realTimeDb.ref(prof + '/rooms/' + idRoom + '/moreTime');
        moreTimeRT.on('value', function (snapshot) {
            if(snapshot.val()>0){
                $("#more-time-select").attr("disabled", true);
                $("#request-time-btn").attr("disabled", true);
            } else {
                $("#more-time-select").removeAttr("disabled");
                $("#request-time-btn").removeAttr("disabled");
            }
            // console.log("time, disable button if >0")
        });
        var helpRT = realTimeDb.ref(prof + '/rooms/' + idRoom + '/needsHelp');
        helpRT.on('value', function (snapshot) {
            console.log("help, disable button if true")
        });
    }

    function requireMoreTime(){
        let timeRequested = $("#more-time-select").val();
        timeRequested = parseInt(timeRequested, 10);
        console.log(timeRequested)
        realTimeDb.ref(prof + '/rooms/' + idRoom ).update({
            moreTime: timeRequested
        })
    }

    function countdownInit() {
        fetch('https://worldtimeapi.org/api/timezone/Europe/Rome')
            .then(function (response) {
                return response.text();
            }).then(function (data) {
                if (data != 'null') {
                    $("#countdown-container").css("display", "inline-block");
                    let time = new Date(JSON.parse(data).utc_datetime);
                    countdown = setInterval(function () {
                        remainingTime = Date.parse(endTimeGlobal) - Date.parse(time);
                        let m = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
                        let s = Math.floor((remainingTime % (1000 * 60)) / 1000);
                        time.setSeconds(time.getSeconds() + 1);
                        if (s.toString().length == 1) {
                            s = "0" + s;
                        }
                        $("#time").html(m + ":" + s)
                        if (remainingTime < 0) {
                            $("#time").html("FINISHED");
                            location.reload();
                        }
                    }, 1000);
                }
            }).catch(function (err) {
                console.log('ERRORE ', err);
            })
    }

    function signOut() {
        firebase.auth().signOut().then(function () {
            window.location.replace(url + "/index.html");
        }).catch(function (error) {
            // An error happened.
        });
    }
    $(".chat-input").keypress(function (event) {
        if (event.keyCode === 13 && $(".chat-input").val().length > 0) {
            sendMessage()
        }
    });
    $(".chat-input").keyup(function (event) {
        if ($(".chat-input").val().length > 0) {
            $("#btn-send").removeAttr("disabled");
        } else {
            $("#btn-send").attr("disabled", true);
        }
    });
    // $(".chat-input").change(function () {
    //     if ($(".chat-input").val().length > 0){
    //         $("#btn-send").removeAttr("disabled");
    //     } else {
    //         $("#btn-send").attr("disabled", true);
    //     }
    // });
    function sendMessage(){
        let msg = $("input").val();
        $("input").val("");
        $(".chat-container").append('<div class="message-container me"><div class="chat-message-me"><span>'+name+'</span>'+msg+'</div></div>')
        connection.send(msg)
    }
    function isWaiting(){
        if (Object.keys(peersInfo).length == 0) {
            $("#video-placeholder").css("display", "flex");
        }
    }
    window.enableAdapter = true;
    function connectToRoom(){
        isRoomExists = false;
        connection.openOrJoin(idRoom, function (isRoomExists, roomid) {
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

    connection.onopen = function (event) {
        let remoteUserId = event.userid;
        peersInfo[remoteUserId] = {}
        connection.send(name);
    };

    connection.onmessage = function (event) {
        let remoteUserId = event.userid;
        if (peersInfo[remoteUserId].hasOwnProperty('name')) {
            // do something
            let msg = event.data;
            $(".chat-container").append('<div class="message-container"><div class="chat-message"><span>' + peersInfo[remoteUserId].name + '</span>' + msg + '</div></div>')
        } else {
            let remoteName = event.data;
            peersInfo[remoteUserId] = {
                name: remoteName
            }
        }
    };
    connection.onleave = function (event) {
        let remoteUserId = event.userid;
        $('#' + remoteUserId).remove();
        delete peersInfo[remoteUserId];
        isWaiting();
        //check how many divs in container, if 0 show video placeholder
    };
    connection.onclose = function (event) {
        let remoteUserId = event.userid;
        $('#' + remoteUserId).remove();
        delete peersInfo[remoteUserId];
        isWaiting();
    };
    connection.onstream = function (event) {
        console.log(peersInfo);
        let remoteUserId = event.userid;
        let classVideo, classVideoContainer;
        let video = document.createElement('video');
        let div = document.createElement('div');
        let span = document.createElement('span');
        let nameSpan;
        event.mediaElement.removeAttribute('src');
        event.mediaElement.removeAttribute('srcObject');
        if (event.type === 'local') {
            connection.videosContainer = document.getElementById('video-me-ale');
            video.volume = 0;
            video.muted = true;
            classVideo = 'video-local';
            classVideoContainer = 'video-local-container';
        } else {
            $("#video-placeholder").css("display","none");
            connection.videosContainer = document.getElementById('videos-remote-container');
            classVideo = 'video-remote';
            classVideoContainer = 'video-remote-container';
            nameSpan = document.createTextNode(peersInfo[remoteUserId].name);
            span.appendChild(nameSpan);
            div.append(span);
        }
        span.classList.add('name-in-video');
        video.controls = true;
        video.classList.add(classVideo);
        div.setAttribute('id', remoteUserId);
        div.classList.add(classVideoContainer);
        video.srcObject = event.stream;
        div.append(video);
        connection.videosContainer.append(div);
    
        setTimeout(function () {
            video.play();
        }, 5000);

        // mediaElement.id = event.streamid;
    };
});
*/