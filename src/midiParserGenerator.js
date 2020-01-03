mc[Symbol.iterator] = function() {
    return{
        offset: 0,
        buf: Uint8Array(buffer),
        last: undefined,
        next: () => {
            let {buf, offset, last} = this
            if( offset > buf.length)  return { done: true }
            let delayTime = 0, octet
            do{
              if( undefined === (octet = buf[offset++])) throw `invalid message: ${buf} at ${offset-1}`
              delayTime = delayTime << 7  | octet & 0x7f
            } while(octet & 0x80)

            let status = buf[offset]
            if(status & 0x80) {
                offset++;
                last = status
            } else status = last
            if(!status) throw `invalid running status Message: ${buf} at ${offset}`

            const dataStart = offset
            if( status === 0xF0) {
              while( (octet = buf[offset]) & 0x80) offset++
            } else offset += length[status>>4]
            if(offset >= buf.length) throw `unterminated midi command in Message: ${buf} at ${offset}`
            this.offset = offset
            this.last = last
            return {done:false, value:{
                delayTime,
                status,
                cmd: Uint8Array(status, ...buf.slice(dataStart, offset))
            }}
        }
    }
}
