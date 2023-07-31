let express = require('express');
let app = express();
let server = require("http").createServer(app);
let SocketIo = require('socket.io')
let fs = require('fs');
let https = require('https');
const Redis = require('ioredis');
const redis = new Redis({password: 'sberhtr12', port: 6379, host: 'redis'});
let port = 7000;

let key = null;
let cert = null;
let ca = null;

if (fs.existsSync('/home/node/app/ssl/privkey1.pem')) {
	key = fs.readFileSync('/home/node/app/ssl/privkey1.pem');
}

if (fs.existsSync('/home/node/app/ssl/cert1.pem')) {
	cert = fs.readFileSync('/home/node/app/ssl/cert1.pem');
}

if (fs.existsSync('/home/node/app/ssl/chain1.pem')) {
	ca = fs.readFileSync('/home/node/app/ssl/chain1.pem');
}

const opts = { key, cert, ca };

let httpsServer = https.createServer(opts, app);

httpsServer.listen(port, function () {
    console.log("HTTPS on port", port);
});

// подписываемся на все каналы 
redis.psubscribe('*', () => {});

// старойка cors
let io = SocketIo(httpsServer, {
    cors: {origin: "*"}
});


io.on('connection', (socket) => {
    console.log("Connection: ", socket.id)
});

 // Обработка сообщений, получаемых из канала (pmessage - зарезервированный канал для возвраща сообщений из )
redis.on('pmessage', (pattern, channel, res) => {

	const parseData = JSON.parse(res);
	const event = parseData.event;
	const data = parseData.data;

	console.log(event, data);

	// event = PushNotification (алиас в события в функции broadcastAs)
	io.sockets.emit(event, data);

	
});
