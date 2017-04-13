import * as net from 'net';
import { SocketWrapper } from 'mpc-js-core';

export class TcpSocketWrapper implements SocketWrapper {

	private hostname: string;
	private port: number;
	private socket: net.Socket;

	constructor(hostname: string, port: number) {
		this.hostname = hostname;
		this.port = port;
	}

	connect(receive: (msg: string) => void) {
		this.socket = net.connect(this.port, this.hostname);
		this.socket.setEncoding('utf8');
		this.socket.on('data', (msg: string) => {
			receive(msg);
		});
	}

	send(msg: string): void {
		this.socket.write(msg);
	}

	disconnect() {
		this.socket.end();
	}
}

export class UnixSocketWrapper implements SocketWrapper {

	private path: string;
	private socket: net.Socket;

	constructor(path: string) {
		this.path = path;
	}

	connect(receive: (msg: string) => void) {
		this.socket = net.connect(this.path);
		this.socket.setEncoding('utf8');
		this.socket.on('data', (msg: string) => {
			receive(msg);
		});
	}

	send(msg: string): void {
		this.socket.write(msg);
	}

	disconnect() {
		this.socket.end();
	}
}
