const net = require("net");
const ReqParser = require('./parser');
const Controller = require('./controller');
const Server = require('./server');

const controller = new Controller();
const args = new Server().extractArgs();

console.log("Logs from your program will appear here!");

function pingServer(host, port) {
	const client = new net.Socket();

	client.on("error", (err) => {
		console.error("Error connecting to master:", err);
		client.destroy();
	});

	client.on("data", (data) => {
		console.log("Received response from master:", data.toString());
		client.end();
	});

	client.connect(port, host, () => {
		console.log("Connected to master, sending PING command...");
		const pingCommand = "*1\r\n$4\r\nPING\r\n";
		client.write(pingCommand);
	});
}

if (args.role === 'slave') {
	console.log(args.masterHost, args.masterPort)
	pingServer(args.masterHost, args.masterPort);
};

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
