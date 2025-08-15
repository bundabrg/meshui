import { SvelteURL } from 'svelte/reactivity';

type ServerInfo = {
	domain: string;
	name: string;
	mpsname: string;
	port: number;
	emailcheck: boolean;
	domainauth: boolean;
	serverTime: number;
	features: number;
	feature2: number;
	languages: string[];
	tlshash: string;
	agentCertHash: string;
	https: boolean;
	redirport: number;
	magenturl: string;
	domainsuffix: string;
	logoutonidlesessiontimeout: boolean;
	manageAllDeviceGroups: boolean;
	certExpire: number;
	linuxshell: string;
	[propName: string]: unknown;
};

type UserInfo = {
	_id: string;
	name: string;
	email: string;
	creation: number;
	login: number;
	access: number;
	siteadmin: number;
	links: {
		[key: string]: {
			rights: number;
		};
	};
	otpsecret: number;
	emailVerified: boolean;
	otpkeys: number;
	pastlogin: number;
	[propName: string]: unknown;
};

type ServerStats = {
	totalmem: number;
	freemem: number;
	cpuavg: number[];
	availablemem: number;
	values: {
		ServerState: {
			UserAccounts: number;
			DeviceGroups: number;
			AgentSessions: number;
			ConnectedUsers: number;
			RelaySessions: number;
			RelayCount: number;
			ConnectedIntelAMT: number;
			ConnectedIntelAMTCira: number;
		};
	};
};

type Mesh = {
	type: 'mesh';
	_id: string;
	name: string;
	mtype: number;
	desc: string;
	domain: string;
	links: {
		[key: string]: {
			name: string;
			rights: number;
		};
	};
	creation: number;
	creatorid: string;
	creatorname: string;

	nodes: Node[];
};

type Node = {
	type: 'node';
	mtype: number;
	_id: string;
	icon: number;
	name: string;
	rname: string;
	domain: string;
	agent: {
		ver: number;
		id: number;
		caps: number;
		core: string;
		root: boolean;
	};
	host: string;
	ip: string;
	osdesc: string;
	users: unknown;
	lusers: unknown;
	lastbootuptime: number;
	conn: number;
	pwr: number;
	agct: number;
};

class MeshcentralState {
	ws: WebSocket | null = null;
	url: URL | null = null;
	authCookie: string | null = null;
	pingTimer: number | null = null;

	serverInfo?: ServerInfo = $state();
	userInfo?: UserInfo = $state();
	serverStats?: ServerStats = $state();
	meshes: Mesh[] = $state([]);

	connect(url: URL, authCookie: string | null = null) {
		this.url = url;
		this.authCookie = authCookie;

		this._connect();
	}

	_connect() {
		if (this.ws || this.url == null) {
			return;
		}

		const url = new SvelteURL(this.url);
		if (this.authCookie) {
			url.searchParams.append('moreargs', '1');
		}
		this.ws = new WebSocket(url);
		this.ws.onopen = () => {
			this.handleOpen();
		};
		this.ws.onclose = () => {
			this.handleClose();
		};
		this.ws.onmessage = (e: MessageEvent) => {
			this.handleMessage(e.data);
		};
	}

	disconnect() {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
	}

	handleOpen() {
		if (this.authCookie) {
			this.ws?.send(
				JSON.stringify({
					action: 'urlargs',
					args: {
						auth: this.authCookie
					}
				})
			);
		}
		this.pingTimer = setInterval(() => {
			this.send({ action: 'ping' });
		}, 29000);
	}

	handleMessage(message: string) {
		let data;
		try {
			data = JSON.parse(message);
		} catch (e) {
			return;
		}

		switch (data.action) {
			case 'serverinfo':
				this.serverInfo = { ...data.serverinfo };
				this.send({ action: 'usergroups' });
				this.send({ action: 'meshes' });
				this.send({ action: 'loginTokens' });
				break;
			case 'userinfo':
				this.userInfo = { ...data.userinfo };
				break;
			case 'serverstats':
				this.serverStats = { ...data.serverstats };
				break;
			case 'meshes':
				this.meshes = [];
				for (const item of data.meshes) {
					this.meshes.push({ ...item });
				}
				break;
		}
	}

	handleClose() {
		if (this.pingTimer) {
			clearInterval(this.pingTimer);
			this.pingTimer = null;
		}
	}

	send(data: object) {
		if (this.ws) {
			this.ws.send(JSON.stringify(data));
		}
	}
}

export const mc = new MeshcentralState();
