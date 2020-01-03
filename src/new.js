
setInterval( () =>{
    static let syncCnt = 0
    for( sc of Session.sessions ) {
        for( s of sc.streams ) {
            if( s.sync && ( sc.now() - s.sync < 600000 || ++syncCnt % 5 === 0)) {
                const buff = new ArrayBuffer(32);
                    new Uint32Array(buff,0, 12) = [CK,0,s.ssrc]
                    (new DataView(buff)).setBigUint64(sc.now(), 12)
                session.dataPort.send(buff, s.rinfo)
            }
        }
    }}, 10000)

const pending = new Map()
pending.timer = setTimeout(()=>pending.length = 0, 10*1000)

const
CK = 0xFFFF424B,
BY = 0xFFFF4259,
RS = 0xFFFF5253,
IN = 0xFFFF394E,
OK = 0xFFFF4F4B,
NO = 0xFFFF4E4F


function SSRC(message){
    switch(message.getUint32(0)) {
        case IN: case OK: case NO: case BY: return message.getUint32(12)
        case CK: return message.getUint32(8)
        case RS: return message.getUint32(4)
        default:
            if( message.getUint8 === 'K' ) return message.getUint32(8)
            throw `Unknown message: ${message}`
    }
}

class SessMsg extends DataView {
    constructor(msg){
        super(msg)
    }
    get valid() {[IN,OK,NO,BY ].includes(this.getUint32(0)) }
    get type() {this.getUint16(2)}
    get token() {this.getUint32(8)}
    get ssrc() {this.getUint32(12)}
    get name() {new Uint8Array(this.buffer, 16)}
}


function foo(message, rinfo, port) {
    const dv = new DataView(message)
    const ype = dv.getUint32(0)
    switch ( type ) {
        case IN: //control: set up stream & ack
        case OK: //
        case NO:
        case BY:

        case CK:
            this.emit('CK', { ssrc: ,count, ts})
            break;
        case RS: // control only
            this.emit('RS', {ssrc: , seq: })
            break;
        default: // midi data

    }
}
class Session {
    static  Sessions = new Map()
    constructor(port=5004, localName, bonjourName, ipVersion) {
    streams = new Map()
    this.ssrc = Math.round(Math.random() * 0xFFFFFFFF);
    this.controlChannel = dgram.createSocket(`udp${ipVersion}`)
    .on('message', (message, rinfo) => { try {
        const {ssrc, token, name, valid } = new SessMsg(message)
        // do we need to check for prev invitations ????
        if( valid && type === IN ) {
            if( pending.get(ssrc)) return // duplicates

            this.controlPort.send(Uint32Array.of(OK, 2, token, this.ssrc).buffer, name)
            pending.set(ssrc, {ssrc, token, name} )
            clearTimeout(pending.timer)
            pending.timer = setTimeout(pending.clear, 10*1000) // do we need to bind ??
        } else {
            // dispatch message to appropriate stream -- if it exists
            streams.get( SSRC(message) )?.doControlMessage(message)
        }
    } catch( err ) {
        console.log
    }})
    this.controlChannel.bind(port)

    this.dataChannel = dgram.createSocket(`udp${ipVersion}`)
    .on('message', (message, rinfo) => { try {
        const {ssrc, token, name, valid } = new SessMsg(message)
        if( valid && type === IN ) {
            const item = pending.get(ssrc)
            if( item ) {
                new Stream(this, dest, ssrc, token, name) // make new stream
                pending.delete(ssrc)
                this.dataPort.send(Uint32Array.of(OK, 2, token, this.ssrc).buffer, name)
            } else {
                this.dataPort.send(Uint32Array.of(NO, 2, token, this.ssrc).buffer) // reject invitation
            }
        }

        streams.get(SSRC(message))?.doControlMessage(message)
    } catch( err ) {
        console.log
    }})
    .on('invite', msg => {
        item
    })

    this.controlChannel.bind(port+1)

    // Message delivery Rate
    this.rate = 10000;
    // Start timing
    this.startTime = Date.now() / 1000 * this.rate;
    this.startTimeHr = process.hrtime();
    }

    connectPort = (port) => {
        let t1, listen
        const token = Math.round(Math.random() * 0xFFFFFFFF);
        const msg = Buffer.from([IN, 2, token, this.ssrc, this.name]);
        port.send(msg, dest)
        return new Promise((resolve, reject) => {
            t1 = setTimeout(reject, 1000)
            port.on('invite', listen = msg => {
                const msg = new SessMsg(msg)
                if( token === msg.token &&
                    OK === msg.type ) resolve(msg.ssrc)
            })
        }).finally(()=> {
            clearTimeout(t1)
            port.removeListener(listen)
        })
    }
    connect () {
        return new Promise((resolve, reject) => {
            let i = 0
            while ( i < 12 &&
                !((ssrc1 = await connectPort(control)) &&
                (ssrc2 = await connectPort(data)) &&
                ssrc1 !== ssrc2 )) {
                i++
            }
            if ( i === 12) {reject("Unable to connect")}
            else resolve( new stream(this, ssrc) )
    })}

    addStream(stream) {
        if( this.streams.get(stream.ssrc)) throw `Trying to reuse a ssrc: ${stream.ssrc}`
        this.streams.set(stream.ssrc, stream)
    }
    deleteStream(stream) {
        if( !this.streams.get(stream.ssrc)) throw `Deleting ssrc: ${stream.ssrc} that doesn't exist`
        this.streams.delete(stream.ssrc)
    }
    dataPortSend(message) {}
    cntlPortSend(message) {}
    midi() {}
    start(){}
    end(){}
    send(){}
    end = () => Promise.all(this.streams.map(s =>s.end()))

    }
}

class Stream {
    constructor(session, ssrc){
        this.session = session
        this.ssrc = ssrc;
        session.addStream(this)
    }

    doControlMessage(message, rinfo)  {
        switch ( message.getUint32(0) ) {
            case RS:// trim Journal on control Port
            case BY:// destroy self
                this.session.deleteStream(this)
                break;
            default:
                console.log('Unknown message', message)
        }
    }

    doDataMessage(message, rinfo)  {
        switch(message.getUint32(0)) {
            case CK: const
                ts = new BigUint64Array(message, 12),
                count = message.getUint8(8)
                if( count < 2 ) {
                    message.setUint32(4, this.ssrc)
                    ts[count] = now()
                    message.setUint8(8, count+1)
Uint32Array(CK,this.ssrc, count << 24, 0,0,0,0,0,0)
                    this.session.datPort.send(message, rinfo)
                } else {
                    this.timeDifference = (ts[2]+ts[0])/2 - ts[1] // latency delay ??
                }
            break;
            case 'MIDI':// process command send FEEDBACK on controlPort
            for( const cmd of getComputedStyle(message)) this.session.midi(cmd)
        }
    }
    end() {
        this.session.deleteStream(this)
        this.session.dataPort.send(Uint32Array.of(BY, 2, token, ssrc).buffer)
    }
    send(message) {

    }
}

