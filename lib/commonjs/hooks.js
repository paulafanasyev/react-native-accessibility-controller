"use strict";
/**
 * React hooks for react-native-accessibility-controller.
 *
 * These hooks handle lifecycle management (cleanup on unmount, polling
 * teardown) so callers don't have to wire subscriptions manually.
 *
 * Imports are done directly from the native module (not from ./index) to
 * avoid a circular dependency.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAccessibilityTree = useAccessibilityTree;
exports.useAccessibilityEvents = useAccessibilityEvents;
exports.useServiceStatus = useServiceStatus;
exports.useScreenText = useScreenText;
exports.useWindowChange = useWindowChange;
exports.useOverlay = useOverlay;
const react_1 = require("react");
const react_native_1 = require("react-native");
const NativeAccessibilityController_1 = __importDefault(require("./NativeAccessibilityController"));
// ---------------------------------------------------------------------------
// Internal emitter (shared with index.ts subscribers)
// ---------------------------------------------------------------------------
const emitter = react_native_1.Platform.OS === 'android'
    ? new react_native_1.NativeEventEmitter(NativeAccessibilityController_1.default)
    : null;
/**
 * Fetches and optionally polls the accessibility tree of the current screen.
 *
 * ```tsx
 * const { tree, loading, error, refresh } = useAccessibilityTree({
 *   pollIntervalMs: 1000,
 * });
 * ```
 */
function useAccessibilityTree(options = {}) {
    const { pollIntervalMs, fetchOnMount = true } = options;
    const [tree, setTree] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const isMounted = (0, react_1.useRef)(true);
    const fetchTree = (0, react_1.useCallback)(async () => {
        if (!isMounted.current)
            return;
        setLoading(true);
        setError(null);
        try {
            const result = (await NativeAccessibilityController_1.default.getAccessibilityTree());
            if (isMounted.current)
                setTree(result);
        }
        catch (e) {
            if (isMounted.current) {
                setError(e instanceof Error ? e : new Error(String(e)));
            }
        }
        finally {
            if (isMounted.current)
                setLoading(false);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        isMounted.current = true;
        if (fetchOnMount) {
            fetchTree();
        }
        if (pollIntervalMs != null && pollIntervalMs > 0) {
            const id = setInterval(fetchTree, pollIntervalMs);
            return () => {
                isMounted.current = false;
                clearInterval(id);
            };
        }
        return () => {
            isMounted.current = false;
        };
    }, [fetchOnMount, fetchTree, pollIntervalMs]);
    return { tree, loading, error, refresh: fetchTree };
}
/**
 * Subscribes to raw accessibility events and returns a rolling buffer.
 *
 * ```tsx
 * const events = useAccessibilityEvents({ maxEvents: 20 });
 * ```
 */
function useAccessibilityEvents(options = {}) {
    const { maxEvents = 50 } = options;
    const [events, setEvents] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        if (!emitter)
            return;
        const sub = emitter.addListener('onAccessibilityEvent', (event) => {
            setEvents((prev) => {
                const next = [event, ...prev];
                return next.length > maxEvents ? next.slice(0, maxEvents) : next;
            });
        });
        return () => sub.remove();
    }, [maxEvents]);
    return events;
}
/**
 * Reactively tracks whether the AccessibilityService is enabled and whether
 * the app has the overlay permission.
 *
 * ```tsx
 * const { isEnabled, canDrawOverlays, loading } = useServiceStatus({ pollIntervalMs: 2000 });
 * if (!isEnabled) return <PermissionBanner />;
 * ```
 */
