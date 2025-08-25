export type ServerInfo = {
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
    // [propName: string]: unknown;
};

export type UserInfo = {
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
    // [propName: string]: unknown;
};

export type ServerStats = {
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

export type MeshData = {
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
    flags: unknown;
    consent: unknown;
    amt: unknown;
    invite: unknown;
    expireDevs: unknown;
    relayid: unknown;
};

export type NodeData = {
    type: 'node';
    mtype: number;
    _id: string;
    icon: number;
    name: string;
    desc: string;
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
    users: string[];
    lusers: string[];
    lastbootuptime: number;
    conn: number;
    pwr: number;
    agct: number;
    sessions: {
        [key: string]: {
            [key: string]: number;
        };
    };
};

export type BaseEvent = {
    etype: string;
};

export type BaseNodeEvent = BaseEvent & {
    etype: 'node';
    action: string;
    nodeid: string;
    domain: string;
    nolog: number;
};

export type NodeDeviceSessionsEvent = BaseNodeEvent & {
    action: 'devicesessions';
    sessions?: {
        [key: string]: {
            [key: string]: number;
        };
    };
};

export type NodeChangeEvent = BaseNodeEvent & {
    action: 'changenode';
    userid: string;
    username: string;
    msg: string;
    node: Node;
    msgid: number;
    msgArgs: unknown;
};

export type NodeEvent = NodeDeviceSessionsEvent | NodeChangeEvent;

export type BaseMeshEvent = BaseEvent & {
    etype: 'mesh';
    meshid: string;
    action: string;
    domain: string;
};

export type MeshChangeEvent = BaseMeshEvent & {
    action: 'meshchange';
    userid: string;
    username: string;
    msgid: number;
    msgArgs: unknown;
    msg: string;
    time: string;
    name: string;
    mtype: number;
    desc: string;
};
export type MeshEvent = MeshChangeEvent;

export type Event = NodeEvent | MeshEvent;

export interface Deferred<T> {
    promise: Promise<T>;
    resolve(value: T): void;
}

export type State = {
    meshes: {
        loaded?: boolean;
        data: {
            [key: string]: MeshData;
        };
    };
};
