const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(server, { cors: {origin: '*'}});

let readyUp = [];
let readyForGame = 0;
let room = 1;

let whoThere = 0;


app.get('/api/solo', (req, res) => {
    res.sendFile(path.join(__dirname, './solo/solo.html'))
    })

app.get('/api/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, './favicon.ico'));
})
    
    app.get('/api/solo.js', (req, res) => {
        res.sendFile(path.join(__dirname, "./solo/solo.js"))
    })
    
    app.get('/api/solo.css', (req, res) => {
        res.sendFile(path.join(__dirname, "./solo/solo.css"))
    })
    
    app.get('/api/charactersprite', (req, res) => {
        res.sendFile(path.join(__dirname, '/stickguy.png'))
    })
    
    app.get('/api/dual', (req, res) => {
        res.sendFile(path.join(__dirname, './dual/dual.html'))
    })
    
    app.get('/api/dual.js', (req, res) => {
        res.sendFile(path.join(__dirname, './dual/dual.js'))
    })
    
    app.get('/api/dual.css', (req, res) => {
        res.sendFile(path.join(__dirname, './dual/dual.css'))
    })
    
    app.get('/api/join', (req, res) => {
        res.sendFile(path.join(__dirname, './join/join.html'))
    })
    
    app.get('/api/join.js', (req, res) => {
        res.sendFile(path.join(__dirname, './join/join.js'))
    })
    
    app.get('/api/join.css', (req, res) => {
        res.sendFile(path.join(__dirname, './join/join.css'))
    })


io.on('connection', (socket) => {
    // Whenever someone wants to play they get put in the ready up arr
    
    socket.on('type', type => {
        if(type.type === 'solo') {
            readyUp.push(socket.id);
            console.log(readyUp);
        }
        if(type.type === 'dual') {
            socket.join(room);
            socket.emit('typeOfPlayer', 'player1');
            io.in(room).emit('room', room);
            room = room + 1;
        }
    })


    socket.on('join', (data) => {
        console.log(data);
        io.in(data.room).emit('whoThere');

        setTimeout(() => {
            if(whoThere === 1) {
                socket.join(data.room);
                socket.emit('typeOfPlayer', 'player2');
                io.in(data.room).emit('room', data.room);
                whoThere = 0;

            } else {
                whoThere = 0;
            }
        }, 5000)
        
    })

    socket.on('whoThere', data => {
        whoThere++;
        console.log(whoThere)
    })


socket.on('joined', data => {
    io.in(data.room).emit('joined');
})


    socket.on('disconnect', () => {
        for(let i = 0; i < readyUp.length; i++) {
            if(readyUp[i] === socket.id) {
                readyUp.splice(i, 1);
                console.log(readyUp)
            }
        }
    })

        setInterval(() => {
                if(readyUp.length >= 2) {

                    if(socket.id === readyUp[0]) {
                        socket.join(room);
                        readyForGame = readyForGame + 1;
                        socket.emit('typeOfPlayer', 'player1');
                    }

                    if(socket.id === readyUp[1]) {
                        socket.join(room);
                        readyForGame = readyForGame + 1;
                        socket.emit('typeOfPlayer', 'player2');
                    }

                    if(readyForGame === 2) {
                        io.in(room).emit('room', room);
                        console.log(`Users ${readyUp[0]}, ${readyUp[1]} are in room ${room}`)
                        room = room + 1;
                        readyUp.splice(0, 2);
                        readyForGame = 0;
                        console.log(`ready people: ${readyUp}, next avaible room: ${room}`)
                    }


    }
        }, 1000)

    setInterval(() => {

        if(readyUp.length === 1 && readyUp[0] === socket.id) {
            socket.join(room);
            io.in(room).emit('room', room);
            socket.emit('typeOfPlayer', 'player1');
            socket.emit('playingai');
            console.log(`User ${socket.id} just joined a AI game in room ${room}`)
            room = room + 1;
            readyUp.splice(0, 1);
            readyForGame = 0;
            console.log(`ready people: ${readyUp}, next avaible room: ${room}`)
        }

    }, 5000)


        socket.on('move', (cords) => {
            socket.to(cords.room).emit('move', cords);
        })

        socket.on('punch', (stats) => {
            socket.to(stats.room).emit('punch', stats);
        })

        socket.on('notpunching', (room) => {
            socket.to(room.room).emit('notpunching');
        })

        socket.on('hitback', (data) => {
            socket.to(data.room).emit('hitback', data);
        })

        socket.on('action', (data) => {
            socket.to(data.room).emit('action', data);
        })

        socket.on('rocked', data => {
            socket.to(data.room).emit('rocked', data);
        })

        socket.on('drawrock', data => {
            socket.to(data.room).emit('drawrock', data);
        })

        socket.on('notrock', room => {
            socket.to(room.room).emit('notrock');
        })

        socket.on('gameover', (data) => {
            socket.to(data.room).emit('gameover', data);
        })


})

server.listen(3080, () => {
    console.log('Server is Running on Port 3080...');
})