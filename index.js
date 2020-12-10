const express = require("express");
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var users = [];
var actualuser = '';

app.use('/static', express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    socket.on('chat message', function(msg) {
        users.forEach(element => {
            if (element.username == msg.username) {
                msg = { username: msg.username, msg: msg.msg, source: element.source }
            }
        });
        console.log('chat')
        io.emit('chat message', msg);
    });

    socket.on('broadcast', function(data) {
        console.log('broadcast')
        io.emit('broadcast', data)
        
    })

    socket.on('online', function(data) {
        if (!users.includes(data.username)) {
            users.push(data);
            actualuser = data.username;
        }
        console.log('online')
        io.emit('online', users);
    });

    socket.on("typing", function(data) {
        console.log('typing')
        io.emit("typing", data);
    });

    socket.on("stop-typing", function(data) {
        console.log('typing stop')
        io.emit("stop-typing", data);
    });

    socket.once('disconnect', function() {
        for (let i = 0; i < users.length; ++i) {
            if (users[i].username == actualuser) {
                users.splice(i, 1);
            }
        }
        console.log('out')
        io.emit('logout', users)
    })

});


http.listen(3000, () => {
  console.log('listening on *:3000');
});