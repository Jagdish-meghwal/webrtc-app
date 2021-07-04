import './receiver1.html'


var HOST = location.origin.replace(/^http/, 'ws')
const webSocket = new WebSocket(HOST)

//const webSocket = new WebSocket("ws://127.0.0.1:4000")

let localStream
let peerConn
let username
let isAudio = true
let isVideo = true
var _remoteStream = new MediaStream();

webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data) {
    switch (data.type) {
        case "offer":
            peerConn.setRemoteDescription(data.offer)
            createAndSendAnswer()
            break
        case "candidate":
            peerConn.addIceCandidate(data.candidate)
    }
}

function createAndSendAnswer () {
    peerConn.createAnswer((answer) => {
        peerConn.setLocalDescription(answer)
        sendData({
            type: "send_answer",
            answer: answer
        })
    }, error => {
        console.log(error)
    })
}

function sendData(data) {
    data.username = username
    webSocket.send(JSON.stringify(data))
}




async function joinCall() {
    username = document.getElementById("username-input").value
    document.getElementById("video-call-div")
    .style.display = "inline"

    try{
    var stream = await navigator.mediaDevices.getUserMedia(
        {
            video:true,
            audio: true
        }
    )
    localStream = stream;
    console.log(localStream);
    document.getElementById("local-video").srcObject = localStream;

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

     peerConn.ontrack = (event) => {
       /*  document.getElementById("remote-video")
        .srcObject = e.stream */

        if(!_remoteStream)
          _remoteStream = new MediaStream();
        
          if (event.track.kind == 'video') {
            _remoteStream.getVideoTracks().forEach(t => _remoteStream.removeTrack(t));
        }

        _remoteStream.addTrack(event.track);

        _remoteStream.getTracks().forEach(t => console.log(t));

        var newVideoElement =document.getElementById("remote-video");


        newVideoElement.srcObject = null;
        newVideoElement.srcObject = _remoteStream;
        newVideoElement.load();
    } 

    peerConn.onicecandidate = ((e) => {
        if (e.candidate == null)
            return
        
        sendData({
            type: "send_candidate",
            candidate: e.candidate
        })
    })

    sendData({
        type: "join_call"
    })
}
catch(error){
    console.log(error);
}

}

function muteAudio() {
    isAudio = !isAudio
    localStream.getAudioTracks()[0].enabled = isAudio

    if(isAudio){
        $('#muteAudio').text("Mute audio");
    }
    else{
        $('#muteAudio').text("Unmute audio");
    }
}

function muteVideo() {
    isVideo = !isVideo
    localStream.getVideoTracks()[0].enabled = isVideo

    if(isVideo){
        $('#muteVideo').text("Mute Video");
    }
    else{
        $('#muteVideo').text("Unmute Video");
    }
}


Template.receiver1.events({

    "click #joinCall"(event, instance){
        joinCall();
     },
     "click #muteAudio"(event, instance){
        muteAudio();
     },
     "click #muteVideo"(event, instance){
        muteVideo();
     },
    
  });