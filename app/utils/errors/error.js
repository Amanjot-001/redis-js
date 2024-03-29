const { CRLF } = require('../common');

const wrongNoOfArgs = (command) => {
    return `-ERR wrong number of arguments for '${command}' command${CRLF}`;
}

const syntaxError = (command) => {
    return `syntax error`;
}

const unknownCMD = (errArray) => {
	return `-ERR ${errArray[0]}: ${errArray[1]}${CRLF}`;
}

function defaultError(err) {
	return `-ERR ${err}${CRLF}`;
}

module.exports = {
    wrongNoOfArgs,
    syntaxError,
	unknownCMD,
	defaultError
}