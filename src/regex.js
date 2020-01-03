cmds = String.fromCharCode(...commands)
const r = /(?<delay>[\x80-\xFF]{0,3}[\x7F-\x00])(?<status>[\x80-\xFF])?
    ((?<=[\x80-\xB7\xE0-\E7\F2])[\x00-\x7f]{2}|
    (?<=[\xC0-\xDF\xF1\xF3])(?<data>[\x00-\x7F])|
    (?<=[\xF0\xF7])(?<data>[\x00-\x7F])*[\xF0\xF7]/
F0[]
[0xF0]
delayTime = v.reduce((a,c) => a<<7 + (0x7f & c), 0)
\xF0[^\xF7]*\xF7
\x