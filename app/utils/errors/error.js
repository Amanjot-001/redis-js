const wrongNoOfArgs = (command) => {
    return `wrong number of arguments for '${command}' command`;
}

const syntaxError = (command) => {
    return `syntax error`;
}

module.exports = {
    wrongNoOfArgs,
    syntaxError
}