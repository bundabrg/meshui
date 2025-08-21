/**
 * @description Mesh Agent Transport Module - using websocket relay
 * @author bundabrg
 *
 * This is a re-implementation of agent-redir-ws by Ylian Saint-Hilaire
 */

import { Node, MeshcentralState } from '$lib/meshcentral/meshcentral.svelte';

interface Module {
    protocol: number;
    parent?: AgentRedirWs;
    xxStateChange: (state: number) => void;
    ProcessBinaryCommand: () => void;
}

export class AgentRedirWs {
    private ws?: WebSocket;
    private module: Module;
    private node: Node;
    private tunnelId: string;
    private connected: boolean = false;
    private streaming: boolean = false;
    private mc: MeshcentralState;
    private sendQueue: (string | ArrayBufferLike)[] = [];
    public serverRecording: boolean = false;

    constructor(initArgs: { module: Module; node: Node; mc: MeshcentralState }) {
        this.module = initArgs.module;
        this.module.parent = this;
        this.node = initArgs.node;
        this.tunnelId = Math.random().toString(36).substring(2);
        this.mc = initArgs.mc;
    }

    connect() {
        if (this.ws || !this.mc.url) {
            return;
        }

        const url = new URL(this.mc.url + 'meshrelay.ashx');
        url.searchParams.append('browser', '1');
        url.searchParams.append('p', String(this.module.protocol));
        url.searchParams.append('nodeid', this.node.current._id);
        url.searchParams.append('id', this.tunnelId);

        if (this.mc.authCookie) {
            url.searchParams.append('auth', this.mc.authCookie);
        }

        this.ws = new WebSocket(url);
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
            this.handleOpen();
        };
        this.ws.onclose = () => {
            this.handleClose();
        };
        this.ws.onmessage = (e: MessageEvent) => {
            this.handleMessage(e);
        };

        this.module.xxStateChange(1);

        let rurl =
            '*' +
            this.mc.domainUrl +
            'meshrelay.ashx?p=' +
            this.module.protocol +
            '&nodeid=' +
            this.node.current._id +
            '&id=' +
            this.tunnelId +
            '&rauth=' +
            this.mc.authRelayCookie;
        this.mc.send({
            action: 'msg',
            type: 'tunnel',
            nodeid: this.node.current._id,
            value: rurl,
            usage: this.module.protocol,
        });
    }

    setConsoleMessage(str: string, id?: string, args?, timeout?) {
        console.log({ str, id, args, timeout });
    }

    sendMsg(data: object) {
        this.send(JSON.stringify(data));
    }

    send(data: string | ArrayBufferLike | number) {
        if (typeof data == 'number') {
            data = data.toString();
        }

        if (typeof data == 'string') {
            var b = new Uint8Array(data.length);
            for (var i = 0; i < data.length; ++i) {
                b[i] = data.charCodeAt(i);
            }
            this.sendQueue.push(b.buffer);
        } else {
            this.sendQueue.push(data);
        }

        this._sendQueue();
    }

    _sendQueue() {
        if (this.ws && this.connected) {
            for (const item of this.sendQueue) {
                this.ws.send(item);
            }
            this.sendQueue = [];
        }
    }

    disconnect() {
        if (!this.ws) {
            return;
        }

        this.sendMsg({ ctrlChannel: '102938', type: 'close' });
        this.ws.close();
    }

    handleOpen() {
        // TODO: Measure Latency
        this.connected = true;
        this._sendQueue();

        this.module.xxStateChange(2);
    }

    handleClose() {
        this.connected = false;
        delete this.ws;

        this.module.Stop();
    }

    cmdAccCmd = 0;
    cmdAccCmdSize = 0;
    cmdAccLen = 0;
    cmdAcc = [];

    handleMessage(e: MessageEvent) {
        if (!this.streaming) {
            if (e.data == 'c' || e.data == 'cr') {
                if (e.data == 'cr') {
                    this.serverRecording = true;
                }
                this.send(this.module.protocol);
                this.streaming = true;

                this.module.xxStateChange(3);
            }
            return;
        }

        if (typeof e.data == 'string') {
            if (e.data[0] == '~') {
                this.module.ProcessData(e.data); // TODO no ProcessData??
            } else {
                console.log('Control cmd: ' + e.data);
            }
            return;
        }

        // Send the data to the module
        if (this.module.ProcessBinaryCommand) {
            // If only 1 byte
            if (this.cmdAccLen == 0 && e.data.byteLength < 4) return; // Ignore any commands less than 4 bytes.

            // Send as Binary Command
            if (this.cmdAccLen != 0) {
                // Accumulator is active
                var view = new Uint8Array(e.data);
                this.cmdAcc.push(view);
                this.cmdAccLen += view.byteLength;
                //console.log('Accumulating', cmdAccLen);
                if (this.cmdAccCmdSize <= this.cmdAccLen) {
                    var tmp = new Uint8Array(this.cmdAccLen),
                        tmpPtr = 0;
                    for (var i in this.cmdAcc) {
                        tmp.set(this.cmdAcc[i], tmpPtr);
                        tmpPtr += this.cmdAcc[i].byteLength;
                    }
                    //console.log('AccumulatorCompleted');
                    this.module.ProcessBinaryCommand(this.cmdAccCmd, this.cmdAccCmdSize, tmp);
                    ((this.cmdAccCmd = 0),
                        (this.cmdAccCmdSize = 0),
                        (this.cmdAccLen = 0),
                        (this.cmdAcc = []));
                }
            } else {
                // Accumulator is not active
                var view = new Uint8Array(e.data),
                    cmd = (view[0] << 8) + view[1],
                    cmdsize = (view[2] << 8) + view[3];
                if (cmd == 27 && cmdsize == 8) {
                    cmd = (view[8] << 8) + view[9];
                    cmdsize = (view[5] << 16) + (view[6] << 8) + view[7];
                    view = view.slice(8);
                }
                //console.log(cmdsize, view.byteLength);
                if (cmdsize != view.byteLength) {
                    //console.log('AccumulatorRequired', cmd, cmdsize, view.byteLength);
                    this.cmdAccCmd = cmd;
                    this.cmdAccCmdSize = cmdsize;
                    ((this.cmdAccLen = view.byteLength), (this.cmdAcc = [view]));
                } else {
                    this.module.ProcessBinaryCommand(cmd, cmdsize, view);
                }
            }
        } else if (this.module.ProcessBinaryData) {
            // Send as Binary
            this.module.ProcessBinaryData(new Uint8Array(e.data));
        } else {
            // Send as Text
            if (e.data.byteLength < 16000) {
                // Process small data block
                this.module.ProcessData(String.fromCharCode.apply(null, new Uint8Array(e.data))); // This will stack overflow on Chrome with 100k+ blocks.
            } else {
                // Process large data block
                var bb = new Blob([new Uint8Array(e.data)]),
                    f = new FileReader();
                let self = this;
                f.onload = function (e) {
                    self.module.ProcessData(e.target.result);
                };
                f.readAsBinaryString(bb);
            }
        }
    }
}
