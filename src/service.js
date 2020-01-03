flushQue
que
class midiStream extends EventEmitter {
  constructor() {
    this.connectionInterval = undefined
  },
  handleInvitation(message, rinfo) {
    if (this.rinfo1 === null) {
      this.rinfo1 = rinfo;
      this.token = message.token;
      this.name = message.name;
      this.ssrc = message.ssrc;
      logger.info(`Got invitation from ${message.name} on channel 1`);
    } else if (this.rinfo2 == null) {
      this.rinfo2 = rinfo;
      logger.info(`Got invitation from ${message.name} on channel 2`);
      this.isConnected = true;
      this.emit('connected', {stream: this});
    }
    this.sendInvitationAccepted(rinfo);
  };
  reject: function(message, rinfo) {
    clearInterval(this.connectionInterval);
    logger.info(`Invititation was rejected by ${rinfo.address}:${rinfo.port}  ${message}`);
    this.session.removeStream(this);
  },
    connect: async (rinfo) => {
        this.isInitiator = true;
        try {
            await sendInvitation(rinfo)
            if ( accepted ) {
              while() { await dealy();send connection}
            }
            while() {}
        } catch() {

        }
        handleControlMessage:
        InviationAccepted:
        if( !rinfo1 ) {
            Object.assign(this, {name, ssrc} = message, {rinfo1: rinfo})
            this.sendInvitation( {address, port: port+1})
            this.emit()
        }
        Object.assign(this, {name,src}=message,)

        handleMidiMessage:
        sendSynchronization: (msg) {
          const now = this.session.now(),
          td = now - this.timeDifference,
          l = now + this.latency,
          newCount = (msg?.count || -1) + 1
          answer = { command: 'sync', ssrc: this.session.ssrc, token: this.token, count: newCount,
          ...([{ts1: now,ts2: td, ts3: now + this.latency },
          {ts1: msg.ts1, ts2: now, ts3: td},
          {ts1: msg.ts1, ts2: msg.ts2, ts3: now}
          ][newCount])}

            // Debug stuff
          this.logSynchronization(msg, answer);

          if (answer.count < 3) {
            this.session.sendUdpMessage(this.rinfo2, answer);
          } else {
            this.sendSynchronization();
          }
    }
    function handleInvitation_accepted(message, rinfo) {
      if (this.rinfo1 === null) {
        logger.info(`Invitation accepted by ${message.name}`);
        this.name = message.name;
        this.ssrc = message.ssrc;
        this.rinfo1 = rinfo;
        this.sendInvitation({
          address: rinfo.address,
          port: rinfo.port + 1,
        });
        this.isConnected = true;
        this.emit('connected', {
          stream: this,
        });
      } else if (this.rinfo2 === null) {
        logger.info(`Data channel to ${this.name} established`);
        this.emit('established', {
          stream: this,
        });
        this.rinfo2 = rinfo;
        let count = 0;
        this.syncInterval = setInterval(() => {
          this.sendSynchronization();
          count += 1;
          if (count > 10 || this.timeDifference) {
            clearInterval(this.syncInterval);
            this.syncInterval = setInterval(() => {
              this.sendSynchronization();
            }, 10000);
          }
        }, 1500);
      }
    };

    end: {}

}
const byteToCommand = {
  INVITE:0x494E: 'invitation',
  REJECT: 0x4E4F: 'invitation_rejected',
  ACCEPT: 0x4F4B: 'invitation_accepted',
  END: 0x4259: 'end',
  SYNC: 0x434B: 'synchronization',
  FEEDBACK: 0x5253: 'receiver_feedback',
  BITRATE_LIMIT: 0x524C: 'bitrate_receive_limit',
};
xxx(msg) {
  switch( msg.kind) {
    case INVITE: case ACCEPT: case REJECT: case END:
      dv.setUint16(0, kind)
      dv.setUInt32(4, version)
      dv.setUInt32(8, token)
      dv.setUInt32(12, token)
    //otstring at 16 with name
    case FEEDBACK:
      dv.setUInt32(4, msg.ssrc),
      dv.setUInt16(8, msg.sequenceNumber)
    case SYNC:
       dv.setUint32(4, msg.ssrc),
       dv.setUint32(8, msg.padding),
       dv.setUint8(8, msg.count),
       dv.setBigUint64(12, msg.ts1),
       dv.setBigUint64(20, msg.ts2),
       dv.setBigUint64(28, msg.ts3)
  }
}

function parseControlMessage(dv) {
  const kind = dv.getInt16()
  switch (kind) {
    case INVITE: case ACCEPT: case REJECT: case END:
      return {
        kind,
        stream: streams[dv.getUInt32(12)],
        version: dv.getUInt32(4),
        token: dv.getUInt32(8),
        ssrc: dv.getUInt32(12),
        name: dv.toString('utf-8', 16)
        //https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
        //String.fromCharCode.apply(null, new Uint16Array(buf))
      }
    case FEEDBACK:
      return {
        kind,
        stream: streams[dv.getUInt32(4)],
        ssrc: dv.getUInt32(4),
        sequenceNumber: dv.getUInt16(8)
      }
    case SYNC:
        return {
          kind,
          stream: streams[dv.getUInt32(4)],
          ssrc: dv.getUInt32(4),
          count: dv.getUInt8(8),
          padding: dv.getUInt32(8) & 0xFFFFFF,
          ts1: dv.getBigUint64(12),
          ts2: dv.getBigUint64(20),
          ts3: dv.getBigUint64(28)
        }
        default:
      }
}

https://en.wikipedia.org/wiki/RTP-MIDI#Header_format

function parseMidiMessages(buffer) {
  const header = dv.getUInt8()
  length = (header & 0x80)? dv.getUInt16() &0x0fff: header & 0x0f
  journal = header & 0x40
  p = header & 0x10

if( header & 0x20 ) return [{delayTime:0, data: dv.something with length}]
return [...midiCommands(buffer)]
}

