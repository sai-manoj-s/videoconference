
const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
})
var myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}


function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g,));
}
var user = getParameterByName('uname')





navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {

   socket.emit('addlist',user);

  myVideoStream = stream;
  addVideoStream(myVideo, myVideoStream)
   socket.on('userlist',(userslist)=>{
    ul =  document.getElementById('lists')

    ul.remove()
    ul = document.createElement('ul');
    ul.setAttribute("id", "lists");
    document.getElementById('plist').appendChild(ul);
    userslist.forEach(function (item) {
      console.log(item)
      let li = document.createElement('li');
      ul.appendChild(li);
  
      li.innerHTML += item;
  })
});

 

  myPeer.on('call', call => {
    call.answer(myVideoStream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    
    connectToNewUser(userId, myVideoStream)
    
    
  })

  let text = $("input");

  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message',user+" :- \n"+ text.val());
      text.val('')
    }
  });
 
  socket.on("createMessage", message => {
    var uname = message.split(":-")
    $(".messages").append(`<li class="message"><b>${uname[0]}:-<b></li>`);
    $(".messages").append(`<li class="message">&nbsp&nbsp&nbsp${uname[1]}</li>`);
    scrollToBottom()
  })
 
 
})



socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
  console.log("userdiconnected"+userId)
})

myPeer.on('open', id => {

  socket.emit('join-room', ROOM_ID, id)
  
})



function connectToNewUser(userId, stream) {
 
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
    
  })
 
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}



function addVideoStream(video, stream) {
  video.srcObject = stream
  video.requestFullscreen().then(()=>{
    console.log('full-screen')
  })
  video.addEventListener('loadedmetadata', () => {
    video.play()
    
  })
  video.addEventListener('click', () => {
    video.webkitRequestFullScreen();           
    video.style.height = screen.height;
    video.style.width = screen.width;
    video.controls=false
    
  })
  videoGrid.append(video)
}


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
    myVideoStream=stream
  console.log(myVideoStream.getVideoTracks()[0])
    const screenTrack = stream.getVideoTracks()[0];
    console.log(currentPeer.getSenders())
     let sender = currentPeer.getSenders().find(function(s){
       return s.track.kind == videoTrack.kind
     })
     console.log(sender)
   
     sender.replaceTrack(screenTrack)
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

const showChats=()=>{
  var x = document.getElementById("chats");
  //var y = document.getElementById("chats");
  if (x.style.display === "none") {
    x.style.display = "block";
 //   y.style.display="none"
  } else {
    x.style.display = "none";
    //y.style.display="block"
  }
  
  

//   $.get( '/list', function(data) {
//     console.log(data)
   
//     ul =  document.getElementById('lists')

//     ul.remove()
//     ul = document.createElement('ul');
//     ul.setAttribute("id", "lists");
//     document.getElementById('plist').appendChild(ul);
//     data.forEach(function (item) {
//       console.log(item)
//       let li = document.createElement('li');
//       ul.appendChild(li);
  
//       li.innerHTML += item;
//   });
//   });

}



  
