const net = require("net");
const ReqParser = require('./parser');
const Controller = require('./controller');
const Server = require('./server');

const controller = new Controller();
const args = new Server().extractArgs();

console.log("Logs from your program will appear here!");

const server = net.createServer((connection) => {
	connection.on('data', data => {
		const request = data.toString().trim();
		const parser = new ReqParser(request);
		const commands = parser.parse();

		const response = controller.handleReq(commands, args);

		connection.write(response);
	});
});

server.listen(args.port, "127.0.0.1");
