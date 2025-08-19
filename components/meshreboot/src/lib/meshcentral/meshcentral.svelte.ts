import { SvelteURL } from 'svelte/reactivity';
import type {
	MeshData,
} from '$lib/meshcentral/types';

// class DeferredPromise<T> implements Deferred<T> {
// 	promise: Promise<T>;
// 	private originalResolve?: (value: PromiseLike<T> | T) => void;
//
// 	constructor() {
// 		this.promise = new Promise((resolve) => {
// 			this.originalResolve = resolve;
// 		});
// 	}
//
// 	resolve(value: T): void {
// 		if (this.originalResolve) {
// 			this.originalResolve(value);
// 		}
// 	}
// }

class Mesh {
	private mc: MeshcentralState;
	public data: MeshData;
	private loaded: boolean = false;

	constructor(mc: MeshcentralState, data: MeshData) {
		this.mc = mc;
		this.data = $state(data);

		setTimeout(() => {
			this.data.name='changed';
			console.log("changed again");
		}, 2000);
	}
}

class Meshes {
	private mc: MeshcentralState;
	private _meshes: {
		[key: string]: Mesh
	}
	public loaded: boolean = false;

	constructor(mc: MeshcentralState) {
		this.mc = mc;
		this._meshes = $state({});
	}

	meshes() {
		if (!this.loaded) {
			//this.mc.send({action: 'meshes'});
			setTimeout(() => {
				this._meshes['brg1'] = new Mesh(this.mc, {name: 'brg1', _id: 'brg1'});
			},2000);
			setTimeout(() => {
				this._meshes['brg2'] = new Mesh(this.mc, {name: 'brg2', _id: 'brg2'});
			},4000);
			this.loaded = true;
		}
		return this._meshes;
	}
}

class MeshcentralState {
	private ws?: WebSocket;
	private url?: URL;
	private authCookie?: string;
	private pingTimer?: number;
	private sendQueue: object[] = [];
	private connected: boolean = false;

	public meshes: Meshes;

	constructor() {
		this.meshes = $state(new Meshes(this));
	}


	// get meshes(): { [key: string]: Mesh} {
	// 	console.log("CALLED");
	// 	if (!this.state.meshes) {
	// 		this.send({action: 'meshes'});
	// 	}
	// 	if (!this.state.meshes) {
	// 		console.log("EMPTY");
	// 		return {
	// 			'brg2': {
	// 				nodes: [],
	// 				name: 'bob2',
	// 				_id: 'brg2'
	// 			}
	// 		}
	// 	}
	// 	console.log("FULL");
	// 	return {
	// 		'brg3': {
	// 			nodes: [],
	// 			name: 'bob3',
	// 			_id: 'brg3'
	// 		}
	// 	}
	// }


	// get meshes() {
	// 	return new Promise((resolve, reject) => {
	// 		if (this.state.meshes.loaded) {
	// 			resolve(() => { return this.meshes2 });
	// 		} else {
	// 			// If no pending send we create a deferred
	// 			if (!this.state.meshes.deferred) {
	// 				this.state.meshes.deferred = new DeferredPromise();
	// 				this.send({ action: 'meshes' });
	// 			}
	// 			this.state.meshes.deferred.promise.then(() => {
	// 				resolve(() => { return this.meshes2 });
	// 			});
	// 		}
	// 	});
	// }

