/*! For license information please see pow.js.LICENSE.txt */
(() => {
  "use strict";
  var t = {
      7473: (t, e) => {
        function r(t) {
          if (!Number.isSafeInteger(t) || t < 0) throw new Error(`Wrong positive integer: ${t}`);
        }
        function o(t) {
          if ("boolean" != typeof t) throw new Error(`Expected boolean, not ${t}`);
        }
        function n(t, ...e) {
          if (!(t instanceof Uint8Array)) throw new Error("Expected Uint8Array");
          if (e.length > 0 && !e.includes(t.length))
            throw new Error(`Expected Uint8Array of length ${e}, not of length=${t.length}`);
        }
        function s(t) {
          if ("function" != typeof t || "function" != typeof t.create)
            throw new Error("Hash should be wrapped by utils.wrapConstructor");
          r(t.outputLen), r(t.blockLen);
        }
        function i(t, e = !0) {
          if (t.destroyed) throw new Error("Hash instance has been destroyed");
          if (e && t.finished) throw new Error("Hash#digest() has already been called");
        }
        function c(t, e) {
          n(t);
          const r = e.outputLen;
          if (t.length < r) throw new Error(`digestInto() expects output buffer of length at least ${r}`);
        }
        Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.output = e.exists = e.hash = e.bytes = e.bool = e.number = void 0),
          (e.number = r),
          (e.bool = o),
          (e.bytes = n),
          (e.hash = s),
          (e.exists = i),
          (e.output = c);
        const h = { number: r, bool: o, bytes: n, hash: s, exists: i, output: c };
        e.default = h;
      },
      3837: (t, e, r) => {
        Object.defineProperty(e, "__esModule", { value: !0 }), (e.SHA2 = void 0);
        const o = r(7473),
          n = r(1937);
        class s extends n.Hash {
          constructor(t, e, r, o) {
            super(),
              (this.blockLen = t),
              (this.outputLen = e),
              (this.padOffset = r),
              (this.isLE = o),
              (this.finished = !1),
              (this.length = 0),
              (this.pos = 0),
              (this.destroyed = !1),
              (this.buffer = new Uint8Array(t)),
              (this.view = (0, n.createView)(this.buffer));
          }
          update(t) {
            o.default.exists(this);
            const { view: e, buffer: r, blockLen: s } = this,
              i = (t = (0, n.toBytes)(t)).length;
            for (let o = 0; o < i; ) {
              const c = Math.min(s - this.pos, i - o);
              if (c !== s)
                r.set(t.subarray(o, o + c), this.pos),
                  (this.pos += c),
                  (o += c),
                  this.pos === s && (this.process(e, 0), (this.pos = 0));
              else {
                const e = (0, n.createView)(t);
                for (; s <= i - o; o += s) this.process(e, o);
              }
            }
            return (this.length += t.length), this.roundClean(), this;
          }
          digestInto(t) {
            o.default.exists(this), o.default.output(t, this), (this.finished = !0);
            const { buffer: e, view: r, blockLen: s, isLE: i } = this;
            let { pos: c } = this;
            (e[c++] = 128), this.buffer.subarray(c).fill(0), this.padOffset > s - c && (this.process(r, 0), (c = 0));
            for (let t = c; t < s; t++) e[t] = 0;
            !(function (t, e, r, o) {
              if ("function" == typeof t.setBigUint64) return t.setBigUint64(e, r, o);
              const n = BigInt(32),
                s = BigInt(4294967295),
                i = Number((r >> n) & s),
                c = Number(r & s),
                h = o ? 4 : 0,
                u = o ? 0 : 4;
              t.setUint32(e + h, i, o), t.setUint32(e + u, c, o);
            })(r, s - 8, BigInt(8 * this.length), i),
              this.process(r, 0);
            const h = (0, n.createView)(t),
              u = this.outputLen;
            if (u % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
            const a = u / 4,
              f = this.get();
            if (a > f.length) throw new Error("_sha2: outputLen bigger than state");
            for (let t = 0; t < a; t++) h.setUint32(4 * t, f[t], i);
          }
          digest() {
            const { buffer: t, outputLen: e } = this;
            this.digestInto(t);
            const r = t.slice(0, e);
            return this.destroy(), r;
          }
          _cloneInto(t) {
            t || (t = new this.constructor()), t.set(...this.get());
            const { blockLen: e, buffer: r, length: o, finished: n, destroyed: s, pos: i } = this;
            return (t.length = o), (t.pos = i), (t.finished = n), (t.destroyed = s), o % e && t.buffer.set(r), t;
          }
        }
        e.SHA2 = s;
      },
      505: (t, e) => {
        Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.crypto = void 0),
          (e.crypto = "object" == typeof globalThis && "crypto" in globalThis ? globalThis.crypto : void 0);
      },
      7576: (t, e, r) => {
        Object.defineProperty(e, "__esModule", { value: !0 }), (e.sha224 = e.sha256 = void 0);
        const o = r(3837),
          n = r(1937),
          s = (t, e, r) => (t & e) ^ (t & r) ^ (e & r),
          i = new Uint32Array([
            1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080,
            310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774,
            264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808,
            3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
            1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817,
            3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
            1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479,
            3329325298,
          ]),
          c = new Uint32Array([
            1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225,
          ]),
          h = new Uint32Array(64);
        class u extends o.SHA2 {
          constructor() {
            super(64, 32, 8, !1),
              (this.A = 0 | c[0]),
              (this.B = 0 | c[1]),
              (this.C = 0 | c[2]),
              (this.D = 0 | c[3]),
              (this.E = 0 | c[4]),
              (this.F = 0 | c[5]),
              (this.G = 0 | c[6]),
              (this.H = 0 | c[7]);
          }
          get() {
            const { A: t, B: e, C: r, D: o, E: n, F: s, G: i, H: c } = this;
            return [t, e, r, o, n, s, i, c];
          }
          set(t, e, r, o, n, s, i, c) {
            (this.A = 0 | t),
              (this.B = 0 | e),
              (this.C = 0 | r),
              (this.D = 0 | o),
              (this.E = 0 | n),
              (this.F = 0 | s),
              (this.G = 0 | i),
              (this.H = 0 | c);
          }
          process(t, e) {
            for (let r = 0; r < 16; r++, e += 4) h[r] = t.getUint32(e, !1);
            for (let t = 16; t < 64; t++) {
              const e = h[t - 15],
                r = h[t - 2],
                o = (0, n.rotr)(e, 7) ^ (0, n.rotr)(e, 18) ^ (e >>> 3),
                s = (0, n.rotr)(r, 17) ^ (0, n.rotr)(r, 19) ^ (r >>> 10);
              h[t] = (s + h[t - 7] + o + h[t - 16]) | 0;
            }
            let { A: r, B: o, C: c, D: u, E: a, F: f, G: l, H: p } = this;
            for (let t = 0; t < 64; t++) {
              const e =
                  (p +
                    ((0, n.rotr)(a, 6) ^ (0, n.rotr)(a, 11) ^ (0, n.rotr)(a, 25)) +
                    (((d = a) & f) ^ (~d & l)) +
                    i[t] +
                    h[t]) |
                  0,
                y = (((0, n.rotr)(r, 2) ^ (0, n.rotr)(r, 13) ^ (0, n.rotr)(r, 22)) + s(r, o, c)) | 0;
              (p = l), (l = f), (f = a), (a = (u + e) | 0), (u = c), (c = o), (o = r), (r = (e + y) | 0);
            }
            var d;
            (r = (r + this.A) | 0),
              (o = (o + this.B) | 0),
              (c = (c + this.C) | 0),
              (u = (u + this.D) | 0),
              (a = (a + this.E) | 0),
              (f = (f + this.F) | 0),
              (l = (l + this.G) | 0),
              (p = (p + this.H) | 0),
              this.set(r, o, c, u, a, f, l, p);
          }
          roundClean() {
            h.fill(0);
          }
          destroy() {
            this.set(0, 0, 0, 0, 0, 0, 0, 0), this.buffer.fill(0);
          }
        }
        class a extends u {
          constructor() {
            super(),
              (this.A = -1056596264),
              (this.B = 914150663),
              (this.C = 812702999),
              (this.D = -150054599),
              (this.E = -4191439),
              (this.F = 1750603025),
              (this.G = 1694076839),
              (this.H = -1090891868),
              (this.outputLen = 28);
          }
        }
        (e.sha256 = (0, n.wrapConstructor)(() => new u())), (e.sha224 = (0, n.wrapConstructor)(() => new a()));
      },
      1937: (t, e, r) => {
        Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.randomBytes =
            e.wrapXOFConstructorWithOpts =
            e.wrapConstructorWithOpts =
            e.wrapConstructor =
            e.checkOpts =
            e.Hash =
            e.concatBytes =
            e.toBytes =
            e.utf8ToBytes =
            e.asyncLoop =
            e.nextTick =
            e.hexToBytes =
            e.bytesToHex =
            e.isLE =
            e.rotr =
            e.createView =
            e.u32 =
            e.u8 =
              void 0);
        const o = r(505),
          n = t => t instanceof Uint8Array;
        if (
          ((e.u8 = t => new Uint8Array(t.buffer, t.byteOffset, t.byteLength)),
          (e.u32 = t => new Uint32Array(t.buffer, t.byteOffset, Math.floor(t.byteLength / 4))),
          (e.createView = t => new DataView(t.buffer, t.byteOffset, t.byteLength)),
          (e.rotr = (t, e) => (t << (32 - e)) | (t >>> e)),
          (e.isLE = 68 === new Uint8Array(new Uint32Array([287454020]).buffer)[0]),
          !e.isLE)
        )
          throw new Error("Non little-endian hardware is not supported");
        const s = Array.from({ length: 256 }, (t, e) => e.toString(16).padStart(2, "0"));
        function i(t) {
          if ("string" != typeof t) throw new Error("utf8ToBytes expected string, got " + typeof t);
          return new Uint8Array(new TextEncoder().encode(t));
        }
        function c(t) {
          if (("string" == typeof t && (t = i(t)), !n(t))) throw new Error("expected Uint8Array, got " + typeof t);
          return t;
        }
        (e.bytesToHex = function (t) {
          if (!n(t)) throw new Error("Uint8Array expected");
          let e = "";
          for (let r = 0; r < t.length; r++) e += s[t[r]];
          return e;
        }),
          (e.hexToBytes = function (t) {
            if ("string" != typeof t) throw new Error("hex string expected, got " + typeof t);
            const e = t.length;
            if (e % 2) throw new Error("padded hex string expected, got unpadded hex of length " + e);
            const r = new Uint8Array(e / 2);
            for (let e = 0; e < r.length; e++) {
              const o = 2 * e,
                n = t.slice(o, o + 2),
                s = Number.parseInt(n, 16);
              if (Number.isNaN(s) || s < 0) throw new Error("Invalid byte sequence");
              r[e] = s;
            }
            return r;
          }),
          (e.nextTick = async () => {}),
          (e.asyncLoop = async function (t, r, o) {
            let n = Date.now();
            for (let s = 0; s < t; s++) {
              o(s);
              const t = Date.now() - n;
              (t >= 0 && t < r) || (await (0, e.nextTick)(), (n += t));
            }
          }),
          (e.utf8ToBytes = i),
          (e.toBytes = c),
          (e.concatBytes = function (...t) {
            const e = new Uint8Array(t.reduce((t, e) => t + e.length, 0));
            let r = 0;
            return (
              t.forEach(t => {
                if (!n(t)) throw new Error("Uint8Array expected");
                e.set(t, r), (r += t.length);
              }),
              e
            );
          }),
          (e.Hash = class {
            clone() {
              return this._cloneInto();
            }
          }),
          (e.checkOpts = function (t, e) {
            if (
              void 0 !== e &&
              ("object" != typeof e ||
                ((r = e), "[object Object]" !== Object.prototype.toString.call(r) || r.constructor !== Object))
            )
              throw new Error("Options should be object or undefined");
            var r;
            return Object.assign(t, e);
          }),
          (e.wrapConstructor = function (t) {
            const e = e => t().update(c(e)).digest(),
              r = t();
            return (e.outputLen = r.outputLen), (e.blockLen = r.blockLen), (e.create = () => t()), e;
          }),
          (e.wrapConstructorWithOpts = function (t) {
            const e = (e, r) => t(r).update(c(e)).digest(),
              r = t({});
            return (e.outputLen = r.outputLen), (e.blockLen = r.blockLen), (e.create = e => t(e)), e;
          }),
          (e.wrapXOFConstructorWithOpts = function (t) {
            const e = (e, r) => t(r).update(c(e)).digest(),
              r = t({});
            return (e.outputLen = r.outputLen), (e.blockLen = r.blockLen), (e.create = e => t(e)), e;
          }),
          (e.randomBytes = function (t = 32) {
            if (o.crypto && "function" == typeof o.crypto.getRandomValues)
              return o.crypto.getRandomValues(new Uint8Array(t));
            throw new Error("crypto.getRandomValues must be defined");
          });
      },
      2562: (t, e, r) => {
        Object.defineProperty(e, "__esModule", { value: !0 }), (e.countLeadingZeros = e.minePow = void 0);
        const o = r(7576),
          n = r(1937);
        function s(t) {
          const e = [0, t.pubkey, t.created_at, t.kind, t.tags, t.content];
          return (0, n.bytesToHex)((0, o.sha256)(JSON.stringify(e)));
        }
        function i(t) {
          let e = 0;
          for (let r = 0; r < t.length; r++) {
            const o = parseInt(t[r], 16);
            if (0 !== o) {
              e += Math.clz32(o) - 28;
              break;
            }
            e += 4;
          }
          return e;
        }
        (e.minePow = function (t, e) {
          let r = 0,
            o = t.tags.findIndex(t => "nonce" === t[0]);
          -1 === o && ((o = t.tags.length), t.tags.push(["nonce", r.toString(), e.toString()]));
          do {
            const e = Math.floor(new Date().getTime() / 1e3);
            e !== t.created_at && ((r = 0), (t.created_at = e)), (t.tags[o][1] = (++r).toString()), (t.id = s(t));
          } while (i(t.id) < e);
          return t;
        }),
          (e.countLeadingZeros = i);
      },
    },
    e = {};
  function r(o) {
    var n = e[o];
    if (void 0 !== n) return n.exports;
    var s = (e[o] = { exports: {} });
    return t[o](s, s.exports, r), s.exports;
  }
  (() => {
    const t = r(2562);
    globalThis.onmessage = e => {
      const r = e.data;
      "req" === r.cmd &&
        queueMicrotask(() => {
          (0, t.minePow)(r.event, r.target), (r.cmd = "rsp"), globalThis.postMessage(r);
        });
    };
  })();
})();
//# sourceMappingURL=pow.js.map
