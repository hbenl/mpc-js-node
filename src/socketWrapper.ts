import * as net from 'net';
import { SocketWrapper } from 'mpc-js-core';

interface Deferred {
	resolve: () => void;
	reject: (err: any) => void;
}

export class TcpSocketWrapper implements SocketWrapper {

	private hostname: string;
	private port: number;
	private socket?: net.Socket;
	private deferred?: Deferred;

	constructor(hostname: string, port: number) {
		this.hostname = hostname;
		this.port = port;
	}

	connect(receive: (msg: string) => void, emit?: (eventName: string, arg?: any) => void): Promise<void> {

		this.socket = net.connect(this.port, this.hostname);
		this.socket.setEncoding('utf8');

		let promise = new Promise<void>((resolve, reject) => {
			this.deferred = { resolve, reject };
		});

		this.socket.on('data', (msg: string) => {
			if (this.deferred) {
				this.deferred.resolve();
				this.deferred = undefined;
			}
			receive(msg);
		});

		this.socket.on('error', (err) => {
			if (this.deferred) {
				this.deferred.reject(err);
				this.deferred = undefined;
			}
			if (emit) {
				emit('socket-error', err);
			}
		});

		this.socket.on('end', () => {
			if (this.deferred) {
				this.deferred.reject(new Error('Socket closed by server'));
				this.deferred = undefined;
			}
			if (emit) {
				emit('socket-end');
			}
		});

		return promise;
	}

	send(msg: string): void {
		this.socket.write(msg);
	}

	disconnect(): void {
		this.socket.removeAllListeners();
		this.socket.end();
		this.socket = undefined;
	}
}

export class UnixSocketWrapper implements SocketWrapper {

	private path: string;
	private socket?: net.Socket;
	private deferred?: Deferred;

	constructor(path: string) {
		this.path = path;
	}

	connect(receive: (msg: string) => void, emit?: (eventName: string, arg?: any) => void): Promise<void> {

		this.socket = net.connect(this.path);
		this.socket.setEncoding('utf8');

		let promise = new Promise<void>((resolve, reject) => {
			this.deferred = { resolve, reject };
		});

		this.socket.on('data', (msg: string) => {
			if (this.deferred) {
				this.deferred.resolve();
				this.deferred = undefined;
			}
			receive(msg);
		});

		this.socket.on('error', (err) => {
			if (this.deferred) {
				this.deferred.reject(err);
				this.deferred = undefined;
			}
			if (emit) {
				emit('socket-error', err);
			}
		});

		this.socket.on('end', () => {
			if (this.deferred) {
				this.deferred.reject(new Error('Socket closed by server'));
				this.deferred = undefined;
			}
			if (emit) {
				emit('socket-end');
			}
		});

		return promise;
	}

	send(msg: string): void {
		this.socket.write(msg);
	}

	disconnect(): void {
		this.socket.removeAllListeners();
		this.socket.end();
		this.socket = undefined;
	}
}
