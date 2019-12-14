const players = {};
const config = {
  autoFocus: false,
  type: Phaser.HEADLESS,
  parent: 'phaser-example',
  width: 800,
  height: 600,
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
 
function preload() {
  this.load.image('sphere', 'assets/sphere.png');
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
      playerId: id
    };
    addPlayer(self, players[id]);
    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', players[id]);

    socket.on('disconnect', function () {
      removePlayer(self, id);
      delete players[id];

      console.log(`${id} disconnected`);
    });
  });
}
 
function update() {}

function addPlayer(self, playerInfo) {
  const player = self.physics
    .add.image(playerInfo.x, playerInfo.y, 'sphere')
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
 
const game = new Phaser.Game(config);
window.gameLoaded()