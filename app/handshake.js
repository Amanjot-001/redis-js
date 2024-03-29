const net = require('net');

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
		client.write('*1\r\n$4\r\nPING\r\n');

		client.on('data', (data) => {
			const response = data.toString();

			if (response === '+PONG\r\n') {
				console.log('Master replied to syn PING');
				steps.ping = true;
				console.log('Sending REPLCONF listening-port', redisServerMetadata.port);
				client.write(`*3\r\n$8\r\nREPLCONF\r\n$14\r\nlistening-port\r\n$4\r\n${redisServerMetadata.port}\r\n`);
			}

			if (response === '+OK\r\n') {
				console.log('Master replied to REPLCONF');
				if (!steps.replconfPort) {
					steps.replconfPort = true;
					console.log('Sending REPLCONF capa psync2');
					client.write(`*3\r\n$8\r\nREPLCONF\r\n$4\r\ncapa\r\n$6\r\npsync2\r\n`);
				}
				else if (!steps.replconfCapa) {
					console.log('Master replied to REPLCONF capa');
					steps.replconfCapa = true;
					console.log('Sending PSYNC ? -1');
					client.write(`*3\r\n$5\r\nPSYNC\r\n$1\r\n?\r\n$2\r\n-1\r\n`);
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
