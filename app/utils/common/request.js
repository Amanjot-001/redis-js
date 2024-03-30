const { bulkString } = require('./response');
const CRLF = require('./crlf');

function Arrays(resArray) {
	let result = '';
	for (let i = 0; i < resArray.length; i++) {
		result += bulkString([resArray[i]]);
	}

	return `*${resArray.length}${CRLF}${result}`;
}

module.exports = {
	Arrays
}