const net = require('net');
const { CRLF } = require('./utils/common');
const { REQ } = require('./utils/common')

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
		console.log('3-Sending PING')
		client.write(REQ.Arrays(['PING']));

		client.on('data', (data) => {
			const response = data.toString();

			if (response === `+PONG${CRLF}`) {
				console.log('4-Master replied to syn PING');
				steps.ping = true;
				console.log('5-Sending REPLCONF listening-port', redisServerMetadata.port);
				client.write(REQ.Arrays(['REPLCONF', 'listening-port', redisServerMetadata.port]))
			}

			else if (response === `+OK${CRLF}`) {
				if (!steps.replconfPort) {
					console.log('6-Master replied to REPLCONF');
					steps.replconfPort = true;
					console.log('7-Sending REPLCONF capa psync2');
					client.write(REQ.Arrays(['REPLCONF', 'capa', 'psync2']));
				}
				else if (!steps.replconfCapa) {
					console.log('8-Master replied to REPLCONF capa');
					steps.replconfCapa = true;
					console.log('9-Sending PSYNC ? -1');
					client.write(REQ.Arrays(['PSYNC', '?', '-1']));
				}
			}
			else if (response === `+FULLRESYNC ${redisServerMetadata.master_replid} ${redisServerMetadata.master_repl_offset}${CRLF}`) {
				console.log('10-Master replied to PSYNC');
				steps.psync = true;
				console.log('11-Handshake complete');
			}
			else if (steps.psync && Buffer.isBuffer(data)) {
				console.log('12-received rdb file');
				// client.end();
			}
			else {
				console.log('ERROR occured while handshaking')
				client.end();
			}
		});

		client.on('end', () => {
			console.log('Connection closed');
		});

		client.on('error', (error) => {
			console.error('Connection error:', error);
		});
	});
}

module.exports = handshake;
