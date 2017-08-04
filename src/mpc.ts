import { MPCCore } from 'mpc-js-core';
import { TcpSocketWrapper, UnixSocketWrapper } from "./socketWrapper";

export class MPC extends MPCCore {

	public connectTCP(hostname: string = 'localhost', port: number = 6600): Promise<void> {
		return this.connect(new TcpSocketWrapper(hostname, port));
	}

	public connectUnixSocket(path: string): Promise<void> {
		return this.connect(new UnixSocketWrapper(path));
	}

}
