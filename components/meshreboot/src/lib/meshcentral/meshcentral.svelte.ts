import { SvelteURL } from 'svelte/reactivity';
import type { MeshData, NodeData, ServerInfo, UserInfo } from '$lib/meshcentral/types';
import { DeferredLoader } from '$lib/meshcentral/utils.svelte';
import { AgentRedirWs } from '$lib/meshcentral/agent_redir_ws';

export class Node {
    private _data;
    private mc;
    private mesh: Mesh;
    private desk?;
    public loaded : boolean = $state(false);

    constructor(mc: MeshcentralState, mesh: Mesh, data: NodeData) {
        this.mc = mc;
        this.mesh = mesh;
        this._data = $state({
            current: data,
        });
        this.mc.on('event', this, ({ data }) => {
            switch (data.event.action) {
                case 'changenode':
                    if (data.event.node._id == this.current._id) {
                        this._data.current = {
                            ...this._data.current,
                            ...data.event.node,
                        };
                    }
                    break;
                case 'devicesessions':
                    if (data.event.nodeid == this.current._id) {
                        this._data.current.sessions = data.event.sessions;
                    }
                    break;
            }
        });
    }

    get current() {
        return this._data.current;
    }

    async load() {
        this.loaded = true;
    }

    hide() {
        if (this.desk) {
            this.desk.disconnect();
        }
    }

    show(id: string) {
        const element = document.getElementById(id);
        if (!element) {
            return;
        }

        // @ts-ignore
        let module = CreateAgentRemoteDesktop(element);
        module.ImageType = 4;
        module.CompressionLevel = 100;
        module.ScalingLevel = 1024;
        module.mouseCursorActive(true);
        //module.FrameRateTimer = 1000;

        // Monkey patch a bug - TODO Remove when fixed upstream
        module.GrabKeyInput = function () {
            if (module.xxKeyInputGrab == true) return;
            document.onkeyup = module.xxKeyUp;
            document.onkeydown = module.xxKeyDown;
            document.onkeypress = module.xxKeyPress;
            module.xxKeyInputGrab = true;
        };

        this.desk = new AgentRedirWs({ module: module, node: this, mc: this.mc });

        this.desk.connect();

        module.GrabMouseInput();
        module.GrabKeyInput();
    }
}

export class Mesh {
    private _data;
    private mc;
    public loaded: boolean = $state(false);

    constructor(mc: MeshcentralState, data: MeshData) {
        this.mc = mc;
        this.mc.on('event', this, ({ data }) => {
            switch (data.event.action) {
                case 'meshchange':
                    if (data.event.meshid == this._data.current._id) {
                        this._data.current = {
                            ...this._data.current,
                            name: data.event.name,
                            mtype: data.event.mtype,
                            desc: data.event.desc,
                            flags: data.event.flags,
                            consent: data.event.consent,
                            links: data.event.links,
                            amt: data.event.amt,
                            invite: data.event.invite,
                            expireDevs: data.event.expireDevs,
                            relayid: data.event.relayid,
                        };
                    }
                    break;
                case 'addnode':
                    if (data.event.node.meshid == this.current._id) {
                        this.nodes[data.event.node._id] = new Node(mc, this, {
                            ...data.event.node,
                        });
                    }
                    break;
                case 'removenode':
                    if (this.nodes[data.event.node._id]) {
                        delete this.nodes[data.event.node._id];
                    }
                    break;
            }
        });
        this._data = $state({
            current: data,
            nodes: new DeferredLoader<{ [key: string]: Node }>({
                initialData: {},
                loadFn: (obj) => {
                    this.mc.send({ action: 'nodes', meshid: this._data.current._id });
                    this.mc.onSingle('nodes', this, ({ data }) => {
                        if (
                            this._data.current._id in data.nodes ||
                            Object.keys(data.nodes).length === 0
                        ) {
                            const newData: { [key: string]: Node } = {};
                            for (const item of data.nodes[this._data.current._id] ?? []) {
                                newData[item._id] = new Node(this.mc, this, { ...item });
                            }
                            obj.set(newData);
                        }
                    });
                },
            }),
        });
    }

    async load() {
        await Promise.all([this._data.nodes.awaitGet()]);
        this.loaded = true;
    }

    get current() {
        return this._data.current;
    }

    set current(current) {
        this._data.current = current;
    }

    get nodes() {
        return this._data.nodes.get();
    }
}

