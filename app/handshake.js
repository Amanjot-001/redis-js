const net = require('net');
const { CRLF } = require('./utils/common')

function handshake(redisServerMetadata) {
	const steps = {
		ping: false,
		replconfPort: false,
		replconfCapa: false,
		psync: false
	};

	const { masterHost: masterHost, masterPort: masterPort } = redisServerMetadata;
	console.log('Attempting to connect to master', masterHost, masterPort);

	const client = net.createConnection(masterPort, masterHost, () => {
		console.log('connected to master');
		client.write(`*1${CRLF}$4${CRLF}PING${CRLF}`);

		client.on('data', (data) => {
			const response = data.toString();

			if (response === `+PONG${CRLF}`) {
				console.log('Master replied to syn PING');
				steps.ping = true;
				console.log('Sending REPLCONF listening-port', redisServerMetadata.port);
				client.write(`*3${CRLF}$8${CRLF}REPLCONF${CRLF}$14${CRLF}listening-port${CRLF}$4${CRLF}${redisServerMetadata.port}${CRLF}`);
			}

			if (response === `+OK${CRLF}`) {
				console.log('Master replied to REPLCONF');
				if (!steps.replconfPort) {
					steps.replconfPort = true;
					console.log('Sending REPLCONF capa psync2');
					client.write(`*3${CRLF}$8${CRLF}REPLCONF${CRLF}$4${CRLF}capa${CRLF}$6${CRLF}psync2${CRLF}`);
				}
				else if (!steps.replconfCapa) {
					console.log('Master replied to REPLCONF capa');
					steps.replconfCapa = true;
					console.log('Sending PSYNC ? -1');
					client.write(`*3${CRLF}$5${CRLF}PSYNC${CRLF}$1${CRLF}?${CRLF}$2${CRLF}-1${CRLF}`);
				}
				else if (!steps.psync) {
					console.log('Master replied to PSYNC');
					steps.psync = true;
					console.log('Handshake complete');
					client.end();
				}
			}
		});
	});
}

module.exports = handshake;
