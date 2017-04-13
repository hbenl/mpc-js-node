import { MPCCore } from 'mpc-js-core';
import { TcpSocketWrapper, UnixSocketWrapper } from "./socketWrapper";

export class MPC extends MPCCore {

	public connectTCP(hostname: string = 'localhost', port: number = 6600): void {
		this.connect(new TcpSocketWrapper(hostname, port));
	}

	public connectUnixSocket(path: string): void {
		this.connect(new UnixSocketWrapper(path));
	}

}
