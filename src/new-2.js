const EventEmitter = require("events").EventEmitter
const util = require('util')
const os = require('os');
const createSocket = require('dgram').createSocket
const mdns = require('mdns')
const service_id = '_apple-midi._udp',

/**
 * parseMessage
 * @param {ArrayBuffer} m
 *
 * Parse a message into an object.  Depending on the message type
 * different fields will be parsed out and returned.  See:
 *  https://developer.apple.com/library/archive/documentation/Audio/Conceptual/MIDINetworkDriverProtocol/MIDI/MIDI.html
 *
 */
function parseMessage(m) {
    const msg = new DataView(m)
    switch(msg.getUint32(0)){
        case IN: case OK: case NO: case BY:{
            const [ type, version, token, ssrc ] = new Uint32Array(msg,0, 16)
            const name = String.fromCharCode(...new Uint8Array(msg,16, msg.byteLength-17))
            return ({type, version, token, ssrc, name})
        }
        case CK: {
            return( {type: CK, ssrc: msg.getUint32(4),
                count: msg.getUint8(8), ts:[...new BigUint64Array(msg, 12)]} )
        }
        case RS: {
            const [type, ssrc, seq] = new Uint32Array(msg, 0, 12)
            return ({type, ssrc, seq})
        }
        default:
            if( msg.getUint8(3) === 'K') {
                ({type:MIDI, ssrc, timestamp})
            }
    }
}

process.on('SIGINT',  () => {
    Session.stop()
    process.exitCode = 1;
})

const details = (session) => {
    if( !session.addresses ) return session
    return {
        ...session,
        addressV4: session.addresses.find( a => a.includes('.')),
        addressV6: session.addresses.find( a => a.includes(':'))
}}

function start() {
    /**
    * Set up an interval time that will sync the streams of each session.
    * THe interval runs ever 10 seconds.  Streams that are newer than 60 seconds
    * will be sync at this interval.  Streams that are older than 60 will be sync
    * every 50 seconds.  This follows the recomendation in:
    * https://developer.apple.com/library/archive/documentation/Audio/Conceptual/MIDINetworkDriverProtocol/MIDI/MIDI.html#//apple_ref/doc/uid/TP40017273-CH2-DontLinkElementID_4
    */
           syncCnt = 0
           syncInterval = setInterval( () =>{
               for( sc of Session.sessions ) {
                   for( s of sc.streams ) {
                       if( s.sync && ( Date.now() - s.sync < 60000 || ++syncCnt % 5 === 0)) {
                           const ts = BigUint64Array.of(now, 0, 0)
                           sc.sendM(DATA, {type: CK, count: 0 , ssrc, ts }, s.rinfo)
                       }
                   }
               }}, 10000)

           mdns && mdns.createBrowser(service_id)
               .on('serviceUp', service => {
                   Session.remoteSessions.set(service.name, service);
                   Session.emit( 'remoteSessionAdded', details(service))
               })
               .on('serviceDown', service => {
                   Session.remoteSessions.delete(service.name)
                   Session.emit( 'remoteSessionRemoved', details(service))
               }).start()
           // bind ports ??
           }

       function stop() {
           clearInterval(syncInterval)
           BhxBrowser.stop()
           // mdns
           for (s of Session.sessions) {
               s.end()
           }
       }

class Session extends EventEmitter {
    static sessions = new Map()
    static remoteSessions = new Map()

    constructor(conf) {
        const defaults = {
            port: 5004,
            localName: `Session ${Session.sessions.length + 1}`,
            bonjourName: os.hostname() + (Session.sessions.length ? `-${Session.sessions.length}` : ''),
            streams: new Map(),
            ssrc: Math.round(Math.random() * 0xFFFFFFFF),
            ipVersion: 4
        }
        Object.assign(this, defaults, conf)
        sessions.set(this.ssrc, this)
        Session.emit('sessionAdded', this)

        this.ports[CNTL] = createSocket(`udp${ipVersion}`, processMessage)
        this.ports[DATA] = createSocket(`udp${ipVersion}`, processMessage)
    }

    processMessage(m, rinfo) {
        const msg = parseMessage(m)
        const stream = streams.get(msg.ssrc)
        switch( msg.type ){
            case BY: this.removeStream(stream); break;
            case CK: stream?.doSync(msg, rinfo); break;
            case RS: stream?.doFeedback(msg, rinfo); break;
            case MIDI:stream?.doMidi(msg, rinfo); break;
            case OK: case NO: this.emit(msg.token, msg, rinfo); break;
            case IN: !stream && this.addStream(msg.ssrc, msg.token, rinfo, false)
            default: console.error(`Unknown message `)
        }
    }

