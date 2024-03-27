const net = require("net");
const ReqParser = require('./parser');
const Controller = require('./controller');

const controller = new Controller();

console.log("Logs from your program will appear here!");

const portIndex = process.argv.findIndex(e => e.includes('--port'));
const port = portIndex !== -1 ? process.argv[portIndex + 1] : 6379;

const replicaIndex = process.argv.findIndex(e => e.includes('--replicaof'));
const masterHost = replicaIndex !== 1 ? process.argv[replicaIndex+1] : null;
const masterPort = replicaIndex !== -1 ? process.argv[replicaIndex+2] : null;
const role = (masterHost && masterPort) ? 'slave' : 'master';

const server = net.createServer((connection) => {
    connection.on('data', data => {
        const request = data.toString().trim();
        const parser = new ReqParser(request);
        const commands = parser.parse();

        const response = controller.handleReq(commands, role);

        connection.write(response);
    });
});

server.listen(port, "127.0.0.1");
