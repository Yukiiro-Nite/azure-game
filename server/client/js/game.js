const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
}
 
const game = new Phaser.Game(config);
 
function preload() {
  this.load.image('sphere', 'assets/sphere.png');
}
 
function create() {
  var self = this;
  this.socket = io();
  
  this.players = this.add.group();
 
  this.socket.on('currentPlayers', function (players) {
    console.log(players)
    Object.entries(players).forEach(function ([id, player]) {
      displayPlayers(self, player, 'sphere');
    });
  });

  this.socket.on('newPlayer', function (playerInfo) {
    displayPlayers(self, playerInfo, 'sphere');
  });

  this.socket.on('playerLeave', function (playerId) {
    self.players.getChildren().forEach(function (player) {
      if (playerId === player.playerId) {
        player.destroy();
      }
    });
  })

  this.socket.on('disconnect', function (playerId) {
    self.players.getChildren().forEach(function (player) {
      if (playerId === player.playerId) {
        player.destroy();
      }
    });
  });
	
  this.socket.on('playerUpdates', function (players) {
    Object.keys(players).forEach(function (id) {
      self.players.getChildren().forEach(function (player) {
        if (players[id].playerId === player.playerId) {
          player.setRotation(players[id].rotation);
          player.setPosition(players[id].x, players[id].y);
        }
      });
    });
  });

  this.cursors = this.input.keyboard.createCursorKeys();
  this.leftKeyPressed = false;
  this.rightKeyPressed = false;
  this.upKeyPressed = false;
  this.downKeyPressed = false;
}
 
function update() {
  const lastLeft = this.leftKeyPressed;
  const lastRight = this.rightKeyPressed;
  const lastUp = this.upKeyPressed;
  const lastDown = this.downKeyPressed;
  
  this.leftKeyPressed = this.cursors.left.isDown
  this.rightKeyPressed = this.cursors.right.isDown
  this.upKeyPressed = this.cursors.up.isDown
  this.downKeyPressed = this.cursors.down.isDown
  
  const inputChanged = lastLeft !== this.leftKeyPressed
    || lastRight !== this.rightKeyPressed
    || lastUp !== this.upKeyPressed
    || lastDown !== this.downKeyPressed

  if (inputChanged) {
    const playerInput = {
      left: this.leftKeyPressed,
      right: this.rightKeyPressed,
      up: this.upKeyPressed,
      down: this.downKeyPressed
    }
    this.socket.emit('playerInput', playerInput);
  }
}

function displayPlayers(self, playerInfo, sprite) {
  const player = self.add
    .sprite(playerInfo.x, playerInfo.y, sprite)
    .setOrigin(0.5, 0.5).setDisplaySize(32, 32);
  
  player.playerId = playerInfo.playerId;
  self.players.add(player);
}