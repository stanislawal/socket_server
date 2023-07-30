let express = require('express');
let app = express();
let server = require("http").createServer(app);
let SocketIo = require('socket.io')
const Redis = require('ioredis');
const redis = new Redis({password: 1234, port: 6379, host: 'redis'});
let port = 7000;


server.listen(port, function () {
    console.log("Server listening port", port);
});

// подписываемся на все каналы 
redis.psubscribe('*', () => {});

// старойка cors
let io = SocketIo(server, {
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

	// event = PushNotification (алиас в события в функции broadcastAs)
	io.sockets.emit(event, data);
});
