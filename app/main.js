const net = require("net");
const ReqParser = require('./parser');
const Controller = require('./controller');

const controller = new Controller();

console.log("Logs from your program will appear here!");

const portIndex = process.argv.findIndex(e => e.includes('--port'));
const port = portIndex !== -1 ? process.argv[portIndex + 1] : 6379;

const server = net.createServer((connection) => {
    connection.on('data', data => {
        const request = data.toString().trim();
        const parser = new ReqParser(request);
        const commands = parser.parse();

        const response = controller.handleReq(commands);

        connection.write(response);
    });
});

server.listen(port, "127.0.0.1");
