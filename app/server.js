class Server {
	constructor() {
		this.port;
		this.masterHost;
		this.masterPort;
		this.role;
		this.replid = this._generateReplicationID();
		this.replOffset = 0;
	}

	_generateReplicationID() {
		let id = '8371b4fb1155b71f4a04d3e1bc3e18c4a990aeeb';
		return id;
	}

	extractArgs() {
		const portIndex = process.argv.findIndex(e => e.includes('--port'));
		this.port = portIndex !== -1 ? process.argv[portIndex + 1] : 6379;

		const replicaIndex = process.argv.findIndex(e => e.includes('--replicaof'));
		this.masterHost = replicaIndex !== 1 ? process.argv[replicaIndex + 1] : null;
		this.masterPort = replicaIndex !== -1 ? process.argv[replicaIndex + 2] : null;
		this.role = (this.masterHost && this.masterPort) ? 'slave' : 'master';

		return {
			port: this.port,
			role: this.role,
			master_replid: this.replid,
			master_repl_offset: this.replOffset,
			masterHost: this.masterHost,
			masterPort: this.masterPort
		}
	}
}

module.exports = Server;
