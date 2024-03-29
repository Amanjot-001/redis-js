const CRLF = require('./crlf');

function bulkString(resArray) {
	const length = resArray.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0);
	return `$${length}${CRLF}${resArray.join(CRLF)}${CRLF}`;
}

function simpleString(resArray) {
	return `+${resArray.join(' ')}${CRLF}`;
}

const OK = `+OK${CRLF}`;

const NULL = `$-1${CRLF}`;

const PONG = `+PONG${CRLF}`;

module.exports = { bulkString, simpleString, OK, NULL, PONG };
