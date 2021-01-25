const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
})
let myVideoStream;
var senders;
var currentPeer;



const myVideo = document.createElement('video')
myVideo.muted = true;
var peers = []
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  
  myPeer.on('calls', call => {
    console.log(test)
    currentPeer=call.peerConnection
    console.log(currentPeer)
    call.answer(stream)
 
    const video = document.createElement('video')
    call.on('stream', function(userVideoStream)  {
     if(!peers.includes(call.peer)){
      addVideoStream(video, userVideoStream)
      console.log("test")
      currentPeer=call.peerConnection
      peers.push(call.peer)
     }
     
      
     
    })
    
  })
  



  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
  // input value
  let text = $("input");
  // when press enter send message
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      text.val('')
    }
  });
  socket.on("createMessage", message => {
    $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
    scrollToBottom()
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    call = myPeer.call(userId, stream)
    currentPeer=call.peerConnection
    console.log(currentPeer)
    call.answer(stream)
 
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    if(!peers.includes(call.peer)){
      addVideoStream(video, userVideoStream)
      console.log("test")
      currentPeer=call.peerConnection
      peers.push(call.peer)
     }
    
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}
console.log(peers)

const shareScreen=()=> {
  navigator.mediaDevices.getDisplayMedia({
    video:{
      cursor: "always" 
    },
    audio:{
      echoCancellation:true,
      noiseSupression:true
    }
  }).then(stream => {

  
    const screenTrack = stream.getVideoTracks()[0];
     console.log(myVideoStream.getVideoTracks()[0])
    
     myVideoStream=stream
     console.log(myVideoStream.getVideoTracks()[0])
    
   

      screenTrack.onended = function() {
      }
  
  }) .catch((err)=>{
    console.log(err)
  })
}

const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}
