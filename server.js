const express = require('express')
const app = express()
// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid')
var newUsers=[];
app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/list', function(req, res){
  res.send(newUsers);
 });

app.get('/', (req, res) => {
 
  res.redirect(`/${uuidV4()}`+"?uname="+req.query.uname)
})

app.get('/:room', (req, res) => {
  newUser=req.query.uname

  
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
   
    socket.join(roomId)
    
console.log(io.sockets.server.eio.clientsCount )
    socket.to(roomId).broadcast.emit('user-connected', userId);
    // messages
    socket.on('message', (message) => {
      //send message to the same room
      
      io.to(roomId).emit('createMessage', message)
  }); 
  socket.on('addlist',(username)=>{
    console.log("test")
    if(newUsers.indexOf(username)==-1){newUsers.push(username)}
   
    console.log(newUsers)
    io.to(roomId).emit('userlist',newUsers)
  })
 
 


    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})




server.listen(process.env.PORT||3030)
