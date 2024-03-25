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
                    var valueStr = commands[2];
                    let expiration = -1;
                    if (commands.length > 4 && commands[3].toLowerCase() === 'px') {
                        expiration = new Date().getTime() + parseInt(commands[4]);
                    }
                    store.set(keyStr, valueStr, expiration);
                    response = '+OK\r\n';
                    connection.write(response);
                    break;

                case 'get':
                    var keyStr = commands[1];
                    var object = store.get(keyStr);
                    if (object !== null && (object.expiration === -1 || object.expiration > new Date().getTime())) {
                        response = `$${object.value.length}\r\n${object.value}\r\n`;
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