	// connect(url: URL, authCookie?: string) {
	// 	this.url = url;
	// 	this.authCookie = authCookie;
	//
	// 	this._connect();
	// }
	//
	// _connect() {
	// 	if (this.ws || this.url == null) {
	// 		return;
	// 	}
	//
	// 	const url = new SvelteURL(this.url);
	// 	if (this.authCookie) {
	// 		url.searchParams.append('moreargs', '1');
	// 	}
	// 	this.ws = new WebSocket(url);
	// 	this.ws.onopen = () => {
	// 		this.handleOpen();
	// 	};
	// 	this.ws.onclose = () => {
	// 		this.handleClose();
	// 	};
	// 	this.ws.onmessage = (e: MessageEvent) => {
	// 		this.handleMessage(e.data);
	// 	};
	// }
	//
	// disconnect() {
	// 	if (this.ws) {
	// 		this.ws.close();
	// 	}
	// }
	//
	// handleOpen() {
	// 	if (this.authCookie) {
	// 		this.ws?.send(
	// 			JSON.stringify({
	// 				action: 'urlargs',
	// 				args: {
	// 					auth: this.authCookie
	// 				}
	// 			})
	// 		);
	// 	}
	// 	this.pingTimer = setInterval(() => {
	// 		this.send({ action: 'ping' });
	// 	}, 29000);
	// }
	//
	// handleMessage(message: string) {
	// 	let data;
	// 	try {
	// 		data = JSON.parse(message);
	// 	} catch (e) {
	// 		return;
	// 	}
	//
	// 	switch (data.action) {
	// 		case 'serverinfo':
	// 			this.connected = true;
	// 			// this.serverInfo = { ...data.serverinfo };
	// 			// this.send({ action: 'usergroups' });
	// 			// this.send({ action: 'meshes' });
	// 			// this.send({ action: 'loginTokens' });
	// 			this._sendQueue();
	// 			break;
	// 		case 'userinfo':
	// 			// this.userInfo = { ...data.userinfo };
	// 			break;
	// 		case 'serverstats':
	// 			// this.serverStats = { ...data.serverstats };
	// 			break;
	// 		case 'meshes':
	// 			this.state.meshes = {};
	// 			for (const item of data.meshes) {
	// 				this.state.meshes[item._id] = {
	// 					nodes: [],
	// 					...item
	// 				};
	// 			}
	// 			setTimeout(() => {
	// 				this.state.meshes['brg'] = {
	// 					nodes: [],
	// 					name: 'bob',
	// 					_id: 'brg'
	// 				};
	// 			}, 2000);
	//
	// 			break;
	// 		// case 'nodes':
	// 		// 	for (const meshId in data.nodes) {
	// 		// 		if (meshId in this.meshes) {
	// 		// 			// Clear old nodes
	// 		// 			for (const nodeId of this.meshes[meshId].nodes) {
	// 		// 				delete this.nodes[nodeId];
	// 		// 			}
	// 		// 			this.meshes[meshId].nodes = [];
	// 		// 			for (const node of data.nodes[meshId]) {
	// 		// 				const nodeData: Node = { ...node };
	// 		// 				this.nodes[nodeData._id] = nodeData;
	// 		// 				this.meshes[meshId].nodes.push(node._id);
	// 		// 			}
	// 		// 			this.meshes[meshId].nodesLoaded = true;
	// 		// 		}
	// 		// 	}
	// 		// 	break;
	// 		// case 'event':
	// 		// 	this.handleMessageEvent(data.event);
	// 		// 	break;
	// 	}
	// }
	//
	// // handleMessageEvent(data: Event) {
	// // 	switch (data.etype) {
	// // 		case 'node':
	// // 			this.handleNodeEvent(data);
	// // 			break;
	// // 		case 'mesh':
	// // 			this.handleMeshEvent(data);
	// // 			break;
	// // 	}
	// // }
	// //
	// // handleNodeEvent(data: NodeEvent) {
	// // 	switch (data.action) {
	// // 		case 'devicesessions':
	// // 			if (data.nodeid in this.nodes) {
	// // 				this.nodes[data.nodeid].sessions = data.sessions ?? {};
	// // 			}
	// // 			break;
	// // 		case 'changenode':
	// // 			if (data.nodeid in this.nodes) {
	// // 				this.nodes[data.nodeid] = {
	// // 					...this.nodes[data.nodeid],
	// // 					...data.node
	// // 				};
	// // 			}
	// // 			break;
	// // 	}
	// // }
	// //
	// // handleMeshEvent(data: MeshEvent) {
	// // 	switch (data.action) {
	// // 		case 'meshchange':
	// // 			if (data.meshid in this.meshes) {
	// // 				this.meshes[data.meshid].name = data.name;
	// // 				this.meshes[data.meshid].mtype = data.mtype;
	// // 				this.meshes[data.meshid].desc = data.desc;
	// // 			}
	// // 			break;
	// // 	}
	// // }
	//
	// handleClose() {
	// 	if (this.pingTimer) {
	// 		clearInterval(this.pingTimer);
	// 		delete this.pingTimer;
	// 	}
	// 	delete this.ws;
	// 	this.connected = false;
	// }
	//
	// send(data: object) {
	// 	this.sendQueue.push(data);
	// 	this._sendQueue();
	// }
	//
	// _sendQueue() {
	// 	if (this.ws && this.connected) {
	// 		for (const item of this.sendQueue) {
	// 			this.ws.send(JSON.stringify(item));
	// 		}
	// 		this.sendQueue = [];
	// 	}
	// }
	//
	// // async getMeshes() {
	// // 	if (this.meshesLoaded) {
	// // 		return this.meshes;
	// // 	}
	// //
	// // 	// If no pending send we create a deferred
	// // 	if (!this.deferred.meshes) {
	// // 		this.deferred.meshes = new Deferred();
	// // 		this.send({ action: 'meshes' });
	// // 	}
	// // 	await this.deferred.meshes.promise;
	// //
	// // 	return this.meshes;
	// // }
	// //
	// // async getNodes(meshId?: string) {
	// // 	if (this.meshesLoaded) {
	// // 		return this.meshes;
	// // 	}
	// //
	// // 	// If no pending send we create a deferred
	// // 	if (!this.deferred.meshes) {
	// // 		this.deferred.meshes = new Deferred();
	// // 		this.send({ action: 'meshes' });
	// // 	}
	// // 	await this.deferred.meshes.promise;
	// //
	// // 	return this.meshes;
	// // }
	// //
	// // refreshNodes(meshId?: string) {
	// // 	this.send({
	// // 		action: 'nodes',
	// // 		meshid: meshId ?? '',
	// // 		skip: 0
	// // 	});
	// }
}

export const mc = new MeshcentralState();
