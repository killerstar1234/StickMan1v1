const socket = io('http://192.168.0.33:3080');
const canvas = document.getElementById('stickman');
const c = canvas.getContext('2d');
document.addEventListener('keydown', keydown);
document.addEventListener('keyup', keyup);


// Bot Variables
let bot = false;

let botx = 500;
let boty = 200;
let botdownpull = 1;
let botframe = 0;
let botstance = 2;
let botway = 'right';
let wonder = false;
let randomway = Math.floor(Math.random() * 2);
let botattack = true;
let botdamage = 0;
let lastbothit = 'right';
let botback = false;

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


// The room number
let clientroom;

// our player type(player 1 or player 2)
let player;

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

socket.on('connect', () => {

    socket.emit('type', { type: 'solo' });

    socket.on('room', room => {
clientroom = room;
console.log(clientroom)
console.log(socket.id);
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
    if(player === 'player2') {
        x = 500;
        y = 200;
    }
    console.log(type);
})

socket.on('playingai', () => {
    bot = true;
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
            // This is stuff that does not need to get loaded to work
                backround();
if(clientroom && player && !bot) {
            // This is stuff that we need to load so the game can work proporly, like our character moving around and us rendering the other player
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

    } else if(bot) {
        drawplayer();
        move();
        gravity();
        jump();
        border();
        checkdead();
        drawRock();
        shootdelay();
        hitback();

        // BOT CODE

        drawAI();
        botgravity();
        movebot();
        botborder();
        botpunch();
        checkbotdead();

    } else {
        c.font = "normal 36px Arial";
        c.fillStyle = 'white';
        c.fillText("Finding Player...", 180, 200);
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

if(!bot) {
            socket.emit('action', { room: clientroom, frame: frame, stance: stance, lastway: lastway })
}
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

        if(!bot) {

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


        // ************************************************************************ //
        // ADD THE AI CODE HERE FOR if(bot && I_hit_the_bot ) { botx = botx - 150 } //
        // ************************************************************************ //


        if(bot) {

            if(lastway == 'right' && punchattack) {
                // Have to socket.emit('hitback', {type: "right or left"})
                // Make better fall back animations
    
    
                const maxPunchReach = x + 60;
                const minPunchReach = x + 30;
                const minPunchHeight = y + 90;
                const maxPunchHeight = y + 60
                
                if(maxPunchReach >= botx && minPunchReach <= botx + 60 && maxPunchHeight >= boty && minPunchHeight <= boty + 120) {
                punchattack = false;
                lasthitway = 'right';
                goback = true;
                botdamage = botdamage + 1;
                }
    
    
            }
            if(lastway == 'left' && punchattack) {
    
    
                const maxPunchReach = x;
                const minPunchReach = x + 30;
                const minPunchHeight = y + 90;
                const maxPunchHeight = y + 60;  
                
    
                if(maxPunchReach <= botx + 60 && minPunchReach >= botx && maxPunchHeight >= boty && minPunchHeight <= boty + 120) {
                lasthitway = 'left';
                goback = true;
                botdamage = botdamage + 1;
                }
    
    
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

        if(!bot) {
        socket.emit('move', {x: x, y: y, room: clientroom});
        }
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
        if(!bot) {
            socket.emit('gameover', {room: clientroom, player: player})
        }
        
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

        setInterval(() => {
    if(botframe >= stances[botstance].frames) {
        botframe = 0;
    } else {
        botframe++
    }
}, stances[botstance].time)
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
                if(!bot) {
                    socket.emit('drawrock', {room: clientroom, x: rx, y: ry})
                }
                
            }

            if(moveleft) {
                lastrockway = 'left';
                throwrock = false;
                rx = rx - 5;
                if(!bot) {
                    socket.emit('drawrock', {room: clientroom, x: rx, y: ry})
                }
                
            }

            if(rx > canvas.width || rx < 0) {
                rx = undefined;
                moveright = false;
                moveleft = false;
                throwrock = false;
                delay = canvas.width;
                if(!bot) {
                    socket.emit('notrock', {room: clientroom})
                }
                
            }

            if(!bot) {
            if(maxRockLength <= ex + 60 && minRockLength >= ex && minRockHeight >= ey && maxRockHeight <= ey + 120 && !hit) {
                rx = undefined;
                moveright = false;
                moveleft = false;
                throwrock = false;
                delay = canvas.width;
                hit = true;
                rockhit = true;
                
}}
// ************************************************* //
// ADD CODE RIGHT HERE FOR SHOOTING AND HITTING A AI //
// ************************************************* //
if(bot) {
    if(maxRockLength <= botx + 60 && minRockLength >= botx && minRockHeight >= boty && maxRockHeight <= boty + 120 && !hit) {
    rx = undefined;
    moveright = false;
    moveleft = false;
    throwrock = false;
    delay = canvas.width;
    hit = true;
    botdamage = botdamage + 5;
    if(lastrockway === 'right') {
        lasthitway = 'right';
        goback = true;
    }
    if(lastrockway === 'left') {
        lasthitway = 'left';
        goback = true;
    }
}
}

    }, 10)
}
moverock();

function drawenemyrock() {
    c.fillStyle = 'black';
    c.fillRect(erx, ery, 5, 5);
}

function drawAI() {
    // c.drawImage(stickguy, botframe * 512, botstance * 512, 512, 512, botx - 45, boty + 20, 154, 128);


    if(botway === 'left') {
        c.save();
        c.scale(-1, 1)
        c.drawImage(stickguy, botframe * 512, botstance * 512, 512, 512, -botx - 154 + 45, boty + 20, 154, 128);
        c.restore();
    }
    if(botway === 'right') {
        c.drawImage(stickguy, botframe * 512, botstance * 512, 512, 512, botx - 45, boty + 20, 154, 128);
}


}

function botgravity() {
    boty = boty + botdownpull
            
    if(boty + 120 < canvas.height) {
    botdownpull = botdownpull + 0.1
    } else {
    botdownpull = 0;
    }
}

function movebot() {


    if(botx > x) {
        botx = botx - 2;
        botway = 'left'
        botstance = 1;
    }


    if(botx < x) {
        botx = botx + 2;
        botway = 'right';
        botstance = 1;
    }

    if(botx === x) {
        wonder = true;
    }

}

function wonderoff() {
    setInterval(() => {
        if(wonder) {

            if(randomway === 1) {
                botx = botx + 4;
                botway = 'right'
            }

            if(randomway === 0) {
                botx = botx - 4;
                botway = 'left';
            }

    }

    }, 10)
    
        setInterval(() => {
            wonder = false;
            randomway = Math.floor(Math.random() * 2)
        }, 1000)

}
wonderoff();

function botborder() {
    if(boty + 120 >= canvas.height) {
        boty = canvas.height - 120;
        }
        if(boty <= 0) {
        boty = 0;
        }
        if(botx <= 0) {
        botx = 0;
        }
        if(botx + 60 >= canvas.width) {
        botx = canvas.width - 60;
        }
}

function botpunch() {
    if(botway == 'right' && botattack) {
        // Have to socket.emit('hitback', {type: "right or left"})
        // Make better fall back animations


        const maxPunchReach = botx + 60;
        const minPunchReach = botx + 30;
        const minPunchHeight = boty + 90;
        const maxPunchHeight = boty + 60
        
        if(maxPunchReach >= x && minPunchReach <= x + 60 && maxPunchHeight >= y && minPunchHeight <= y + 120) {
        lastbothit = 'right';
        botback = true;
        botattack = false;
        damage = damage + 1;
        }


    }
    if(botway == 'left' && botattack) {


        const maxPunchReach = botx;
        const minPunchReach = botx + 30;
        const minPunchHeight = boty + 90;
        const maxPunchHeight = boty + 60;  
        

        if(maxPunchReach <= x + 60 && minPunchReach >= x && maxPunchHeight >= y && minPunchHeight <= y + 120) {
            lastbothit = 'left';
            botback = true;
            botattack = false;
        damage = damage + 1;
        }


    }
}

function botattackfalse() {

    setInterval(() => {
        if(bot) {
                    botattack = true;
        }
    }, 2000)

}
botattackfalse();

// Make bot be able to punch at a certen distance to the player like if it is exacly toching or something 
// Make the bot shoot if it is 50 px or something away and its timer is less then 0
// Make the bot jump randomly?? (if you have another idea of when the bot should jump like when a bullet is coming mabye add a math.random to see if it jumps or not)
// Make the person be able to hit the bot with its punches and kicks

function checkbotdead() {
    if(botdamage >= 50) {
        win = true;        
    }
    if(win) {
        c.fillStyle = 'white';
        c.fillText("You Win", 200, 300);
        clearInterval(timer);
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

if(!bot) {

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



        if(bot) {
    if(lasthitway === 'left') {
    botx = botx - 6;
    setTimeout(() => {
    goback = false;
    }, 200)
    }
    
    if(lasthitway === 'right') {
    botx = botx + 6;
    setTimeout(() => {
    goback = false;
    }, 200)
    }
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

    if(bot) {
        if(botback) {
        if(lastbothit === 'right') {
            x = x + 6;
            setTimeout(() => {
                botback = false;
            }, 200)
        }
        if(lastbothit === 'left') {
            x = x - 6;
        }
        setTimeout(() => {
            botback = false;
        }, 200)
        }

    }
    
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