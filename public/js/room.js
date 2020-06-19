
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
                            $("#back-prof").css("display", "flex");
                            $("#room-waiting").css("display", "none");
                            $(".room-active").css("display", "initial");
                            $(".row.room-active").css("display", "flex");
                            $("#request-time-container").css("display", "none");
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
            document.getElementById("back-prof").addEventListener("click", goBack);
            document.getElementById("open-chat").addEventListener("click", toggleChat);
            document.getElementById("close-chat").addEventListener("click", toggleChat);
            $(".fa-video").parent().on("click", toggleLocalVideo);
            $(".fa-microphone").parent().on("click", toggleLocalMic);
            $(".fa-question-circle").parent().on("click", askForHelp);

            function goBack(){
                let url = window.location.origin;
                window.location.replace(url + "/professor.html");
            }

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
                });
                var helpRT = realTimeDb.ref(prof + '/rooms/' + idRoom + '/needsHelp');
                helpRT.on('value', function (snapshot) {
                    console.log("help, disable button if true")
                });
            }

            function requireMoreTime() {
                let timeRequested = $("#more-time-select").val();
                timeRequested = parseInt(timeRequested, 10);
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
                if ($("#chat-disclaimer").length > 0) {
                    $("#chat-disclaimer").remove();
                }
                $("input").val("");
                $(".chat-container").append('<div class="message-container me"><div class="chat-message-me"><span>' + name + '</span>' + msg + '</div></div>');
                scrollChat();
                connection.send(msg);
            }
            function isWaiting() {
                if ($('#videos-remote-container > *').length == 1 || Object.keys(peersInfo).length == 0) {
                    $("#video-placeholder").css("display", "flex");
                }
            }
            window.enableAdapter = true;
            function connectToRoom() {
                connection.extra = {
                    name: name,
                    isProf: isProf,
                    mutedVideo: false,
                    mutedAudio: false
                };
                connection.join(idRoom, function (isJoined, roomid, error) {
                    if (isJoined === false) {
                        connection.openOrJoin(idRoom, function (isRoomCreated, roomid, error) {
                            if (error) {
                                connectToRoom()
                            }
                        });
                    }
                    else {
                    }
                });
            }

            var connection = new RTCMultiConnection();

            // by default, socket.io server is assumed to be deployed on your own URL
            // connection.socketURL = '/';

            // comment-out below line if you do not have your own socket.io server
            connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
            // connection.socketURL = 'https://webrtcweb.com:9002/';

            // connection.socketMessageEvent = 'audio-video-file-chat-demo';

            // connection.enableFileSharing = true; // by default, it is "false".

            connection.mediaConstraints = {
                video: true,
                audio: {
                    mandatory: {
                        echoCancellation: true, // disabling audio processing
                        googAutoGainControl: true,
                        googNoiseSuppression: true,
                        googHighpassFilter: true,
                        googTypingNoiseDetection: true,
                        //googAudioMirroring: true
                    },
                    optional: []
                }
            };

            if (DetectRTC.browser.name === 'Firefox') {
                connection.mediaConstraints = {
                    audio: true,
                    video: true
                };
            }

            connection.session = {
                audio: true,
                video: true,
                data: true
            };

            connection.candidates = {
                turn: true,
                stun: true,
                host: true
            };

            connection.onNewParticipant = function (participantId, userPreferences) {

                userPreferences.dontAttachStream = false; // according to situation
                userPreferences.dontGetRemoteStream = false;  // according to situation

                // below line must be included. Above all lines are optional.
                // if below line is NOT included; "join-request" will be considered rejected.
                connection.acceptParticipationRequest(participantId, userPreferences);
            };

            connection.maxParticipantsAllowed = 4;

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
                    'stun:stun3.l.google.com:19302',
                    'stun:stun4.l.google.com:19302',
                    'stun:stun.stunprotocol.org:3478',
                    'stun:stun.l.google.com:19302?transport=udp',
                    'stun:stun1.l.google.com:19302?transport=udp',
                    'stun:stun2.l.google.com:19302?transport=udp',
                    'stun:stun3.l.google.com:19302?transport=udp',
                    'stun:stun4.l.google.com:19302?transport=udp',
                ]
                // 'urls': [
                //     'stun:stun.l.google.com:19302',
                //     'stun:stun1.l.google.com:19302',
                //     'stun:stun2.l.google.com:19302',
                //     'stun:stun.l.google.com:19302?transport=udp',
                // ]
            }];

            connection.onmessage = function (event) {
                let remoteUserId = event.userid;
                let msg = event.data;
                $(".chat-container").append('<div class="message-container"><div class="chat-message"><span>' + peersInfo[remoteUserId].name + '</span>' + msg + '</div></div>')
                scrollChat()
            };
            connection.onleave = function (event) {
                let remoteUserId = event.userid;
                $('#' + remoteUserId).remove();
                delete peersInfo[remoteUserId];
                checkProfDiv()
                isWaiting();
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
                let controls = '<div id="controls'+remoteUserId+'" class="video-controls">'
                controls += '<i class="fas fa-play" style="display:none;" data-video-ref="' + remoteUserId + '"></i>'
                controls += '<i class="fas fa-pause" data-video-ref="' + remoteUserId + '"></i>'
                controls += '<i class="fas fa-volume-up" data-video-ref="' + remoteUserId +'"></i>'
                controls += '<i class="fas fa-volume-mute" style="display:none;" data-video-ref="' + remoteUserId + '"></i>'
                controls += '</div>';
                event.mediaElement.removeAttribute('src');
                event.mediaElement.removeAttribute('srcObject');
                if (event.type === 'local') {
                    connection.videosContainer = document.getElementById('video-me-ale');
                    video.volume = 0;
                    video.muted = true;
                    classVideo = 'video-local';
                    classVideoContainer = 'video-local-container';
                } else {
                    if (peersInfo[remoteUserId].isProf == true) {
                        connection.videosContainer = document.getElementById('video-professor-ale');
                        classVideo = 'video-local';
                        classVideoContainer = 'video-local-container';
                        span.classList.add('name-in-video-prof');
                    } else {
                        $("#video-placeholder").css("display", "none");
                        connection.videosContainer = document.getElementById('videos-remote-container');
                        classVideo = 'video-remote';
                        classVideoContainer = 'video-remote-container';
                        span.classList.add('name-in-video');
                    }
                    nameSpan = document.createTextNode(peersInfo[remoteUserId].name);
                    span.appendChild(nameSpan);
                    div.append(span);
                }
                video.controls = false;
                video.autoplay = true;
                video.setAttribute('playsinline', 'playsinline');
                video.allowsInlineMediaPlayback = true;
                video.classList.add(classVideo);
                video.setAttribute('id', "video"+remoteUserId);
                div.setAttribute('id', remoteUserId);
                div.classList.add(classVideoContainer);
                video.srcObject = event.stream;
                div.append(video);
                
                if ($("#" + remoteUserId).length==0){
                    connection.videosContainer.append(div);
                    if (event.type !== 'local' && peersInfo[remoteUserId].isProf != true)
                    {
                        $("#"+ remoteUserId).append(controls);
                        $("#controls" + remoteUserId + ">i.fa-play").on("click", playVideo);
                        $("#controls" + remoteUserId + ">i.fa-pause").on("click", pauseVideo);
                        $("#controls" + remoteUserId + ">i.fa-volume-up").on("click", volumeUpVideo);
                        $("#controls" + remoteUserId + ">i.fa-volume-mute").on("click", muteVideo);
                    }
                    checkProfDiv()
                    // setTimeout(function () {
                    //     video.play();
                    // }, 5000);
                }
            }

            function toggleLocalVideo(){
                let localStream = connection.attachStreams[0];
                if(connection.extra.mutedVideo == true){
                    connection.extra.mutedVideo = false;
                    localStream.unmute('video');
                } else {
                    connection.extra.mutedVideo = true;
                    localStream.mute('video');
                }
            }

            function toggleLocalMic(){
                let localStream = connection.attachStreams[0];
                if (connection.extra.mutedAudio == true) {
                    connection.extra.mutedAudio = false;
                    localStream.unmute();
                } else {
                    connection.extra.mutedAudio = true;
                    localStream.mute('audio');
                }
            }

            function askForHelp(){
                realTimeDb.ref(prof + '/rooms/' + idRoom).update({
                    needsHelp: true
                })
            }

            function playVideo(event) {
                let id = event.target.getAttribute("data-video-ref");
                let target = document.getElementById("video" + id)
                let streamByUserId = connection.streamEvents.selectFirst({ userid: id }).stream;
                if ($("#controls" + id + ">i.fa-volume-up").is(":visible")){
                    streamByUserId.unmute("audio");
                }
                target.play()
                $("#controls" + id + ">i.fa-play").toggle()
                $("#controls" + id + ">i.fa-pause").toggle()
            }
            function pauseVideo(event) {
                let id = event.target.getAttribute("data-video-ref");
                let target = document.getElementById("video" + id)
                let streamByUserId = connection.streamEvents.selectFirst({ userid: id }).stream;
                streamByUserId.mute("audio");
                target.pause()
                $("#controls" + id + ">i.fa-play").toggle()
                $("#controls" + id + ">i.fa-pause").toggle()
            }
            function volumeUpVideo() {
                let id = event.target.getAttribute("data-video-ref");
                let streamByUserId = connection.streamEvents.selectFirst({ userid: id }).stream;
                streamByUserId.mute("audio");
                $("#controls" + id + ">i.fa-volume-up").toggle()
                $("#controls" + id + ">i.fa-volume-mute").toggle()
            }
            function muteVideo() {
                let id = event.target.getAttribute("data-video-ref");
                let streamByUserId = connection.streamEvents.selectFirst({ userid: id }).stream;
                if ($("#controls" + id + ">i.fa-pause").is(":visible")) {
                    streamByUserId.unmute("audio");
                }
                $("#controls" + id + ">i.fa-volume-up").toggle()
                $("#controls" + id + ">i.fa-volume-mute").toggle()
            }

            function checkProfDiv(){
                if ($('#video-professor-ale > *').length>0) {
                    $('#video-professor-ale').css('display', 'flex');
                } else {
                    $('#video-professor-ale').css('display', 'none');
                }
            }

        } else {
            console.log("user not logged in");
            let url = window.location.origin;
            window.location.replace(url + "/index.html");
        }
    });
});