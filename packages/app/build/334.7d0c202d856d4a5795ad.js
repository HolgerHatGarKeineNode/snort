"use strict";
(self.webpackChunk_snort_app = self.webpackChunk_snort_app || []).push([
  [334],
  {
    334: (e, t, n) => {
      n.r(t), n.d(t, { LNCWallet: () => m });
      var a = n(8730),
        i = n.n(a),
        s = n(830),
        r = n(3088),
        o = n(6530),
        l = n.n(o);
      function c(e, t, n) {
        !(function (e, t) {
          if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object");
        })(e, t),
          t.set(e, n);
      }
      function u(e, t) {
        return (function (e, t) {
          return t.get ? t.get.call(e) : t.value;
        })(e, d(e, t, "get"));
      }
      function d(e, t, n) {
        if (!t.has(e)) throw new TypeError("attempted to " + n + " private field on non-instance");
        return t.get(e);
      }
      var h = (function (e) {
          return (
            (e.UNKNOWN = "UNKNOWN"),
            (e.IN_FLIGHT = "IN_FLIGHT"),
            (e.SUCCEEDED = "SUCCEEDED"),
            (e.FAILED = "FAILED"),
            (e.UNRECOGNIZED = "UNRECOGNIZED"),
            e
          );
        })(h || {}),
        p = new WeakMap(),
        w = new WeakMap();
      class m {
        constructor(e, t) {
          var n, a, s;
          c(this, p, { writable: !0, value: void 0 }),
            c(this, w, { writable: !0, value: l()("LNC") }),
            (n = this),
            (a = p),
            (s = new (i())({ pairingPhrase: e, password: t })),
            (function (e, t, n) {
              if (t.set) t.set.call(e, n);
              else {
                if (!t.writable) throw new TypeError("attempted to set read only private field");
                t.value = n;
              }
            })(n, d(n, a, "set"), s);
        }
        canAutoLogin() {
          return !1;
        }
        isReady() {
          return u(this, p).isReady;
        }
        static async Initialize(e) {
          const t = new m(e);
          return await t.login(), t;
        }
        static Empty() {
          return new m();
        }
        setPassword(e) {
          if (u(this, p).credentials.password && e !== u(this, p).credentials.password)
            throw new r.lj(r.H8.GeneralError, "Password is already set, cannot update password");
          u(this, p).credentials.password = e;
        }
        createAccount() {
          throw new Error("Not implemented");
        }
        async getInfo() {
          const e = await u(this, p).lnd.lightning.getInfo();
          return { nodePubKey: e.identityPubkey, alias: e.alias };
        }
        close() {
          return u(this, p).isConnected && u(this, p).disconnect(), Promise.resolve(!0);
        }
        async login(e) {
          for (e && (this.setPassword(e), u(this, p).run()), await u(this, p).connect(); !u(this, p).isConnected; )
            await new Promise(e => {
              setTimeout(e, 100);
            });
          return !0;
        }
        async getBalance() {
          var e, t;
          const n = await u(this, p).lnd.lightning.channelBalance();
          return (
            u(this, w).call(this, n),
            parseInt(
              null !== (e = null === (t = n.localBalance) || void 0 === t ? void 0 : t.sat) && void 0 !== e ? e : "0"
            )
          );
        }
        async createInvoice(e) {
          var t;
          const n = await u(this, p).lnd.lightning.addInvoice({
            memo: e.memo,
            value: e.amount.toString(),
            expiry: null === (t = e.expiry) || void 0 === t ? void 0 : t.toString(),
          });
          return (0, s.Wg)((0, r.BP)(n.paymentRequest));
        }
        async payInvoice(e) {
          return new Promise((t, n) => {
            u(this, p).lnd.router.sendPaymentV2(
              { paymentRequest: e, timeoutSeconds: 60, feeLimitSat: "100" },
              e => {
                u(this, w).call(this, e),
                  e.status === h.SUCCEEDED &&
                    t({ preimage: e.paymentPreimage, state: r.kd.Paid, timestamp: parseInt(e.creationTimeNs) / 1e9 });
              },
              e => {
                u(this, w).call(this, e), n(e);
              }
            );
          });
        }
        async getInvoices() {
          const e = await u(this, p).lnd.lightning.listPayments({ maxPayments: "10", reversed: !0 });
          return (
            u(this, w).call(this, e),
            e.payments.map(e => {
              const t = (0, r.BP)(e.paymentRequest);
              if (!t) throw new r.lj(r.H8.InvalidInvoice, `Could not parse ${e.paymentRequest}`);
              return {
                ...t,
                state: (() => {
                  switch (e.status) {
                    case h.SUCCEEDED:
                      return r.kd.Paid;
                    case h.FAILED:
                      return r.kd.Failed;
                    default:
                      return r.kd.Pending;
                  }
                })(),
                preimage: e.paymentPreimage,
              };
            })
          );
        }
      }
    },
  },
]);
//# sourceMappingURL=334.7d0c202d856d4a5795ad.js.map
