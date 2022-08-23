const socket = io('http://192.168.0.33:3080');
const canvas = document.getElementById('stickman');
const c = canvas.getContext('2d');


document.addEventListener('keydown', keydown);
document.addEventListener('keyup', keyup);

let joined = false;

let playerjoined = false;

let player;
let room;
let clientroom;

let hit = false;

let frame = 0;
let stance = 2;

const stickguy = new Image;
stickguy.src = 'http://192.168.0.33:3080/api/charactersprite';

const stances = [
    {
        type: "attack",
        frames: 4,
        time: 60,
        sx: 0,
        sy: 0,
        sw: 512,
        sh: 512,
    },
    {
        type: "idol",
        frames: 5,
        time: 90,
        sx: 0,
        sy: 1024,
        sw: 512,
        sh: 512
    },
    {
        type: "running",
        frames: 5,
        time: 80,
        sx: 0,
        sy: 512,
        sw: 512,
        sh: 512
    },
{
        x: 154,
        y: 128
    },
]

// Enemy Variable for stick guy
let enemyframe = undefined;
let enemystance = undefined
let enemylastway = undefined;

let erx = undefined;
let ery = undefined;

let e_hitback_reqs = 0;
let e_rockback_reqs = 0;

let x = undefined;
let y = undefined;

let ex = undefined;
let ey = undefined;

let exp = undefined;
let eyp = undefined;
let ewp = undefined;
let ehp = undefined;

let rx;
let ry;

let rockhit = false;

let moveright = false;
let moveleft = false;

let delay = 0;

let downpull = 1;
let jumppull = 10;

let upPressed = false;
let downPressed = false;
let rightPressed = false;
let leftPressed = false;
let attack = false;
let throwrock = false;
let punchattack = true;
let lastrockway = 'right';

let up = false;

const SHIFT = 16;

let lastway = 'right';
let lasthitway = 'right';
let goback = false;

let damage = 0;
let enemyDamage = 0;

let width = 60;
let height = 120;
let ewidth = 60;
let eheight = 120;

var timer;

let win = false;

let remove = false;
socket.on('connect', () => {

socket.emit('type', {type: "dual"});

    socket.on('room', room => {
        clientroom = room;
        console.log(clientroom)
    })

    socket.on('whoThere', () => {
        socket.emit('whoThere', socket.id);
    })

    socket.on('typeOfPlayer', (type) => {
        player = type;
        if(player === 'player1') {
            x = 100;
            y = 200;
        }
        
        console.log(type);
    })

    socket.on('joined', data => {
        playerjoined = true;
        console.log('joined');
    })


    socket.on('move', (cords) => {
        ex = cords.x;
        ey = cords.y;
    })
    
    socket.on('rocked', data => {
        // do the rock stuff here
    
        if(data.player != player) {
            if(data.type === 'right') {
                x = x + 6;
            }
            if(data.type === 'left') {
                x = x - 6;
            }
    
        e_rockback_reqs = e_rockback_reqs + 5;
        }
    
    })
    
    socket.on('drawrock', data => {
        erx = data.x;
        ery = data.y;
    })
    
    socket.on('notrock', () => {
        erx = undefined;
        ery = undefined;
    })
    
    socket.on('hitback', stats => {
        if(stats.player != player) {
            if(stats.type === 'right') {
            x = x + 6;
        }
        if(stats.type === 'left') {
            x = x - 6;
        }
        e_hitback_reqs = e_hitback_reqs + 1;
    }
    
    })
    
    socket.on('action', data => {
        enemyframe = data.frame;
        enemystance = data.stance;
        enemylastway = data.lastway;
    })
    
    socket.on('gameover', data => {
        if(data.player != player) {
            ewidth = 0;
            eheight = 0;
            win = true;
        }
    })




})


timer = setInterval(() => {
    
    backround();

    if(clientroom && player && playerjoined) {
    // GAME STARTED

    drawplayer();
    move();
    gravity();
    jump();
    border();
    checkdead();
    drawRock();
    shootdelay();
    hitback();
    dealwithreqs();

    // Enemy Code;
    drawenemy();
    drawenemyrock();

    } else {
        c.font = "normal 36px Arial";
        c.fillStyle = 'white';
        c.fillText("Code is " + clientroom, 180, 200);
    }
}, 10)




function backround() {
    c.fillStyle = 'grey';
    c.fillRect(0, 0, canvas.width, canvas.height);
}

