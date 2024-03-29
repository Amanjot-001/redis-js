const net = require("net");
const ReqParser = require('./parser');
const Controller = require('./controller');
const Server = require('./server');
const handshake = require('./handshake.js');

const controller = new Controller();
const redisServerMetadata = new Server().extractArgs();

const server = net.createServer((connection) => {
	connection.on('data', data => {
		const request = data.toString().trim();
		const parser = new ReqParser(request);
		const commands = parser.parse();

		const response = controller.handleReq(commands, redisServerMetadata);

		connection.write(response);
	});
});

server.listen(redisServerMetadata.port, "127.0.0.1", () => {
	console.log('0-server running on port:', redisServerMetadata.port);

	if (redisServerMetadata.role === 'slave') {
		handshake(redisServerMetadata);
	};
});
