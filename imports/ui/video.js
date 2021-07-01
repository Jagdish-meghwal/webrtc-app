import './video.html'
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

var _audioTrack;
var _videoTrack = null;
var _mediaRecorder;
var _recordedChunks = [];

Template.video.onCreated(function videoOnCreated() {
  // counter starts at 0
  //this.counter = new ReactiveVar(0);
   startwithAudio();
});

Template.video.helpers({
/*   counter() {
    return Template.instance().counter.get();
  }, */
});

function setupMediaRecorder() {

  var stream = new MediaStream([_audioTrack]);

  
  if (_videoTrack && _videoTrack.readyState === "live") {
      stream.addTrack(_videoTrack);
  }

  stream.getTracks().forEach(track => {
      console.log('get track '+track);
  })

  _recordedChunks = [];
  _mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8,opus' });
  _mediaRecorder.ondataavailable = (e) => {
      console.log(e.data.size);
      if(e.data.size > 0)
          _recordedChunks.push(e.data);
  };
  _mediaRecorder.onstart = async () => {
    console.log('----media reacoder state---'+_mediaRecorder.state)
      console.log('onstart');
      $("#btnStartReco").hide();
      $("#btnPauseReco").show();
      $("#btnStopReco").show();
      $("#downloadRecording").hide();
  };
  _mediaRecorder.onpause = async () => {
    console.log('onpause');
      $("#btnPauseReco").hide();
      $("#btnResumeReco").show();
  };
  _mediaRecorder.onresume = async () => {
    console.log('onresume');
      $("#btnResumeReco").hide();
      $("#btnPauseReco").show();
      $("#btnStopReco").show();
  };

  _mediaRecorder.onstop = async () => {
      console.log('onstop');
      var blob = new Blob(_recordedChunks, { type: 'video/webm' });
      let url = window.URL.createObjectURL(blob);

      var videoRecPlayer = document.getElementById('videoCtrRec');
      videoRecPlayer.srcObject = null;
      videoRecPlayer.load();
      videoRecPlayer.src = url;
      videoRecPlayer.play();
      $(videoRecPlayer).show();

      $("#downloadRecording").attr({ href: url, download: 'video.webm' }).show();

      $("#btnStartReco").show();
      $("#btnPauseReco").hide();
      $("#btnStopReco").hide();
      //var download = document.getElementById('downloadRecording');
      //download.href = url;
      //download.download = 'test.weba';
      //download.style.display = 'block';


  };

}
async function startwithAudio() {
        
  try {
      var astream = await navigator.mediaDevices.getUserMedia({  audio: true });

      _audioTrack = astream.getAudioTracks()[0];


     console.log('----- audio track start '+ _audioTrack);


      _audioTrack.onmute = function (e) {
        console.log('--------------mute')
          console.log(e);
      }
      _audioTrack.onunmute = function (e) {
        console.log('--------------unmute')
          console.log(e);
      }
      
      _audioTrack.enabled = false;

  } catch (e) {
      console.log('error ----'+e);
      return;
  }        
}

Template.video.events({

  "click #btnMuteUnmute"(event, instance){
    if (!_audioTrack) return;

    if (_audioTrack.enabled == false) {
        _audioTrack.enabled = true;
        $('#btnMuteUnmute').text("Mute");
    }
    else {
        _audioTrack.enabled = false;
        $('#btnMuteUnmute').text("Unmute");
    } 
    console.log('---------'+_audioTrack);
  },
  "click #btnStartReco"(event, instance){
    setupMediaRecorder();
    _mediaRecorder.start(1000);
  },
  "click #btnPauseReco"(event, instance){
    _mediaRecorder.pause();
  },
  "click #btnResumeReco"(event, instance){
    _mediaRecorder.resume();
  },
  "click #btnStopReco"(event, instance){
    _mediaRecorder.stop();
  },
  "click #btnStartStopCam":async function (event, instance){
     
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
  }
  }
  
});
