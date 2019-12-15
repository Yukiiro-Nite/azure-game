const players = {};
const config = {
  autoFocus: false,
  type: Phaser.HEADLESS,
  parent: 'phaser-example',
  width: 1600,
  height: 900,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const halfPi = Math.PI / 2;
 
function preload() {
  this.load.image('ship', 'assets/ship.png');
}
 
function create() {
  const self = this;
  this.players = this.physics.add.group();
  io.on('connection', function (socket) {
    const id = socket.id;
    console.log(`${id} connected`);
	
    players[id] = {
      rotation: 0,
      x: Math.floor(Math.random() * 700) + 50,
      y: Math.floor(Math.random() * 500) + 50,
      input: {
        left: false,
        right: false,
        up: false,
        down: false
      },
      playerId: id
    };
    addPlayer(self, players[id]);
    
    socket.emit('currentPlayers', players);

    socket.broadcast.emit('newPlayer', players[id]);
    
    socket.on('playerInput', function (inputData) {
      handlePlayerInput(self, id, inputData);
    });
    
    socket.on('disconnect', function () {
      removePlayer(self, id);
      socket.broadcast.emit('playerLeave', id);
      delete players[id];

      console.log(`${id} disconnected`);
    });
  });
}
 
function update() {
  this.players.getChildren().forEach((player) => {
    const input = players[player.playerId].input;
    if (input.left) {
      player.setAngularVelocity(-300);
    } else if (input.right) {
      player.setAngularVelocity(300);
    } else {
      player.setAngularVelocity(0);
    }
   
    if (input.up) {
      this.physics.velocityFromRotation(player.rotation - halfPi, 200, player.body.acceleration);
    } else if (input.down) {
      this.physics.velocityFromRotation(player.rotation - halfPi, -100, player.body.acceleration);
    } else {
      player.setAcceleration(0);
    }
   
    players[player.playerId].x = player.x;
    players[player.playerId].y = player.y;
    players[player.playerId].rotation = player.rotation;
  });
  this.physics.world.wrap(this.players, 5);
  io.emit('playerUpdates', players);
}

function addPlayer(self, playerInfo) {
  const player = self.physics
    .add.image(playerInfo.x, playerInfo.y, 'ship')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(32, 32);
  player.setDrag(100);
  player.setAngularDrag(100);
  player.setMaxVelocity(200);
  player.playerId = playerInfo.playerId;
  self.players.add(player);
}

function removePlayer(self, playerId) {
  self.players.getChildren().forEach((player) => {
    if (playerId === player.playerId) {
      player.destroy();
    }
  });
}

function handlePlayerInput(self, playerId, input) {
  players[playerId].input = input;
}
const game = new Phaser.Game(config);
window.gameLoaded()