    sendM(port, rec, rinfo) {
        const {type, token, count, name = '', ts, sequence } = rec
        const  ssrc = this.ssrc;
        let buff = undefined;
        switch(type) {
        case IN: case OK: case NO: case BY:
            buff = new ArrayBuffer(16 + name.length+1)
            (new Uint32Array(buff, 0, 16)) = [type, 2, token, ssrc]
            (new Uint8Array(buff, 16)) = [...name, 0]
            break;
        case CK:
            buff = new ArrayBuffer(36)
            (new Uint32Array(buff,0, 12)) = [CK, 0, ssrc]
            (new Uint8Array(buff, 12, 1)) = [count]
            (new BigUint64Array(buff, 12, 24)) = ts
            break;
        case RS:
            buff = new ArrayBuffer(12)
            (new Uint32Array(buff, 0, 12)) = [RS, ssrc, sequence]
            break;
        case MIDI:

        }
        this.ports[port].send(buff, rinfo.port, rinfo.address, err => {
            console.log(`error on send ${rec} to addr=${rinfo.address} closing stream`)
            this.removeStream(this.streams.get())
        })
    }

    connect(dest, name){
        let cleanUp, tries = 10
        const invitation = { name,
            type:IN,
            version: 2,
            token: Math.round(Math.random() * 0xFFFFFFFF),
            ssrc: this.ssrc
        }
        return new Promise((resolve, reject) => {
            const timeOut = setInterval(() => {
                tries-- && reject();    // reject when nomore tries
                this.sendM(CNTL, invitation, dest)}, // send invitation again
                1000)
            const listener = (msg) => {
                switch(type) {
                    case NO: reject(); break;
                    case OK:
                        if( port === cntl ) {
                            timeOut.refresh();  // restart the timer
                            this.sendM(DATA, msg, dest)
                        } else resolve(this.addStream(msg.ssrc, msg.token, dest, true))
                }
            }
            cleanUp = ()=>{ // remember to clean up
                clearInterval(timeOut);
                port.off(invitation.token, listener)
            }
            port.on(invitation.token, listener)  // listen for event tagged as 'token'
            sendM(CNTL, invitation, dest) // send invitation
        }).finally(cleanUp)
    }

    send(message) {
        for( s of this.streams) s.send(message)
    }
    end() {
        for( const s of this.streams ) s.end()
        port[DATA].close()
        port[CNTL].close()
        Session.emit('sessionRemoved', this)
        Session.sessions.delete(this.ssrc)
    }
    publish() { }
    unpublish() { }
    addStream(ssrc, token, rinfo, initiator) {
        let stream = streams.get(ssrc)
        if( !stream ) {
            stream = new Stream(this, ssrc, token, rinfo, initiator)
            streams.set(ssrc, stream)
            this.emit('addStream', stream)
        }
        return stream
    }
    removeStream( stream ){
        if( stream ) {
            this.emit('removeStream', stream)
            this.streams.delete(stream)
        }
    }
}

/**
 * Session is a static class variable.  Set it up as a EventEmitter.
 */
util.inherits(Session, EventEmitter)
//EventEmitter.call(Stream)

class Stream {
    constructor(session, ssrc, token, rinfo, initiator){
        Object.assign(this, {session, token, ssrc, rinfo,
            timeOut: setTimeout( ()=> this.destroySelf(), 60*1000)
        })
        initiator && (this.sync = Date.now()) // time when stream created.  Used by CK interval
    }

    doFeedback(){}
    doSync({type, count, ts}) {
        this.timeOut.refresh()  // reset watchdog
        if(count < 2 ) {
            ts[count++] = process.hrtime.bigint()
            this.send(DATA, {type, count, ts})
        } else {
            this.timeDifference = (ts[2]+ts[0])/2 - ts[1] // latency delay ??
        }
    }
    doMidi() {}

    send(port, message) {
        this.session.sendM(port, message, this.rinfo)
    }
    end(){
        this.send(CTRL, {type:BY, token:this.token})
        this.destroySelf()
    }
    destroySelf() {
        this.session.removeStream(this)
    }
}