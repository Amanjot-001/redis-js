const Storage = require('./storage');

class Controller {
    constructor() {
        this.store = new Storage();
    }

    handleReq(commands) {
        let response = '';

        switch (commands[0].toLowerCase()) {
            case 'ping':
                response = '+PONG\r\n';
                break;

            case 'echo':
                const EchoStr = commands[1];
                response = `$${EchoStr.length}\r\n${EchoStr}\r\n`;
                break;

            case 'set':
                var keyStr = commands[1];
                var valueStr = commands[2];
                let expiration = -1;
                if (commands.length > 4 && commands[3].toLowerCase() === 'px') {
                    expiration = new Date().getTime() + parseInt(commands[4]);
                }
                this.store.set(keyStr, valueStr, expiration);
                response = '+OK\r\n';
                break;

            case 'get':
                var keyStr = commands[1];
                var object = this.store.get(keyStr);
                if (object !== null && (object.expiration === -1 || object.expiration > new Date().getTime())) {
                    response = `$${object.value.length}\r\n${object.value}\r\n`;
                } else {
                    response = '$-1\r\n';
                }
                break;

            case 'info':
                var argument = commands[1].toLowerCase();
                if (argument === 'replication') {
                    const heading = '# Replication';
                    const role = 'role:master';
                    response = `$${role.length}\r\n${role}\r\n`;
                }
                break;

            default:
                response = '+err\r\n';
        }

        return response;
    }
}

module.exports = Controller;
