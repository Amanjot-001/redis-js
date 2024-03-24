const net = require("net");
const ReqParser = require('./parser');

console.log("Logs from your program will appear here!");

const server = net.createServer((connection) => {
    connection.on('data', data => {
        const request = data.toString().trim();
        const parser = new ReqParser(request);
        const cmd = parser.parse();

        if(cmd.length > 0 && cmd[0].toLowerCase() === 'echo') {
            const EchoStr = cmd[1];
            const response = `$${EchoStr.length}\r\n${EchoStr}\r\n`;
            connection.write(response);
        }
        else
            connection.write('+PONG\r\n');
    });
});

server.listen(6379, "127.0.0.1");