export class MeshcentralState {
    private ws?: WebSocket;
    public url?: URL;
    public authCookie?: string;
    public authRelayCookie?: string;
    public domainUrl?: string;
    private pingTimer?: number;
    private sendQueue: object[] = [];
    private connected: boolean = false;
    public loaded: boolean = $state(false);
    private handlers: {
        [key: string]: { obj: WeakRef<any>; fn: (data: any) => void }[];
    } = {};
    private oneshotHandlers: {
        [key: string]: { obj: WeakRef<any>; fn: (data: any) => void }[];
    } = {};

    private _data: {
        meshes: DeferredLoader<{ [key: string]: Mesh }>;
        serverinfo?: ServerInfo;
        userinfo?: UserInfo;

    };

    get meshes() {
        return this._data.meshes.get();
    }

    get serverinfo() {
        return this._data.serverinfo;
    }

    get userinfo() {
        return this._data.userinfo;
    }

    // Wait for everything to load
    async load() {
        await Promise.all([this._data.meshes.awaitGet()]);
        this.loaded = true;
    }

    constructor() {
        this._data = $state({
            meshes: new DeferredLoader<{ [key: string]: Mesh }>({
                loadFn: (obj) => {
                    this.send({ action: 'meshes' });
                    this.onSingle('meshes', this, ({ data }) => {
                        const newData: { [key: string]: Mesh } = {};
                        for (const item of data.meshes) {
                            newData[item._id] = new Mesh(this, { ...item });
                        }
                        obj.set(newData);
                    });
                },
                initialData: {},
            }),
        });

        this.on('serverinfo', this, ({ data }) => {
            this.connected = true;
            this._data.serverinfo = { ...data.serverinfo };

            this._sendQueue();
        });
        this.on('userinfo', this, ({ data }) => {
            this._data.userinfo = { ...data.userinfo };
        });
        this.on('event', this, ({ data }) => {
            switch (data.event.action) {
                case 'createmesh':
                    this.meshes[data.event.mesh._id] = new Mesh(this, {
                        ...data.event.mesh,
                    });
                    break;
                case 'deletemesh':
                    delete this.meshes[data.event.meshid];
                    break;
                case 'nodemeshchange':
                    const oldMesh = this.meshes[data.event.oldMeshId];
                    const newMesh = this.meshes[data.event.newMeshId];
                    let node: Node | null = null;
                    if (oldMesh) {
                        node = oldMesh.nodes[data.event.nodeid];
                        delete oldMesh.nodes[data.event.nodeid];
                    }
                    if (newMesh) {
                        if (node) {
                            newMesh.nodes[node.current._id] = node;
                        } else {
                            newMesh.nodes[data.event.node._id] = new Node(this, newMesh, {
                                ...data.event.node,
                            });
                        }
                    }
                    break;
            }
        });
    }

    connect(initArgs: {
        url: URL;
        authCookie?: string;
        authRelayCookie?: string;
        domainUrl: string;
    }) {
        this.url = initArgs.url;
        this.authCookie = initArgs.authCookie;
        this.domainUrl = initArgs.domainUrl;
        this.authRelayCookie = initArgs.authRelayCookie;

        this._connect();
    }

    _connect() {
        if (this.ws || this.url == null) {
            return;
        }

        const url = new SvelteURL(this.url + 'control.ashx');
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
                        auth: this.authCookie,
                    },
                })
            );
        }
        this.pingTimer = setInterval(() => {
            this.send({ action: 'ping' });
        }, 29000);
    }

    on(action: string, obj: any, fn: (opts: { data: any; remove: () => void }) => void) {
        if (!this.handlers[action]) {
            this.handlers[action] = [];
        }
        this.handlers[action].push({ obj: new WeakRef(obj), fn: fn });
    }

    onSingle(action: string, obj: any, fn: (opts: { data: any }) => void) {
        if (!this.oneshotHandlers[action]) {
            this.oneshotHandlers[action] = [];
        }
        this.oneshotHandlers[action].push({ obj: new WeakRef(obj), fn: fn });
    }

    handleMessage(message: string) {
        let data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            return;
        }
        this.handlers[data.action] = this.handlers[data.action]?.filter((item) => item.obj.deref());
        for (const item of this.handlers[data.action] ?? []) {
            item.fn({
                data: data,
                remove: () => {
                    this.handlers[data.action] = this.handlers[data.action].filter(
                        (i) => i != item
                    );
                },
            });
        }
        // One Shot handlers remove themselves
        if (data.action in this.oneshotHandlers && this.oneshotHandlers[data.action].length > 0) {
            const item = this.oneshotHandlers[data.action].shift();
            if (item && item.obj.deref()) {
                item.fn({ data: data });
            }
        }
    }

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
}

export const mc = new MeshcentralState();