function useServiceStatus(options = {}) {
    const { pollIntervalMs } = options;
    const [isEnabled, setIsEnabled] = (0, react_1.useState)(false);
    const [canDraw, setCanDraw] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const isMounted = (0, react_1.useRef)(true);
    const check = (0, react_1.useCallback)(async () => {
        if (!isMounted.current)
            return;
        setError(null);
        try {
            const [enabled, overlay] = await Promise.all([
                NativeAccessibilityController_1.default.isServiceEnabled(),
                react_native_1.Platform.OS === 'android'
                    ? NativeAccessibilityController_1.default.canDrawOverlays()
                    : Promise.resolve(true),
            ]);
            if (isMounted.current) {
                setIsEnabled(enabled);
                setCanDraw(overlay);
            }
        }
        catch (e) {
            if (isMounted.current) {
                setError(e instanceof Error ? e : new Error(String(e)));
            }
        }
        finally {
            if (isMounted.current)
                setLoading(false);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        isMounted.current = true;
        check();
        if (pollIntervalMs != null && pollIntervalMs > 0) {
            const id = setInterval(check, pollIntervalMs);
            return () => {
                isMounted.current = false;
                clearInterval(id);
            };
        }
        return () => {
            isMounted.current = false;
        };
    }, [check, pollIntervalMs]);
    return { isEnabled, canDrawOverlays: canDraw, loading, error, refresh: check };
}
/**
 * Fetches and optionally polls the serialised text representation of the
 * current screen. Useful for showing a live preview of what the agent sees.
 *
 * ```tsx
 * const { text, loading } = useScreenText({ pollIntervalMs: 2000 });
 * ```
 */
function useScreenText(options = {}) {
    const { pollIntervalMs, fetchOnMount = true } = options;
    const [text, setText] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const isMounted = (0, react_1.useRef)(true);
    const fetchText = (0, react_1.useCallback)(async () => {
        if (!isMounted.current)
            return;
        setLoading(true);
        setError(null);
        try {
            const result = await NativeAccessibilityController_1.default.getScreenText();
            if (isMounted.current)
                setText(result);
        }
        catch (e) {
            if (isMounted.current) {
                setError(e instanceof Error ? e : new Error(String(e)));
            }
        }
        finally {
            if (isMounted.current)
                setLoading(false);
        }
    }, []);
    (0, react_1.useEffect)(() => {
        isMounted.current = true;
        if (fetchOnMount) {
            fetchText();
        }
        if (pollIntervalMs != null && pollIntervalMs > 0) {
            const id = setInterval(fetchText, pollIntervalMs);
            return () => {
                isMounted.current = false;
                clearInterval(id);
            };
        }
        return () => {
            isMounted.current = false;
        };
    }, [fetchOnMount, fetchText, pollIntervalMs]);
    return { text, loading, error, refresh: fetchText };
}
// ---------------------------------------------------------------------------
// useWindowChange
// ---------------------------------------------------------------------------
/**
 * Subscribes to window-change events and returns the latest active window.
 *
 * ```tsx
 * const win = useWindowChange();
 * console.log(win?.packageName); // "com.example.app"
 * ```
 */
function useWindowChange() {
    const [win, setWin] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!emitter)
            return;
        const sub = emitter.addListener('onWindowChange', (info) => setWin(info));
        return () => sub.remove();
    }, []);
    return win;
}
/**
 * Manages the native floating agent-status overlay.
 *
 * Automatically hides the overlay on unmount. Subscribe to the overlay stop
 * button via the `onStop` option — called when the user taps the Stop button
 * in the overlay.
 *
 * ```tsx
 * const overlay = useOverlay({ onStop: () => agent.abort() });
 *
 * // Show when agent starts
 * await overlay.show({ gravity: 'top-right', action: 'Working...', stepCount: 0 });
 *
 * // Update on each action
 * await overlay.update({ action: 'Tapping Settings', stepCount: 3 });
 *
 * // Hide when done
 * await overlay.hide();
 * ```
 */
function useOverlay(options = {}) {
    const { onStop } = options;
    const [isVisible, setIsVisible] = (0, react_1.useState)(false);
    const onStopRef = (0, react_1.useRef)(onStop);
    onStopRef.current = onStop;
    // Subscribe to the overlay stop button
    (0, react_1.useEffect)(() => {
        if (!emitter)
            return;
        const sub = emitter.addListener('onOverlayStop', () => {
            setIsVisible(false);
            onStopRef.current?.();
        });
        return () => sub.remove();
    }, []);
    // Auto-hide on unmount
    (0, react_1.useEffect)(() => {
        return () => {
            if (react_native_1.Platform.OS === 'android') {
                NativeAccessibilityController_1.default.hideOverlay().catch(() => { });
            }
        };
    }, []);
    const show = (0, react_1.useCallback)(async (config) => {
        await NativeAccessibilityController_1.default.showOverlay(config);
        setIsVisible(true);
    }, []);
    const update = (0, react_1.useCallback)(async (config) => {
        await NativeAccessibilityController_1.default.updateOverlay(config);
    }, []);
    const hide = (0, react_1.useCallback)(async () => {
        await NativeAccessibilityController_1.default.hideOverlay();
        setIsVisible(false);
    }, []);
    return { isVisible, show, update, hide };
}
