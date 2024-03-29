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
	console.log('1-Attempting to connect to master', masterHost, masterPort);

	const client = net.createConnection(masterPort, masterHost, () => {
		console.log('2-connected to master');
		client.write(`*1${CRLF}$4${CRLF}PING${CRLF}`);

		client.on('data', (data) => {
			const response = data.toString();

			if (response === `+PONG${CRLF}`) {
				console.log('3-Master replied to syn PING');
				steps.ping = true;
				console.log('4-Sending REPLCONF listening-port', redisServerMetadata.port);
				client.write(`*3${CRLF}$8${CRLF}REPLCONF${CRLF}$14${CRLF}listening-port${CRLF}$4${CRLF}${redisServerMetadata.port}${CRLF}`);
			}

			else if (response === `+OK${CRLF}`) {
				if (!steps.replconfPort) {
					console.log('5-Master replied to REPLCONF');
					steps.replconfPort = true;
					console.log('6-Sending REPLCONF capa psync2');
					client.write(`*3${CRLF}$8${CRLF}REPLCONF${CRLF}$4${CRLF}capa${CRLF}$6${CRLF}psync2${CRLF}`);
				}
				else if (!steps.replconfCapa) {
					console.log('7-Master replied to REPLCONF capa');
					steps.replconfCapa = true;
					console.log('8-Sending PSYNC ? -1');
					client.write(`*3${CRLF}$5${CRLF}PSYNC${CRLF}$1${CRLF}?${CRLF}$2${CRLF}-1${CRLF}`);
				}
			}
			else if (response === `+FULLRESYNC ${redisServerMetadata.master_replid} ${redisServerMetadata.master_repl_offset}${CRLF}`) {
				console.log('9-Master replied to PSYNC');
				steps.psync = true;
				console.log('10-Handshake complete');
				client.end();
			}
		});
	});
}

module.exports = handshake;