function drawplayer() {

        if(lastway === 'left') {
            c.save();
            c.scale(-1, 1)
            c.drawImage(stickguy, frame * 512, stance * 512, 512, 512, -x - 154 + 45, y + 20, 154, 128);
            c.restore();
        }
        if(lastway === 'right') {
            c.drawImage(stickguy, frame * 512, stance * 512, 512, 512, x - 45, y + 20, 154, 128);
    }

        c.fillStyle = 'black';
        c.font = '20px Arial'
        c.fillText(damage, x + 25, y - 10);
        c.fillText("You", x + 15, y - 27);
        c.strokeRect(x, y - 55, 60, 50)


            socket.emit('action', { room: clientroom, frame: frame, stance: stance, lastway: lastway })

}

function keydown(e) {

    if(e.keyCode === 38) {
    up = true;
    }
    if(e.keyCode === 40) {
    downPressed = true;
    }
    if(e.keyCode === 37) {
    leftPressed = true;
    rightPressed = false;
    lastway = 'left';
    }
    if(e.keyCode === 39) {
    rightPressed = true;
    leftPressed = false;
    lastway = 'right';
    }
    if(e.keyCode === 32) {
    attack = true;
    }

    if(e.keyCode === SHIFT && !moveright && !moveleft) {
        throwrock = true;
    }
    
    }
    
    function keyup(e) {
    
    if(e.keyCode == 38) {
    up = false;
    }
    if(e.keyCode === 40) {
    downPressed = false;
    }
    if(e.keyCode === 37) {
    leftPressed = false;
    }
    if(e.keyCode === 39) {
    rightPressed = false;
    }
    if(e.keyCode === 32) {
    attack = false;
    }
    
    }

    function punch() {

        

        if(lastway == 'right' && punchattack) {
            // Have to socket.emit('hitback', {type: "right or left"})
            // Make better fall back animations


            const maxPunchReach = x + 60;
            const minPunchReach = x + 30;
            const minPunchHeight = y + 90;
            const maxPunchHeight = y + 60
            
            if(maxPunchReach >= ex && minPunchReach <= ex + 60 && maxPunchHeight >= ey && minPunchHeight <= ey + 120) {
            lasthitway = 'right';
            goback = true;
            punchattack = false;
            }


        }
        if(lastway == 'left' && punchattack) {


            const maxPunchReach = x;
            const minPunchReach = x + 30;
            const minPunchHeight = y + 90;
            const maxPunchHeight = y + 60;  
            

            if(maxPunchReach <= ex + 60 && minPunchReach >= ex && maxPunchHeight >= ey && minPunchHeight <= ey + 120) {
            lasthitway = 'left';
            goback = true;
            punchattack = false;
            }


        }
    
    }


    function punchattackdelay() {
        setInterval(() => {
            punchattack = true;
        }, 1000)
    }
    punchattackdelay();

    function move() {
        if(upPressed) {
        upPressed = false;
        }
        if(downPressed) {
        y = y + 2
        }
        if(rightPressed) {
        x = x + 2
        stance = 1;
        }
        if(leftPressed) {
        x = x - 2
        stance = 1;
        }
        if(attack) {
        punch();
        stance = 0;
        }

        if(!upPressed && !downPressed && !rightPressed && !leftPressed && !attack) {
            stance = 2;
        }


        socket.emit('move', {x: x, y: y, room: clientroom});
        }

    function gravity() {
            y = y + downpull
            
            if(y + 120 < canvas.height) {
            downpull = downpull + 0.1
            } else {
            downpull = 0;
            }
            }

    function border() {
                if(y + 120 >= canvas.height) {
                y = canvas.height - 120;
                up = false;
                }
                if(y <= 0) {
                y = 0;
                }
                if(x <= 0) {
                x = 0;
                }
                if(x + 60 >= canvas.width) {
                x = canvas.width - 60;
                }
                }

    function jump() {
                    if(up) {
                    y = y - jumppull;
                    jumppull = jumppull - 0.3
                    } else {
                    jumppull = 10;
                    }
                    if(y <= 40) {
                    jumppull = 10;
                    }
                    }

function checkdead() {
    if(damage >= 50) {
        width = 0;
        height = 0;
        c.fillStyle = 'white';
        c.fillText("You Lose", 200, 300);
        
            socket.emit('gameover', {room: clientroom, player: player})
        
        
        clearInterval(timer);
    }
    if(win) {
        c.fillStyle = 'white';
        c.fillText("You Win", 200, 300);
        clearInterval(timer);
    }
}

