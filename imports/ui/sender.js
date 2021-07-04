import './sender.html'

const webSocket = new WebSocket("ws://127.0.0.1:5000")

webSocket.onmessage = (event) => {

    handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data) {
    switch (data.type) {
        case "answer":
            peerConn.setRemoteDescription(data.answer)
            break
        case "candidate":
            peerConn.addIceCandidate(data.candidate)
    }
}

let username
function sendUsername() {

    username = document.getElementById("username-input").value
    sendData({
        type: "store_user"
    })
}

function sendData(data) {
    data.username = username
    webSocket.send(JSON.stringify(data))
}


let localStream
let peerConn
function startCall() {
    document.getElementById("video-call-div")
    .style.display = "inline"

    navigator.mediaDevices.getUserMedia({
        video: {
            frameRate: 24,
            width: {
                min: 480, ideal: 720, max: 1280
            },
            aspectRatio: 1.33333
        },
        audio: true
    }, (stream) => {
        console.log('----------'+stream);
        localStream = stream
        document.getElementById("local-video").srcObject = localStream

        let configuration = {
            iceServers: [
                {
                    "urls": ["stun:stun.l.google.com:19302", 
                    "stun:stun1.l.google.com:19302", 
                    "stun:stun2.l.google.com:19302"]
                }
            ]
        }

        peerConn = new RTCPeerConnection(configuration)
        peerConn.addStream(localStream)

        peerConn.onaddstream = (e) => {
            document.getElementById("remote-video")
            .srcObject = e.stream
        }

        peerConn.onicecandidate = ((e) => {
            if (e.candidate == null)
                return
            sendData({
                type: "store_candidate",
                candidate: e.candidate
            })
        })

        createAndSendOffer()
    }, (error) => {
        console.log('----'+error)
    }
    )
}

function createAndSendOffer() {
    peerConn.createOffer((offer) => {
        sendData({
            type: "store_offer",
            offer: offer
        })

        peerConn.setLocalDescription(offer)
    }, (error) => {
        console.log(error)
    })
}

let isAudio = true
function muteAudio() {
    isAudio = !isAudio
    localStream.getAudioTracks()[0].enabled = isAudio
}

let isVideo = true
function muteVideo() {
    isVideo = !isVideo
    localStream.getVideoTracks()[0].enabled = isVideo
/* 
    if (_videoTrack) {
        _videoTrack.stop();
        _videoTrack = null;
        document.getElementById('videoCtr').srcObject = null;
        $("#btnStartStopCam").text("Start Camera");
        return;
    }
    try {
        var vstream = await navigator.mediaDevices.getUserMedia({ video: true,audio:true });
        console.log('----video stream ---'+vstream);
        if (vstream && vstream.getVideoTracks().length > 0) {
            _videoTrack = vstream.getVideoTracks()[0];
            console.log('----video track ---'+_videoTrack);
            document.getElementById('videoCtr').srcObject = new MediaStream([_videoTrack]);  
            console.log(_videoTrack.readyState )  
            $("#btnStartStopCam").text("Stop Camera");
        }
    } catch (e) {
        console.log(e);
        return;
    } */
}

Template.sender.events({

    "click #sendUsername"(event, instance){
        sendUsername();
    },
    "click #sendData"(event, instance){
       sendData();
    },
    "click #startCall"(event, instance){
        startCall();
     },
     "click #muteAudio"(event, instance){
        muteAudio();
     },
     "click #muteVideo"(event, instance){
        muteVideo();
     },
    
  });
  