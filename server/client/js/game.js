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
    Object.entries(players).forEach(function ([id, player]) {
      if (player.playerId === self.socket.id) {
        displayPlayers(self, player, 'sphere');
      }
    });
  });
}
 
function update() {

}

function displayPlayers(self, playerInfo, sprite) {
  const player = self.add
    .sprite(playerInfo.x, playerInfo.y, sprite)
    .setOrigin(0.5, 0.5).setDisplaySize(32, 32);
  
  player.playerId = playerInfo.playerId;
  self.players.add(player);
}