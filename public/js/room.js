/*
$(function () {
    var db = firebase.firestore();
    var realTimeDb = firebase.database();
    var name = null;
    var idRoom = null;
    var peersInfo = {};
    var uid = null;
    var prof = null;
    var isProf = false;
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
                } else if (doc.exists && doc.data().role == "professor") {
                    realTimeDb.ref(user.uid).once('value', function (snapshot) {
                        // console.log(snapshot)
                        let alreadyInDb = snapshot.val()
                        if (alreadyInDb && alreadyInDb.joining!=false) {
                            idRoom = alreadyInDb.joining
                            isProf = true
                            endTimeGlobal = alreadyInDb.endtime;
                            $("#more-time-select").attr("disabled", true);
                            $("#request-time-btn").attr("disabled", true);
                            $("#room-waiting").css("display", "none");
                            $(".room-active").css("display", "initial");
                            $(".row.room-active").css("display", "flex");
                            connectToRoom()
                            countdownInit()
                        } else {
                            let url = window.location.origin;
                            window.location.replace(url + "/index.html");
                        }
                    });
                } else {
                    let url = window.location.origin;
                    window.location.replace(url + "/index.html");
                }
            }).catch(function (error) {
                console.log("Error getting document:", error);
            });



            document.getElementById("btn-send").addEventListener("click", sendMessage);
            document.getElementById("request-time-btn").addEventListener("click", requireMoreTime);
            document.getElementById("open-chat").addEventListener("click", toggleChat);
            document.getElementById("close-chat").addEventListener("click", toggleChat);

            function connectToRTDBStud() {
                var studentRealTime = realTimeDb.ref(prof + '/students/' + uid);
                studentRealTime.on('value', function (snapshot) {
                    if (snapshot.val().hasOwnProperty('room') && idRoom == null) {
                        $("#room-waiting").css("display", "none");
                        $(".room-active").css("display", "initial");
                        $(".row.room-active").css("display", "flex");
                        idRoom = snapshot.val().room
                        connectToRoom();
                        connectToRTDBRoom();
                        roomWasActivated = true;
                    } else if (!snapshot.val().hasOwnProperty('room') && roomWasActivated === true) {
                        location.reload();
                    }
                });
            }

            function connectToRTDBRoom() {
                var endTimeRT = realTimeDb.ref(prof + '/rooms/' + idRoom + '/endtime');
                endTimeRT.on('value', function (snapshot) {
                    endTimeGlobal = new Date(snapshot.val());
                    countdownInit()
                });
                var moreTimeRT = realTimeDb.ref(prof + '/rooms/' + idRoom + '/moreTime');
                moreTimeRT.on('value', function (snapshot) {
                    if (snapshot.val() > 0) {
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

            function requireMoreTime() {
                let timeRequested = $("#more-time-select").val();
                timeRequested = parseInt(timeRequested, 10);
                console.log(timeRequested)
                realTimeDb.ref(prof + '/rooms/' + idRoom).update({
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
                                    if(isProf == true){
                                        realTimeDb.ref(uid).remove();
                                        let url = window.location.origin;
                                        window.location.replace(url + "/professor.html");
                                    } else {
                                        realTimeDb.ref(prof).remove();
                                        location.reload();
                                    }
                                }
                            }, 1000);
                        }
                    }).catch(function (err) {
                        console.log('ERRORE ', err);
                    })
            }

            function toggleChat() {
                $("#chat").toggle();
                $("#open-chat").toggle();
                $("#close-chat").toggle();
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
            function scrollChat() {
                $(".chat-container").animate({ scrollTop: $('.chat-container div:last').offset().top });
            }

            function sendMessage() {
                let msg = $("input").val();
                $("input").val("");
                $(".chat-container").append('<div class="message-container me"><div class="chat-message-me"><span>' + name + '</span>' + msg + '</div></div>');
                scrollChat();
                connection.send(msg);
            }
            function isWaiting() {
                if (Object.keys(peersInfo).length == 0 || $('#videos-remote-container > *').length == 1) {
                    $("#video-placeholder").css("display", "flex");
                }
            }
            window.enableAdapter = true;
            function connectToRoom() {
                connection.extra = {
                    name: name,
                    isProf: isProf
                };
                connection.join(idRoom, function (isJoined, roomid, error) {
                    if (isJoined === false) {
                        connection.openOrJoin(idRoom, function (isRoomCreated, roomid, error) {
                            if (error) {
                                connectToRoom()
                            }
                            if (connection.isInitiator === true) {
                                // you opened the room
                            } else {
                                // you joined it
                            }
                        });
                    }
                    else {
                    }
                });
            }

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
        
            connection.onmessage = function (event) {
                let remoteUserId = event.userid;
                let msg = event.data;
                console.log(event.data)
                console.log(event.userid)
                if (msg.hasOwnProperty('isProf')) {
                    let remoteName = event.data.name;
                    let isProf = event.data.isProf;
                    console.log(event.data)
                    peersInfo[remoteUserId] = {
                        name: remoteName,
                        isProf: isProf
                    }
                } else {
                    $(".chat-container").append('<div class="message-container"><div class="chat-message"><span>' + peersInfo[remoteUserId].name + '</span>' + msg + '</div></div>')
                    scrollChat()
                }
            };
            connection.onleave = function (event) {
                let remoteUserId = event.userid;
                $('#' + remoteUserId).remove();
                delete peersInfo[remoteUserId];
                checkProfDiv()
                isWaiting();
                //check how many divs in container, if 0 show video placeholder
            };
            connection.onclose = function (event) {
                let remoteUserId = event.userid;
                $('#' + remoteUserId).remove();
                delete peersInfo[remoteUserId];
                checkProfDiv()
                isWaiting();
            };

            connection.onstream = function (event) {
                let remoteUserId = event.userid;
                let remoteName = event.extra.name;
                let remoteRole = event.extra.isProf;
                peersInfo[remoteUserId] = {
                    name: remoteName,
                    isProf: remoteRole
                }
                let classVideo, classVideoContainer;
                let video = document.createElement('video');
                let div = document.createElement('div');
                let span = document.createElement('span');
                event.mediaElement.removeAttribute('src');
                event.mediaElement.removeAttribute('srcObject');
                if (event.type === 'local') {
                    connection.videosContainer = document.getElementById('video-me-ale');
                    video.volume = 0;
                    video.muted = true;
                    classVideo = 'video-local';
                    classVideoContainer = 'video-local-container';
                } else {
                    $("#video-placeholder").css("display", "none");
                    if (peersInfo[remoteUserId].isProf == true) {
                        connection.videosContainer = document.getElementById('video-professor-ale');
                        classVideo = 'video-local';
                        classVideoContainer = 'video-local-container';
                        span.classList.add('name-in-video-prof');
                    } else {
                        connection.videosContainer = document.getElementById('videos-remote-container');
                        classVideo = 'video-remote';
                        classVideoContainer = 'video-remote-container';
                        span.classList.add('name-in-video');
                    }
                    nameSpan = document.createTextNode(peersInfo[remoteUserId].name);
                    span.appendChild(nameSpan);
                    div.append(span);
                }
                video.controls = true;
                video.classList.add(classVideo);
                div.setAttribute('id', remoteUserId);
                div.classList.add(classVideoContainer);
                video.srcObject = event.stream;
                div.append(video);
                connection.videosContainer.append(div);
                checkProfDiv()
                setTimeout(function () {
                    video.play();
                }, 5000);
            }

            function checkProfDiv(){
                if ($('#video-professor-ale > *').length>0) {
                    $('#video-professor-ale').parent().css('display', 'flex');
                } else {
                    $('#video-professor-ale').parent().css('display', 'none');
                }
            }

        } else {
            console.log("user not logged in");
            let url = window.location.origin;
            window.location.replace(url + "/index.html");
        }
    });
});
*/