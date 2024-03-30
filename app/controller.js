const Storage = require('./storage');
const { ERROR } = require('./utils/errors');
const { CRLF } = require('./utils/common');
const { RES } = require('./utils/common')

class Controller {
	constructor() {
		this.store = new Storage();
	}

	handleReq(commands, serverArgs) {
		let response = '';

		switch (commands[0].toLowerCase()) {
			case 'ping':
				if (commands.length > 2) {
					response = ERROR.wrongNoOfArgs(commands[0]);
					break;
				}

				response = commands[1] ? RES.bulkString(commands.splice(1)) : RES.PONG;
				break;

			case 'echo':
				if (commands.length > 2) {
					response = ERROR.wrongNoOfArgs(commands[0]);
					break;
				}
				response = RES.bulkString(commands.splice(1));
				break;

			case 'set':
				var keyStr = commands[1];
				var valueStr = commands[2];
				let expiration = -1;
				if (commands.length > 4 && commands[3].toLowerCase() === 'px') {
					expiration = new Date().getTime() + parseInt(commands[4]);
				}
				this.store.set(keyStr, valueStr, expiration);
				response = RES.OK;
				break;

			case 'get':
				if (commands.length > 2) {
					response = ERROR.wrongNoOfArgs(commands[0]);;
					break;
				}
				var keyStr = commands[1];
				var object = this.store.get(keyStr);
				if (object !== undefined && (object.expiration === -1 || object.expiration > new Date().getTime())) {
					response = RES.bulkString([object.value]);
				} else {
					response = RES.NULL;
				}
				break;

			case 'info':
				var argument = commands[1].toLowerCase();
				if (argument === 'replication') {
					const heading = '# Replication';
					const currentRole = `role:${serverArgs.role}`;
					const replid = `master_replid:${serverArgs.master_replid}`;
					const replOffset = `master_repl_offset:${serverArgs.master_repl_offset}`;

					const resArray = [heading, currentRole, replid, replOffset];
					response = RES.bulkString(resArray);
				}
				break;

			case 'replconf':
				if (commands.length !== 3) {
					response = ERROR.wrongNoOfArgs(commands[0]);
					break;
				}
				if (commands[1].toLowerCase() === 'listening-port') {
					if (parseInt(commands[2]) < 0 && parseInt(commands[2]) > 65535) {
						response = ERROR.defaultError('value is not an integer or out of range');
						break;
					}
					response = RES.OK;
				}
				else if (commands[1].toLowerCase() === 'capa') {
					response = RES.OK;
				}
				else
					response = ERROR.defaultError(`Unrecognized REPLCONF option: ${commands[1]}`)
				break;

			case 'psync':
				if (commands.length !== 3) {
					response = ERROR.wrongNoOfArgs(commands[0]);
					break;
				}
				const resArray = ['FULLRESYNC', serverArgs.master_replid, serverArgs.master_repl_offset];
				response = RES.simpleString(resArray);
				break;

			default:
				const args = [];
				for (let i = 1; i < commands.length; i++) {
					args.push(commands[i]);
				}
				const errArray = [`unknown command '${commands[0]}', with args beginning with`, args.join(', ')];
				response = ERROR.unknownCMD(errArray);
				break;
		}

		return response;
	}
}

module.exports = Controller;
