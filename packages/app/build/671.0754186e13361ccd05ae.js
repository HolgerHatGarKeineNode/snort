(self.webpackChunk_snort_app = self.webpackChunk_snort_app || []).push([
  [671, 47],
  {
    2636: (e, t, n) => {
      "use strict";
      n.r(t), n.d(t, { CashuWallet: () => h });
      var r = n(3088),
        i = n(5363);
      function o(e, t, n) {
        !(function (e, t) {
          if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object");
        })(e, t),
          t.set(e, n);
      }
      function a(e, t) {
        return (function (e, t) {
          return t.get ? t.get.call(e) : t.value;
        })(e, l(e, t, "get"));
      }
      function s(e, t, n) {
        return (
          (function (e, t, n) {
            if (t.set) t.set.call(e, n);
            else {
              if (!t.writable) throw new TypeError("attempted to set read only private field");
              t.value = n;
            }
          })(e, l(e, t, "set"), n),
          n
        );
      }
      function l(e, t, n) {
        if (!t.has(e)) throw new TypeError("attempted to " + n + " private field on non-instance");
        return t.get(e);
      }
      var u = new WeakMap(),
        c = new WeakMap();
      class h {
        constructor(e) {
          o(this, u, { writable: !0, value: void 0 }), o(this, c, { writable: !0, value: void 0 }), s(this, u, e);
        }
        canAutoLogin() {
          return !0;
        }
        isReady() {
          return void 0 !== a(this, c);
        }
        async getInfo() {
          if (!a(this, c)) throw new r.lj(r.H8.GeneralError, "Wallet not initialized");
          return { nodePubKey: "asdd", alias: "Cashu  mint: " + a(this, u) };
        }
        async login() {
          const e = new i.CashuMint(a(this, u)),
            t = await e.getKeys();
          return s(this, c, new i.CashuWallet(t, e)), !0;
        }
        close() {
          return Promise.resolve(!0);
        }
        getBalance() {
          throw new Error("Method not implemented.");
        }
        createInvoice() {
          throw new Error("Method not implemented.");
        }
        payInvoice() {
          throw new Error("Method not implemented.");
        }
        getInvoices() {
          return Promise.resolve([]);
        }
      }
    },
    214: () => {},
    1972: () => {},
  },
]);
//# sourceMappingURL=671.0754186e13361ccd05ae.js.map