    //return commands
    Parse SysEx
    buffer.split(//)
    if (statusByte === 0xf0) {
      data_length = 0;
      while (payload.length > offset + data_length
        && !(payload.readUInt8(offset + data_length) & 0x80)) {
        data_length += 1;
      }
      if (payload.readUInt8(offset + data_length) !== 0xf7) {
        data_length -= 1;
      }

      data_length += 1;
    } else {
      data_length = getDataLength(statusByte);
    }
    command.data = Buffer.alloc(1 + data_length);
    command.data[0] = statusByte;
    if (payload.length < offset + data_length) {
      this.isValid = false;
      return;
    }
    if (data_length) {
      payload.copy(command.data, 1, offset, offset + data_length);
      offset += data_length;
    }
    if (!(command.data[0] === 0xf0 && command.data[command.data.length - 1] !== 0xf7)) {
      this.commands.push(command);
    } else {
      return this;
    }
  }
  if (this.hasJournal) {
    this.journalOffset = offset;
    this.journal = this.parseJournal();
  }
  return this;
};

function parseMessage(buffer) {
  const dv = new DataView(buffer, 0 ,buffer.length)

  if ( dv.getUInt16() === 0xFFFF) { // Control Message}
    return parsetControlMessage(dv)

}

class Session extends EventEmitter {
  constructor() {
    commandPort: dgram.createSocket(`udp${this.ipVersion}`)
      .on('message', (msg, rinfo) => {
        const {stream, kind, ...message} = parseCommand(msg)
        switch( kind ) {
          case INVITE:
          case REJECT:
          case ACCEPT:
          case END:
          case FEEDBACK:
          case  SYNC:
            const now = this.session.now(),
            td = now - this.timeDifference,
            l = now + this.latency,
            newCount = (msg?.count || -1) + 1

            answer = { command: 'sync', ssrc: this.session.ssrc, token: this.token, count: newCount,
            ...([{ts1: now,ts2: td, ts3: now + this.latency },
            {ts1: msg.ts1, ts2: now, ts3: td},
            {ts1: msg.ts1, ts2: msg.ts2, ts3: now}
            ][newCount])}
        }
        stream?.process[kind]?.(message);
        kind && this.emit(kind, message)
      })
      .on('listening', this.listening.bind(this))
      .on('error', this.emit.bind(this, 'error'))

    messagePort: dgram.createSocket(`udp${this.ipVersion}`)
    .on('message', this.handleMessage.bind(this))
    .on('listening', this.listening.bind(this))
    .on('error', this.emit.bind(this, 'error'))
    publish:
    unpublish:
    start:
    end: async function() {
        await Promise.all(streams.map(s => s.close()))
        unpublish
        return  Promise.all([controlChannel.close(), messageChannel.close()])
    }

    now: process.hrtime.bigint,

    listening:
    send: (rinfo, message) => {
        .send(buffer, 0, buffer.length, port, address)
    }
    incoming: (rinfo, message) => {
        const processIt = {'controlMessage': cm, 'midi': hm}
        const {stream, kind, ...message} = parseMessage(message)
        stream?.process[kind]?.(message);
        kind && this.emit(kind, message)
        }

    connect: rinfo =>{
        const stream = new Stream()
        .on('connected', e => this.emit('streamAdded', {stream: e.stream,}))
        .on('disconnected', e => this.emit('streamRemoved', {stream: e.stream,}))
        .on('message', (comexTime, message) => {
            const deltaTime = comexTime - (this.lastMessageTime || comexTime);
            this.lastMessageTime = comexTime;
            this.emit('message', deltaTime / this.rate, message, comexTime + this.startTime);
          })
        .connect({address,port}=rinfo))
    }

}