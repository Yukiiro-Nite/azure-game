const path = require('path');
const jsdom = require('jsdom');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const PORT = process.env.PORT || 3000;
const Datauri = require('datauri');
const datauri = new Datauri();
const { JSDOM } = jsdom;
 
app.use(express.static(__dirname + '/client'));
 
app.get('/', function (req, res) {
  res.sendFile(__dirname + 'client/index.html');
});

function setupAuthoritativePhaser() {
  const serverIndexPath = path.join(__dirname, 'authoritative-server/authoritative-index.html')
  const jsdomConfig = {
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true
  }
  JSDOM.fromFile(serverIndexPath, jsdomConfig)
    .then(handleDomSetup)
    .catch((error) => {
      console.log(error.message);
    });
}

function handleDomSetup(dom) {
  dom.window.URL.createObjectURL = (blob) => {
    if (blob) {
      return datauri.format(blob.type, blob[Object.getOwnPropertySymbols(blob)[0]]._buffer).content;
    }
  };
  dom.window.URL.revokeObjectURL = (objectURL) => {};
  dom.window.gameLoaded = () => {
    server.listen(PORT, function () {
      console.log(`Listening on ${server.address().port}`);
    });
  };
  dom.window.io = io;
}
 
setupAuthoritativePhaser();
