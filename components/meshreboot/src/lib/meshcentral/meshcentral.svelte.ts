import {SvelteURL} from 'svelte/reactivity';
import type {
    Deferred,
    MeshData, NodeData,
} from '$lib/meshcentral/types';


class Node {
    private _data;
    private mc;

    constructor(mc: MeshcentralState, data: NodeData) {
        this.mc = mc;
        this._data = $state({
            current: data
        });
    }

    get current() {
        return this._data.current;
    }
}

class Mesh {
    private _data;
    private mc;

    constructor(mc: MeshcentralState, data: MeshData) {
        this.mc = mc;
        this._data = $state({
            current: data,
            nodes: new DeferredLoader<{ [key: string]: Node }>({
                initialData: {},
                loadFn: (obj) => {
                    this.mc.send({action: 'nodes', meshid: this._data.current._id});
                    this.mc.onSingle('nodes', ({data}) => {
                        if (this._data.current._id in data.nodes || Object.keys(data.nodes).length === 0) {
                            const newData: { [key: string]: Node } = {}
                            for (const item of data.nodes[this._data.current._id]??[]) {
                                newData[item._id] = new Node(this.mc, {...item});
                            }
                            obj.set(newData);
                        }
                    })
                }
            })
        });
    }

    async load() {
        await Promise.all([
            this._data.nodes.awaitGet()
        ]);
    }

    get current() {
        return this._data.current;
    }

    get nodes() {
        return this._data.nodes.get();
    }
}

class DeferredLoader<T> {
    private loadFn: (obj: DeferredLoader<T>) => void;
    private promise: Promise<T>;
    private resolve?: (value: PromiseLike<T> | T) => void;
    private reject?: (reason?: any) => void;
    private loading: boolean;
    private _data: T;

    constructor(initArgs: { loadFn: (obj: DeferredLoader<T>) => void, initialData: T }) {
        this.loadFn = initArgs.loadFn;
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        })
        this._data = $state(initArgs.initialData);
        this.loading = false;
    }

    async awaitGet() {
        this.load();
        return this.promise;
    }

    private load() {
        if (!this.loading) {
            this.loading = true;
            this.loadFn(this);
        }
    }

    refresh() {
        this.loading = false;
        this.load();
    }

    set(data: T) {
        this._data = data;
        if (this.resolve) {
            this.resolve(data);
        }
    }

    get(): T {
        this.load();
        return this._data;
    }
}

class MeshcentralState {
    private ws?: WebSocket;
    private url?: URL;
    private authCookie?: string;
    private pingTimer?: number;
    private sendQueue: object[] = [];
    private connected: boolean = false;
    private handlers: {
        [key: string]: ((data: any) => void)[];
    } = {};
    private oneshotHandlers: {
        [key: string]: ((data: any) => void)[];
    } = {}


    private _data;

    get meshes() {
        return this._data.meshes.get();
    }

    // Wait for everything to load
    async load() {
        await Promise.all([
            this._data.meshes.awaitGet()
        ])
    }

    constructor() {
        this._data = $state({
            meshes: new DeferredLoader<{ [key: string]: Mesh }>({
                loadFn: (obj) => {
                    this.send({action: 'meshes'});
                    this.onSingle('meshes', ({data}) => {
                            const newData: { [key: string]: Mesh } = {}
                            for (const item of data.meshes) {
                                newData[item._id] = new Mesh(this, {...item});
                            }
                            obj.set(newData);
                        }
                    )
                },
                initialData: {},
            })
        });

        this.on('serverinfo', (data) => this.handleServerInfo(data));
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

    connect(url: URL, authCookie?: string) {
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
            this.send({action: 'ping'});
        }, 29000);
    }

    on(action: string, fn: (opts: { data: any, remove: () => void }) => void) {
        if (!this.handlers[action]) {
            this.handlers[action] = [];
        }
        this.handlers[action].push(fn);
    }

    onSingle(action: string, fn: (opts: { data: any }) => void) {
        if (!this.oneshotHandlers[action]) {
            this.oneshotHandlers[action] = [];
        }
        this.oneshotHandlers[action].push(fn);
    }

    handleServerInfo(data: any) {
        this.connected = true;
        this._sendQueue();
    }


    handleMessage(message: string) {
        let data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            return;
        }
        for (const fn of this.handlers[data.action] ?? []) {
            fn({
                data: data,
                remove: () => {
                    this.handlers[data.action] = this.handlers[data.action].filter(item => fn != item);
                }
            });
        }
        // One Shot handlers remove themselves
        if ((data.action in this.oneshotHandlers) && (this.oneshotHandlers[data.action].length > 0)) {
            const fn = this.oneshotHandlers[data.action].shift();
            if (fn) {
                fn({
                    data: data,
                })
            }
        }
    }

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
    handleClose() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            delete this.pingTimer;
        }
        delete this.ws;
        this.connected = false;
    }

    send(data: object) {
        this.sendQueue.push(data);
        this._sendQueue();
    }

    _sendQueue() {
        if (this.ws && this.connected) {
            for (const item of this.sendQueue) {
                this.ws.send(JSON.stringify(item));
            }
            this.sendQueue = [];
        }
    }

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
