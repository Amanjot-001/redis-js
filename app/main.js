const net = require("net");
const ReqParser = require('./parser');
const Storage = require('./storage');
const store = new Storage();

console.log("Logs from your program will appear here!");

const server = net.createServer((connection) => {
    connection.on('data', data => {
        const request = data.toString().trim();
        const parser = new ReqParser(request);
        const commands = parser.parse();

        if (commands.length > 0) {
            const cmd = commands[0].toLowerCase();
            let response = '';

            switch (cmd) {
                case 'echo':
                    const EchoStr = commands[1];
                    response = `$${EchoStr.length}\r\n${EchoStr}\r\n`;
                    connection.write(response);
                    break;

                case 'set':
                    var keyStr = commands[1];
                    const valueStr = commands[2];
                    store.set(keyStr, valueStr);
                    response = '+OK\r\n';
                    connection.write(response);
                    break;

                case 'get':
                    var keyStr = commands[1];
                    const value = store.get(keyStr);
                    if (value !== undefined) {
                        response = `$${value.length}\r\n${value}\r\n`;
                    } else {
                        response = '$-1\r\n';
                    }
                    connection.write(response);
                    break;

                default:
                    connection.write('+PONG\r\n');
            }
        }
        else
            connection.write('+PONG\r\n');
    });
});

server.listen(6379, "127.0.0.1");
