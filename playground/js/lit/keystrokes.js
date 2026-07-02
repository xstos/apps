(function () {

    var w = Object.defineProperty;
    var A = (a, e, t) => e in a ? w(a, e, {enumerable: !0, configurable: !0, writable: !0, value: t}) : a[e] = t;
    var r = (a, e, t) => (A(a, typeof e != "symbol" ? e + "" : e, t), t);
    const R = {
            /*
            eslint-disable
              @typescript-eslint/no-empty-function,
              @typescript-eslint/no-unused-vars
            */
            addEventListener: (...a) => {
            },
            removeEventListener: (...a) => {
            },
            dispatchEvent: (...a) => {
            }
            /*
            eslint-enable
              @typescript-eslint/no-empty-function,
              @typescript-eslint/no-unused-vars
            */
        }, E = {
            userAgent: ""
        }, K = () => typeof document < "u" ? document : R, x = () => typeof navigator < "u" ? navigator : E,
        q = () => x().userAgent.toLowerCase().includes("mac");
    let C = !1;
    const I = (a) => {
        !q() || a.key !== "Meta" || (C = !0);
    }, M = (a) => {
        !C || a.key !== "Meta" || (C = !1, v());
    }, b = /* @__PURE__ */ new Map(), B = (a) => {
        b.set(a.key, a);
    }, W = (a) => {
        b.delete(a.key);
    }, v = () => {
        for (const a of b.values()) {
            const e = new KeyboardEvent("keyup", {
                key: a.key,
                code: a.code,
                bubbles: !0,
                cancelable: !0
            });
            K().dispatchEvent(e);
        }
        b.clear();
    }, L = (a) => {
        try {
            const e = () => a();
            return addEventListener("focus", e), () => {
                removeEventListener("focus", e);
            };
        } catch {
        }
    }, O = (a) => {
        try {
            const e = () => {
                v(), a();
            };
            return addEventListener("blur", e), () => removeEventListener("blur", e);
        } catch {
        }
    }, z = (a) => {
        try {
            const e = (t) => {
                B(t), I(t), a({
                    key: t.key,
                    aliases: [`@${t.code}`],
                    originalEvent: t,
                    composedPath: () => t.composedPath(),
                    preventDefault: () => t.preventDefault()
                });
            };
            return K().addEventListener("keydown", e), () => K().removeEventListener("keydown", e);
        } catch {
        }
    }, T = (a) => {
        try {
            const e = (t) => {
                W(t), M(t), a({
                    key: t.key,
                    aliases: [`@${t.code}`],
                    originalEvent: t,
                    composedPath: () => t.composedPath(),
                    preventDefault: () => t.preventDefault()
                });
            };
            return K().addEventListener("keyup", e), () => K().removeEventListener("keyup", e);
        } catch {
        }
    };

    class S {
        constructor(e) {
            r(this, "_onPressed");
            r(this, "_onPressedWithRepeat");
            r(this, "_onReleased");
            r(this, "_isPressed");
            r(this, "_identity");
            this._isPressed = !1, this._identity = e, typeof e == "function" ? this._onPressedWithRepeat = e : (this._onPressed = e.onPressed, this._onPressedWithRepeat = e.onPressedWithRepeat, this._onReleased = e.onReleased);
        }

        get isEmpty() {
            return !this._onPressed && !this._onPressedWithRepeat && !this._onReleased;
        }

        isOwnHandler(e) {
            return this._identity === e;
        }

        executePressed(e) {
            var t, s;
            this._isPressed || (t = this._onPressed) == null || t.call(this, e), this._isPressed = !0, (s = this._onPressedWithRepeat) == null || s.call(this, e);
        }

        executeReleased(e) {
            var t;
            this._isPressed && ((t = this._onReleased) == null || t.call(this, e)), this._isPressed = !1;
        }
    }

    const l = class l {
        constructor(e, t, s = {}) {
            r(this, "_normalizedKeyCombo");
            r(this, "_parsedKeyCombo");
            r(this, "_handlerState");
            r(this, "_keyComboEventMapper");
            r(this, "_movingToNextSequenceAt");
            r(this, "_sequenceIndex");
            r(this, "_unitIndex");
            r(this, "_lastActiveKeyPresses");
            r(this, "_lastActiveKeyCount");
            r(this, "_isPressedWithFinalUnit");
            this._normalizedKeyCombo = l.normalizeKeyCombo(e), this._parsedKeyCombo = l.parseKeyCombo(e), this._handlerState = new S(s), this._keyComboEventMapper = t, this._movingToNextSequenceAt = 0, this._sequenceIndex = 0, this._unitIndex = 0, this._lastActiveKeyPresses = [], this._lastActiveKeyCount = 0, this._isPressedWithFinalUnit = null;
        }

        static parseKeyCombo(e) {
            if (l._parseCache[e])
                return l._parseCache[e];
            const t = e.toLowerCase();
            let s = "", i = [], n = [i], o = [n];
            const h = [o];
            let u = !1;
            for (let c = 0; c < e.length; c += 1)
                if (t[c] === "\\")
                    u = !0;
                else if ((t[c] === "+" || t[c] === ">" || t[c] === ",") && !u) {
                    if (s)
                        throw new Error("cannot have two operators in a row");
                    s = t[c];
                } else
                    t[c].match(/[^\s]/) && (s && (s === "," ? (i = [], n = [i], o = [n], h.push(o)) : s === ">" ? (i = [], n = [i], o.push(n)) : s === "+" && (i = [], n.push(i)), s = ""), u = !1, i.push(t[c]));
            const y = h.map((c) => c.map((f) => f.map((m) => m.join(""))));
            return l._parseCache[e] = y, y;
        }

        static stringifyKeyCombo(e) {
            return e.map((t) => t.map((s) => s.map((i) => i === "+" ? "\\+" : i === ">" ? "\\>" : i === "," ? "\\," : i).join("+")).join(">")).join(",");
        }

        static normalizeKeyCombo(e) {
            if (l._normalizationCache[e])
                return l._normalizationCache[e];
            const t = this.stringifyKeyCombo(this.parseKeyCombo(e));
            return l._normalizationCache[e] = t, t;
        }

        get isPressed() {
            return !!this._isPressedWithFinalUnit;
        }

        get sequenceIndex() {
            return this.isPressed ? this._parsedKeyCombo.length : this._sequenceIndex;
        }

        isOwnHandler(e) {
            return this._handlerState.isOwnHandler(e);
        }

        executePressed(e) {
            var t, s;
            !((t = this._isPressedWithFinalUnit) != null && t.has(e.key)) && !((s = e.aliases) != null && s.some((i) => {
                var n;
                return (n = this._isPressedWithFinalUnit) == null ? void 0 : n.has(i);
            })) || this._handlerState.executePressed(this._wrapEvent(this._lastActiveKeyPresses, {
                key: e.key,
                aliases: new Set(e.aliases),
                event: e
            }));
        }

        executeReleased(e) {
            var t, s;
            !((t = this._isPressedWithFinalUnit) != null && t.has(e.key)) && !((s = e.aliases) != null && s.some((i) => {
                var n;
                return (n = this._isPressedWithFinalUnit) == null ? void 0 : n.has(i);
            })) || (this._handlerState.executeReleased(this._wrapEvent(this._lastActiveKeyPresses, {
                key: e.key,
                aliases: new Set(e.aliases),
                event: e
            })), this._isPressedWithFinalUnit = null);
        }

        updateState(e, t) {
            const s = e.length, i = s < this._lastActiveKeyCount;
            this._lastActiveKeyCount = s;
            const n = this._parsedKeyCombo[this._sequenceIndex], o = n.slice(0, this._unitIndex),
                h = n.slice(this._unitIndex), u = () => {
                    this._movingToNextSequenceAt = 0, this._sequenceIndex = 0, this._unitIndex = 0, this._lastActiveKeyPresses.length = 0, this._handlerState.isEmpty && (this._isPressedWithFinalUnit = null);
                };
            let y = 0;
            if (i) {
                if (this._movingToNextSequenceAt === 0)
                    return u();
                if (this._movingToNextSequenceAt + t < Date.now() || s !== 0)
                    return;
                this._movingToNextSequenceAt = 0, this._sequenceIndex += 1, this._unitIndex = 0;
                return;
            }
            for (const c of o) {
                for (const f of c) {
                    let m = !1;
                    for (let d = y; d < e.length && d < y + c.length; d += 1)
                        if (e[d].key === f || e[d].aliases.has(f)) {
                            m = !0;
                            break;
                        }
                    if (!m)
                        return u();
                }
                y += c.length;
            }
            if (this._movingToNextSequenceAt === 0) {
                for (const c of h) {
                    for (const f of c) {
                        let m = !1;
                        for (let d = y; d < e.length && d < y + c.length; d += 1)
                            if (e[d].key === f || e[d].aliases.has(f)) {
                                m = !0;
                                break;
                            }
                        if (!m)
                            return;
                    }
                    this._unitIndex += 1, y += c.length;
                }
                if (y < s - 1)
                    return u();
                if (this._lastActiveKeyPresses[this._sequenceIndex] = e.slice(0), this._sequenceIndex < this._parsedKeyCombo.length - 1) {
                    this._movingToNextSequenceAt = Date.now();
                    return;
                }
                this._isPressedWithFinalUnit = new Set(n[n.length - 1]);
            }
        }

        _wrapEvent(e, t) {
            return {
                ...this._keyComboEventMapper(e, t),
                keyCombo: this._normalizedKeyCombo,
                keyEvents: e.flat().map((i) => i.event),
                finalKeyEvent: t.event
            };
        }
    };
    r(l, "_parseCache", {}), r(l, "_normalizationCache", {});
    let _ = l;
    const U = 1e3;

    class P {
        constructor(e = {}) {
            r(this, "sequenceTimeout");
            r(this, "_isActive");
            r(this, "_unbinder");
            r(this, "_onActiveBinder");
            r(this, "_onInactiveBinder");
            r(this, "_onKeyPressedBinder");
            r(this, "_onKeyReleasedBinder");
            r(this, "_keyComboEventMapper");
            r(this, "_selfReleasingKeys");
            r(this, "_keyRemap");
            r(this, "_handlerStates");
            r(this, "_keyComboStates");
            r(this, "_keyComboStatesArray");
            r(this, "_activeKeyPresses");
            r(this, "_activeKeyMap");
            r(this, "_watchedKeyComboStates");
            this.sequenceTimeout = U, this._isActive = !0, this._onActiveBinder = () => {
            }, this._onInactiveBinder = () => {
            }, this._onKeyPressedBinder = () => {
            }, this._onKeyReleasedBinder = () => {
            }, this._keyComboEventMapper = () => ({}), this._selfReleasingKeys = [], this._keyRemap = {}, this._handlerStates = {}, this._keyComboStates = {}, this._keyComboStatesArray = [], this._activeKeyPresses = [], this._activeKeyMap = /* @__PURE__ */ new Map(), this._watchedKeyComboStates = {}, this.bindEnvironment(e);
        }

        get pressedKeys() {
            return this._activeKeyPresses.map((e) => e.key);
        }

        bindKey(e, t) {
            var i;
            if (typeof e == "object") {
                for (const n of e)
                    this.bindKey(n, t);
                return;
            }
            e = e.toLowerCase();
            const s = new S(t);
            (i = this._handlerStates)[e] ?? (i[e] = []), this._handlerStates[e].push(s);
        }

        unbindKey(e, t) {
            if (typeof e == "object") {
                for (const i of e)
                    this.unbindKey(i, t);
                return;
            }
            e = e.toLowerCase();
            const s = this._handlerStates[e];
            if (s)
                if (t)
                    for (let i = 0; i < s.length; i += 1)
                        s[i].isOwnHandler(t) && (s.splice(i, 1), i -= 1);
                else
                    s.length = 0;
        }

        bindKeyCombo(e, t) {
            var i;
            if (typeof e == "object") {
                for (const n of e)
                    this.bindKeyCombo(n, t);
                return;
            }
            e = _.normalizeKeyCombo(e);
            const s = new _(e, this._keyComboEventMapper, t);
            (i = this._keyComboStates)[e] ?? (i[e] = []), this._keyComboStates[e].push(s), this._keyComboStatesArray.push(s);
        }

        unbindKeyCombo(e, t) {
            if (typeof e == "object") {
                for (const i of e)
                    this.unbindKeyCombo(i, t);
                return;
            }
            e = _.normalizeKeyCombo(e);
            const s = this._keyComboStates[e];
            if (s)
                if (t) {
                    for (let i = 0; i < s.length; i += 1)
                        if (s[i].isOwnHandler(t)) {
                            for (let n = 0; n < this._keyComboStatesArray.length; n += 1)
                                this._keyComboStatesArray[n] === s[i] && (this._keyComboStatesArray.splice(n, 1), n -= 1);
                            s.splice(i, 1), i -= 1;
                        }
                } else
                    s.length = 0;
        }

        checkKey(e) {
            return e = e.toLowerCase(), this._activeKeyPresses.some((t) => t.key === e || t.aliases.has(e));
        }

        checkKeyCombo(e) {
            return this._ensureCachedKeyComboState(e).isPressed;
        }

        checkKeyComboSequenceIndex(e) {
            return this._ensureCachedKeyComboState(e).sequenceIndex;
        }

        bindEnvironment(e = {}) {
            this.unbindEnvironment(), this._onActiveBinder = e.onActive ?? L, this._onInactiveBinder = e.onInactive ?? O, this._onKeyPressedBinder = e.onKeyPressed ?? z, this._onKeyReleasedBinder = e.onKeyReleased ?? T, this._keyComboEventMapper = e.mapKeyComboEvent ?? (() => ({})), this._selfReleasingKeys = e.selfReleasingKeys ?? [], this._keyRemap = e.keyRemap ?? {};
            const t = this._onActiveBinder(() => {
                this._isActive = !0;
            }), s = this._onInactiveBinder(() => {
                this._isActive = !1;
            }), i = this._onKeyPressedBinder((o) => {
                this._handleKeyPress(o);
            }), n = this._onKeyReleasedBinder((o) => {
                this._handleKeyRelease(o);
            });
            this._unbinder = () => {
                t == null || t(), s == null || s(), i == null || i(), n == null || n();
            };
        }

        unbindEnvironment() {
            var e;
            (e = this._unbinder) == null || e.call(this);
        }

        _ensureCachedKeyComboState(e) {
            e = _.normalizeKeyCombo(e), this._watchedKeyComboStates[e] || (this._watchedKeyComboStates[e] = new _(e, this._keyComboEventMapper));
            const t = this._watchedKeyComboStates[e];
            return t.updateState(this._activeKeyPresses, this.sequenceTimeout), t;
        }

        _handleKeyPress(e) {
            var n;
            if (!this._isActive)
                return;
            e = {
                ...e,
                key: e.key.toLowerCase(),
                aliases: ((n = e.aliases) == null ? void 0 : n.map((o) => o.toLowerCase())) ?? []
            };
            const t = this._keyRemap[e.key];
            t && (e.key = t);
            for (let o = 0; o < e.aliases.length; o += 1) {
                const h = this._keyRemap[e.aliases[o]];
                h && (e.aliases[o] = h);
            }
            const s = this._handlerStates[e.key];
            if (s)
                for (const o of s)
                    o.executePressed(e);
            for (let o = 0; o < e.aliases.length; o += 1) {
                const h = this._handlerStates[e.aliases[o]];
                if (h)
                    for (const u of h)
                        u.executePressed(e);
            }
            const i = this._activeKeyMap.get(e.key);
            if (i)
                i.event = e;
            else {
                const o = {
                    key: e.key,
                    aliases: new Set(e.aliases),
                    event: e
                };
                this._activeKeyMap.set(e.key, o), this._activeKeyPresses.push(o);
            }
            this._updateKeyComboStates();
            for (const o of this._keyComboStatesArray)
                o.executePressed(e);
        }

        _handleKeyRelease(e) {
            var i;
            e = {
                ...e,
                key: e.key.toLowerCase(),
                aliases: ((i = e.aliases) == null ? void 0 : i.map((n) => n.toLowerCase())) ?? []
            };
            const t = this._keyRemap[e.key];
            if (t && (e.key = t), e.aliases)
                for (let n = 0; n < e.aliases.length; n += 1) {
                    const o = this._keyRemap[e.aliases[n]];
                    o && (e.aliases[n] = o);
                }
            const s = this._handlerStates[e.key];
            if (s)
                for (const n of s)
                    n.executeReleased(e);
            for (let n = 0; n < e.aliases.length; n += 1) {
                const o = this._handlerStates[e.aliases[n]];
                if (o)
                    for (const h of o)
                        h.executeReleased(e);
            }
            if (this._activeKeyMap.has(e.key)) {
                this._activeKeyMap.delete(e.key);
                for (let n = 0; n < this._activeKeyPresses.length; n += 1)
                    if (this._activeKeyPresses[n].key === e.key) {
                        this._activeKeyPresses.splice(n, 1), n -= 1;
                        break;
                    }
            }
            this._tryReleaseSelfReleasingKeys(), this._updateKeyComboStates();
            for (const n of this._keyComboStatesArray)
                n.executeReleased(e);
        }

        _updateKeyComboStates() {
            for (const e of this._keyComboStatesArray)
                e.updateState(this._activeKeyPresses, this.sequenceTimeout);
        }

        _tryReleaseSelfReleasingKeys() {
            for (const e of this._activeKeyPresses)
                for (const t of this._selfReleasingKeys)
                    e.key === t && this._handleKeyRelease(e.event);
        }
    }

    let g, k;
    const F = (a) => {
            k = a ?? new P(g);
        }, p = () => (k || F(), k), j = (a) => {
            g = a;
        }, N = (...a) => p().bindKey(...a), D = (...a) => p().unbindKey(...a), G = (...a) => p().bindKeyCombo(...a),
        $ = (...a) => p().unbindKeyCombo(...a), J = (...a) => p().checkKey(...a), Q = (...a) => p().checkKeyCombo(...a),
        V = _.normalizeKeyCombo, X = _.stringifyKeyCombo, Y = _.parseKeyCombo, Z = (a = {}) => {
            let e, t, s, i;
            return Object.assign(new P({
                ...a,
                onActive(o) {
                    e = o;
                },
                onInactive(o) {
                    t = o;
                },
                onKeyPressed(o) {
                    s = o;
                },
                onKeyReleased(o) {
                    i = o;
                }
            }), {
                activate() {
                    e();
                },
                deactivate() {
                    t();
                },
                press(o) {
                    s({composedPath: () => [], ...o});
                },
                release(o) {
                    i({composedPath: () => [], ...o});
                }
            });
        };
    window.keystrokes = {
        KeyComboState: _,
        Keystrokes: P,
        bindKey: N,
        bindKeyCombo: G,
        browserOnActiveBinder: L,
        browserOnInactiveBinder: O,
        browserOnKeyPressedBinder: z,
        browserOnKeyReleasedBinder: T,
        checkKey: J,
        checkKeyCombo: Q,
        createTestKeystrokes: Z,
        defaultSequenceTimeout: U,
        getGlobalKeystrokes: p,
        normalizeKeyCombo: V,
        parseKeyCombo: Y,
        setGlobalKeystrokes: F,
        setGlobalKeystrokesOptions: j,
        stringifyKeyCombo: X,
        unbindKey: D,
        unbindKeyCombo: $
    };

})()