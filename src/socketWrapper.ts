import * as net from 'net';
import { SocketWrapper } from 'mpc-js-core';

interface Deferred {
	resolve: () => void;
	reject: (err: any) => void;
}

export class NodeSocketWrapper implements SocketWrapper {

	private socket?: net.Socket;
	private deferred?: Deferred;
	private socketListeners: [string, (arg: any) => void][] = [];

	constructor(private socketFactory: () => net.Socket) {}

	connect(receive: (msg: string) => void, emit?: (eventName: string, arg?: any) => void): Promise<void> {

		this.socket = this.socketFactory();
		this.socket.setEncoding('utf8');

		const promise = new Promise<void>((resolve, reject) => {
			this.deferred = { resolve, reject };
		});

		this.socketListeners.push(['data', (msg: string) => {
			if (this.deferred) {
				this.deferred.resolve();
				this.deferred = undefined;
			}
			receive(msg);
		}]);

		this.socketListeners.push(['error', err => {
			if (this.deferred) {
				this.deferred.reject(err);
				this.deferred = undefined;
			}
			if (emit) {
				emit('socket-error', err);
			}
		}]);

		this.socketListeners.push(['end', () => {
			if (this.deferred) {
				this.deferred.reject(new Error('Socket closed by server'));
				this.deferred = undefined;
			}
			if (emit) {
				emit('socket-end');
			}
		}]);

		this.socketListeners.forEach(socketListener =>
			this.socket.on(socketListener[0], socketListener[1]));

		return promise;
	}

	send(msg: string): void {
		this.socket.write(msg);
	}

	disconnect(): void {
		this.socketListeners.forEach(socketListener =>
			this.socket.removeListener(socketListener[0], socketListener[1]));
		this.socketListeners = [];
		this.socket.end();
		this.socket = undefined;
	}
}
