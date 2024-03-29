const CRLF = require('./crlf');

function genResponse(resArray) {
	switch (resArray.length) {
		case 1:
			return `$${resArray[0].length}${CRLF}${resArray[0]}${CRLF}`;
		default:
			return '';
	}
}

const OK = `+OK${CRLF}`;

const NULL = `$-1${CRLF}`;

const PONG = `+PONG${CRLF}`;

module.exports = { genResponse, OK, NULL, PONG };