function drawenemy() {
    // c.fillStyle = 'red';
    // c.fillRect(ex, ey, ewidth, eheight);

    if(enemylastway === 'left') {
        c.save();
        c.scale(-1, 1)
        c.drawImage(stickguy, enemyframe * 512, enemystance * 512, 512, 512, -ex - 154 + 45, ey + 20, 154, 128);
        c.restore();
    }
    if(enemylastway === 'right') {
        c.drawImage(stickguy, enemyframe * 512, enemystance * 512, 512, 512, ex - 45, ey + 20, 154, 128);
}}

function changeframe() {
    setInterval(() => {
        if(frame >= stances[stance].frames) {
            frame = 0;
        } else {
            frame++
        }
    }, stances[stance].time)

}
changeframe();

function drawRock() {

    if(moveright || moveleft) {

    c.fillStyle = 'black';
    c.fillRect(rx, ry, 5, 5)
}
}

function shootdelay() {
    delay = delay - 1;
    c.fillStyle = 'black';
    c.fillRect(0, 0, delay, 10);
}

function moverock() {
    setInterval(() => {

        const maxRockLength = rx;
        const minRockLength = rx + 5;
        const minRockHeight = ry + 5;
        const maxRockHeight = ry;

        if(throwrock && delay <= 0) {
            hit = false;
            if(lastway === 'right') {
                moveleft = false
                moveright = true;
                rx = x + 27;
                ry = y + 72;
                throwrock = false;
            }
            if(lastway === 'left') {
                moveright = false;
                moveleft = true;
                rx = x + 27;
                ry = y + 72;
                throwrock = false;
            }
        } else {
            throwrock = false;
        }

            if(moveright) {
                lastrockway = 'right'
                throwrock = false;
                rx = rx + 5;
                
                    socket.emit('drawrock', {room: clientroom, x: rx, y: ry})
                
                
            }

            if(moveleft) {
                lastrockway = 'left';
                throwrock = false;
                rx = rx - 5;
                
                    socket.emit('drawrock', {room: clientroom, x: rx, y: ry})
                
                
            }

            if(rx > canvas.width || rx < 0) {
                rx = undefined;
                moveright = false;
                moveleft = false;
                throwrock = false;
                delay = canvas.width;
                
                    socket.emit('notrock', {room: clientroom})
                
                
            }

            
            if(maxRockLength <= ex + 60 && minRockLength >= ex && minRockHeight >= ey && maxRockHeight <= ey + 120 && !hit) {
                rx = undefined;
                moveright = false;
                moveleft = false;
                throwrock = false;
                delay = canvas.width;
                hit = true;
                rockhit = true;
                
}


    }, 10)
}
moverock();

function drawenemyrock() {
    c.fillStyle = 'black';
    c.fillRect(erx, ery, 5, 5);
}


function dealwithreqs() {
    if(e_hitback_reqs === 21) {
        damage = damage + 1;
        e_hitback_reqs = 0;
    }
    if(e_rockback_reqs === 105) {
        damage = damage + 5;
        e_rockback_reqs = 0;
    }
}


function hitback() {
    if(goback) {
    // if(lasthitway === 'left') {
    // ex = ex - 6;
    // setTimeout(() => {
    // goback = false;
    // }, 1000)
    // }
    
    // if(lasthitway === 'right') {
    // ex = ex + 6;
    // setTimeout(() => {
    // goback = false;
    // }, 200)
    // }



        if(lasthitway === 'left') {
        ex = ex - 6;
        socket.emit('hitback', {type: "left", room: clientroom, player: player})
        setTimeout(() => {
        goback = false;
        }, 200)
        }
        
        if(lasthitway === 'right') {
        ex = ex + 6;
        socket.emit('hitback', {type: "right", room: clientroom, player: player})
        setTimeout(() => {
        goback = false;
        }, 200)
        }







    }

// ****************************************
// ROCK HERE
// ****************************************

if(rockhit) {
    // socket.emit('rocked', { room: clientroom, player: player, type: lastrockway })
    // socket.emit('notrock', { room: clientroom })





    if(lastrockway === 'left') {
        ex = ex - 6;
        socket.emit('rocked', {type: "left", room: clientroom, player: player})
        socket.emit('notrock', { room: clientroom })
        setTimeout(() => {
        rockhit = false;
        }, 200)
        }

    if(lastrockway === 'right') {
        ex = ex + 6;
        socket.emit('rocked', {  room: clientroom, type: "right", player: player })
        socket.emit('notrock', { room: clientroom })
        setTimeout(() => {
        rockhit = false;
        }, 200)
    }

}
    
    }