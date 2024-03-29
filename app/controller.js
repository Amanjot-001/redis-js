const Storage = require('./storage');
const { wrongNoOfArgs, syntaxError } = require('./utils/errors/error');
const { CRLF } = require('./utils/common');

class Controller {
	constructor() {
		this.store = new Storage();
	}

	handleReq(commands, serverArgs) {
		let response = '';

		switch (commands[0].toLowerCase()) {
			case 'ping':
				if (commands.length > 2) {
					response = `-ERR ${wrongNoOfArgs(commands[0])}${CRLF}`;
					break;
				}
				response = commands[1] ? `+${commands[1]}${CRLF}` : `+PONG${CRLF}`;
				break;

			case 'echo':
				if (commands.length > 2) {
					response = `-ERR ${wrongNoOfArgs(commands[0])}${CRLF}`;
					break;
				}
				const EchoStr = commands[1];
				response = `$${EchoStr.length}${CRLF}${EchoStr}${CRLF}`;
				break;

			case 'set':
				var keyStr = commands[1];
				var valueStr = commands[2];
				let expiration = -1;
				if (commands.length > 4 && commands[3].toLowerCase() === 'px') {
					expiration = new Date().getTime() + parseInt(commands[4]);
				}
				this.store.set(keyStr, valueStr, expiration);
				response = `+OK${CRLF}`;
				break;

			case 'get':
				if (commands.length > 2) {
					response = `-ERR ${wrongNoOfArgs(commands[0])}${CRLF}`;
					break;
				}
				var keyStr = commands[1];
				var object = this.store.get(keyStr);
				if (object !== undefined && (object.expiration === -1 || object.expiration > new Date().getTime())) {
					response = `$${object.value.length}${CRLF}${object.value}${CRLF}`;
				} else {
					response = `$-1${CRLF}`;
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
					response = `$${totalLength}${CRLF}${heading}${CRLF}${currentRole}${CRLF}${replid}${CRLF}${replOffset}${CRLF}`;
				}
				break;

			case 'replconf':
				if (commands.length !== 3) {
					response = `-ERR ${wrongNoOfArgs(commands[0])}${CRLF}`;
					break;
				}
				if (commands[1].toLowerCase() === 'listening-port') {
					if (parseInt(commands[2]) < 0 && parseInt(commands[2]) > 65535) {
						response = `-ERR value is not an integer or out of range${CRLF}`;
						break;
					}
					response = `+OK${CRLF}`;
				}
				else if (commands[1].toLowerCase() === 'capa') {
					response = `+OK${CRLF}`;
				}
				else
					response = `-ERR Unrecognized REPLCONF option: ${commands[1]}${CRLF}`;
				break;

			case 'psync':
				if (commands.length !== 3) {
					response = `-ERR ${wrongNoOfArgs(commands[0])}${CRLF}`;
					break;
				}
				response = `+OK${CRLF}`;
				break;

			default:
				const args = [];
				for (let i = 1; i < commands.length; i++) {
					args.push(commands[i]);
				}
				response = `-ERR unknown command '${commands[0]}', with args beginning with: ${args.join(', ')}${CRLF}`;
				break;
		}

		return response;
	}
}

module.exports = Controller;
