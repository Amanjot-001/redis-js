const Storage = require('./storage');
const { wrongNoOfArgs, syntaxError } = require('./error')

class Controller {
	constructor() {
		this.store = new Storage();
	}

	handleReq(commands, serverArgs) {
		let response = '';

		switch (commands[0].toLowerCase()) {
			case 'ping':
				if (commands.length > 2) {
					response = `-ERR ${wrongNoOfArgs(commands[0])}\r\n`;
					break;
				}
				response = commands[1] ? `+${commands[1]}\r\n` : '+PONG\r\n';
				break;

			case 'echo':
				if (commands.length > 2) {
					response = `-ERR ${wrongNoOfArgs(commands[0])}\r\n`;
					break;
				}
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
				if (commands.length > 2) {
					response = `-ERR ${wrongNoOfArgs(commands[0])}\r\n`;
					break;
				}
				var keyStr = commands[1];
				var object = this.store.get(keyStr);
				if (object !== undefined && (object.expiration === -1 || object.expiration > new Date().getTime())) {
					response = `$${object.value.length}\r\n${object.value}\r\n`;
				} else {
					response = '$-1\r\n';
				}
				break;

			case 'info':
				var argument = commands[1].toLowerCase();
				if (argument === 'replication') {
					const heading = '# Replication';
					const currentRole = `role:${serverArgs.role}`;
					const replid = `master_replid:${serverArgs.master_replid}`;
					const replOffset = `master_repl_offset:${serverArgs.master_repl_offset}`;
					const totalLength = heading.length + currentRole.length + replid.length + replOffset.length + 6;
					response = `$${totalLength}\r\n${heading}\r\n${currentRole}\r\n${replid}\r\n${replOffset}\r\n`;
				}
				break;

			case 'replconf':
				if (commands.length !== 3) {
					response = `-ERR ${wrongNoOfArgs(commands[0])}\r\n`;
					break;
				}
				if (commands[1].toLowerCase() === 'listening-port') {
					if (parseInt(commands[2]) < 0 && parseInt(commands[2]) > 65535) {
						response = `-ERR value is not an integer or out of range\r\n`;
						break;
					}
					response = '+OK\r\n';
				}
				else if (commands[1].toLowerCase() === 'capa') {
					response = '+OK\r\n';
				}
				else
					response = `-ERR Unrecognized REPLCONF option: ${commands[1]}\r\n`;
				break;

			default:
				const args = [];
				for (let i = 1; i < commands.length; i++) {
					args.push(commands[i]);
				}
				response = `-ERR unknown command '${commands[0]}', with args beginning with: ${args.join(', ')}\r\n`;
				break;
		}

		return response;
	}
}

module.exports = Controller;
