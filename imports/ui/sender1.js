import './sender1.html'

const webSocket = new WebSocket("ws://127.0.0.1:5000")
var localStream
var _remoteStream = new MediaStream();
var peerConn
let username
let isAudio = true
let isVideo = true

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



async function startCall() {
    document.getElementById("video-call-div")
    .style.display = "inline"

try{
    var stream = await navigator.mediaDevices.getUserMedia({        
        video:true,
        audio: true
    });

    localStream = stream;
    document.getElementById("local-video").srcObject = localStream;
    let configuration = {
        iceServers: [
            {
                "urls": [ 
                "stun:stun1.l.google.com:19302", 
                "stun:stun2.l.google.com:19302"]
            }
        ]
    }

    peerConn = new RTCPeerConnection(configuration)
    
    peerConn.addStream(localStream)

    peerConn.ontrack = (event) => {
        console.log('on track '+event);

           if (!_remoteStream)
                _remoteStream = new MediaStream();

            if (event.streams.length > 0) {
                
                //_remoteStream = event.streams[0];
            }

            if (event.track.kind == 'video') {
                _remoteStream.getVideoTracks().forEach(t => _remoteStream.removeTrack(t));
            }

            _remoteStream.addTrack(event.track);

            _remoteStream.getTracks().forEach(t => console.log(t));

            var newVideoElement =document.getElementById("remote-video");


            newVideoElement.srcObject = null;
            newVideoElement.srcObject = _remoteStream;
            newVideoElement.load();
            //newVideoElement.play();
        };

    peerConn.onicecandidate = ((e) => {

        if (e.candidate == null)
            return
            console.log('ice candidate'+e.candidate)
        sendData({
            type: "store_candidate",
            candidate: e.candidate
        })
    })

        await createAndSendOffer();
        console.log('offer created')
        peerConn.onconnectionstatechange = function (event) {
            console.log('onconnectionstatechange', peerConn.connectionState)
            if (connection.connectionState === "connected") {
                console.log('------connected')
            }
        }


}
catch(error){
    console.log('---error---'+error);
}

}

async function createAndSendOffer() {

    try{
        var offer =await peerConn.createOffer();
        await peerConn.setLocalDescription(offer);
       
        sendData({
            type: "store_offer",
            offer: offer
        })
    }
    catch(error){
        console.log('---error in create and send offer '+error);
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

Template.sender1.events({

    "click #sendUsername"(event, instance){
        sendUsername();
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
  