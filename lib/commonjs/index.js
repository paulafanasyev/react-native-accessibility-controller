"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOverlay = exports.useServiceStatus = exports.useWindowChange = exports.useAccessibilityEvents = exports.useScreenText = exports.useAccessibilityTree = void 0;
exports.getAccessibilityTree = getAccessibilityTree;
exports.findNode = findNode;
exports.findAllNodes = findAllNodes;
exports.waitForNode = waitForNode;
exports.getScreenText = getScreenText;
exports.takeScreenshot = takeScreenshot;
exports.performAction = performAction;
exports.tapNode = tapNode;
exports.longPressNode = longPressNode;
exports.setNodeText = setNodeText;
exports.scrollNode = scrollNode;
exports.tap = tap;
exports.longPress = longPress;
exports.swipe = swipe;
exports.globalAction = globalAction;
exports.openApp = openApp;
exports.getInstalledApps = getInstalledApps;
exports.showOverlay = showOverlay;
exports.updateOverlay = updateOverlay;
exports.hideOverlay = hideOverlay;
exports.onOverlayStop = onOverlayStop;
exports.onAccessibilityEvent = onAccessibilityEvent;
exports.onWindowChange = onWindowChange;
exports.requestMediaProjection = requestMediaProjection;
exports.captureWithMediaProjection = captureWithMediaProjection;
exports.releaseMediaProjection = releaseMediaProjection;
exports.isServiceEnabled = isServiceEnabled;
exports.requestServiceEnable = requestServiceEnable;
exports.canDrawOverlays = canDrawOverlays;
exports.requestOverlayPermission = requestOverlayPermission;
const react_native_1 = require("react-native");
const NativeAccessibilityController_1 = __importDefault(require("./NativeAccessibilityController"));
// ---------------------------------------------------------------------------
// Event emitter (singleton) — only instantiated on Android
// ---------------------------------------------------------------------------
const emitter = react_native_1.Platform.OS === 'android'
    ? new react_native_1.NativeEventEmitter(NativeAccessibilityController_1.default)
    : null;
// ---------------------------------------------------------------------------
// Screen reading
// ---------------------------------------------------------------------------
/**
 * Capture the full accessibility tree of the current screen.
 */
async function getAccessibilityTree() {
    return NativeAccessibilityController_1.default.getAccessibilityTree();
}
/**
 * Search the current accessibility tree for the first node matching the query.
 *
 * String fields use substring matching (case-sensitive). Returns null when no
 * node matches.
 *
 * @example
 * const node = await findNode({ text: 'Submit' })
 * if (node) await tapNode(node.nodeId)
 */
async function findNode(query) {
    const tree = await getAccessibilityTree();
    return findInTree(tree, query);
}
/**
 * Search the current accessibility tree for ALL nodes matching the query.
 *
 * String fields use substring matching (case-sensitive). Returns an empty
 * array when no nodes match.
 *
 * @example
 * const buttons = await findAllNodes({ className: 'android.widget.Button' })
 * // Tap each one in turn
 * for (const btn of buttons) await tapNode(btn.nodeId)
 */
async function findAllNodes(query) {
    const tree = await getAccessibilityTree();
    const results = [];
    collectFromTree(tree, query, results);
    return results;
}
/**
 * Poll the accessibility tree until a node matching the query appears, then
 * return it. Throws a `TimeoutError` if the node is not found within
 * `timeoutMs` milliseconds.
 *
 * Useful for waiting after an action triggers an animation or navigation.
 *
 * @example
 * await tapNode(submitButtonId)
 * const successBanner = await waitForNode({ text: 'Success' }, { timeoutMs: 5000 })
 * await tapNode(successBanner.nodeId)
 */
async function waitForNode(query, options = {}) {
    const { timeoutMs = 10000, pollIntervalMs = 500 } = options;
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const tree = await getAccessibilityTree();
        const found = findInTree(tree, query);
        if (found)
            return found;
        const remaining = deadline - Date.now();
        if (remaining <= 0)
            break;
        await new Promise((resolve) => setTimeout(resolve, Math.min(pollIntervalMs, remaining)));
    }
    throw Object.assign(new Error(`waitForNode: node not found within ${timeoutMs}ms`), { name: 'TimeoutError' });
}
function nodeMatches(node, query) {
    const hasStringCriteria = query.text !== undefined ||
        query.contentDescription !== undefined ||
        query.className !== undefined;
    const hasBoolCriteria = query.isChecked !== undefined || query.isEnabled !== undefined;
    if (!hasStringCriteria && !hasBoolCriteria)
        return false;
    if (hasStringCriteria) {
        const textMatch = query.text !== undefined &&
            node.text !== null &&
            node.text.includes(query.text);
        const descMatch = query.contentDescription !== undefined &&
            node.contentDescription !== null &&
            node.contentDescription.includes(query.contentDescription);
        const classMatch = query.className !== undefined && node.className === query.className;
        if (!textMatch && !descMatch && !classMatch)
            return false;
    }
    if (query.isChecked !== undefined && node.isChecked !== query.isChecked)
        return false;
    if (query.isEnabled !== undefined && node.isEnabled !== query.isEnabled)
        return false;
    return true;
}
function findInTree(nodes, query) {
    for (const node of nodes) {
        if (nodeMatches(node, query))
            return node;
        const found = findInTree(node.children, query);
        if (found)
            return found;
    }
    return null;
}
function collectFromTree(nodes, query, results) {
    for (const node of nodes) {
        if (nodeMatches(node, query))
            results.push(node);
        collectFromTree(node.children, query, results);
    }
}
/**
 * Get a serialised text representation of the current screen.
 */
async function getScreenText() {
    return NativeAccessibilityController_1.default.getScreenText();
}
/**
 * Take a screenshot and return it as a base64-encoded image string.
 */
async function takeScreenshot() {
    return NativeAccessibilityController_1.default.takeScreenshot();
}
// ---------------------------------------------------------------------------
// Node actions
// ---------------------------------------------------------------------------
/**
 * Perform an arbitrary action on a node identified by its ID.
 */
async function performAction(nodeId, action) {
    return NativeAccessibilityController_1.default.performAction(nodeId, action);
}
/**
 * Tap (click) a node.
 */
async function tapNode(nodeId) {
    return NativeAccessibilityController_1.default.tapNode(nodeId);
}
/**
 * Long-press a node.
 */
async function longPressNode(nodeId) {
    return NativeAccessibilityController_1.default.longPressNode(nodeId);
}
/**
 * Set the text content of an editable node.
 */
async function setNodeText(nodeId, text) {
    return NativeAccessibilityController_1.default.setNodeText(nodeId, text);
}
/**
 * Scroll a scrollable node in the given direction.
 */
async function scrollNode(nodeId, direction) {
    return NativeAccessibilityController_1.default.scrollNode(nodeId, direction);
}
// ---------------------------------------------------------------------------
// Coordinate-based gestures
// ---------------------------------------------------------------------------
/**
 * Tap at screen coordinates.
 */
async function tap(x, y) {
    return NativeAccessibilityController_1.default.tap(x, y);
}
/**
 * Long-press at screen coordinates.
 */
async function longPress(x, y) {
    return NativeAccessibilityController_1.default.longPress(x, y);
}
/**
 * Swipe between two screen coordinates.
 */
async function swipe(startX, startY, endX, endY, durationMs = 300) {
    return NativeAccessibilityController_1.default.swipe(startX, startY, endX, endY, durationMs);
}
// ---------------------------------------------------------------------------
// Global actions
// ---------------------------------------------------------------------------
/**
 * Execute a system-level global action (home, back, recents, etc.).
 */
async function globalAction(action) {
    return NativeAccessibilityController_1.default.globalAction(action);
}
/**
 * Open an app by its Android package name.
 */
async function openApp(packageName) {
    return NativeAccessibilityController_1.default.openApp(packageName);
}
/**
 * Returns a list of all user-launchable apps installed on the device.
 * Each entry includes the Android package name and the human-readable label.
 */
async function getInstalledApps() {
    return NativeAccessibilityController_1.default.getInstalledApps();
}
// ---------------------------------------------------------------------------
// Overlay
// ---------------------------------------------------------------------------
/**
 * Show a floating overlay window with the given configuration.
 */
async function showOverlay(config) {
    return NativeAccessibilityController_1.default.showOverlay(config);
}
/**
 * Update the content of the agent-status overlay (action text + step count).
 * No-op if no overlay is currently shown.
 */
async function updateOverlay(config) {
    return NativeAccessibilityController_1.default.updateOverlay(config);
}
/**
 * Hide the floating overlay window.
 */
async function hideOverlay() {
    return NativeAccessibilityController_1.default.hideOverlay();
}
/**
 * Subscribe to the overlay stop button tap event.
 * Fired when the user taps the Stop (■) button in the agent-status overlay.
 *
 * Returns a Subscription — call `.remove()` to unsubscribe.
 */
function onOverlayStop(callback) {
    if (!emitter) {
        console.warn('react-native-accessibility-controller: onOverlayStop is only supported on Android');
        return { remove: () => { } };
    }
    const sub = emitter.addListener('onOverlayStop', callback);
    return { remove: () => sub.remove() };
}
// ---------------------------------------------------------------------------
// Event streaming
// ---------------------------------------------------------------------------
/**
 * Subscribe to raw accessibility events.
 *
 * Returns a Subscription — call `.remove()` to unsubscribe when done.
 */
function onAccessibilityEvent(callback) {
    if (!emitter) {
        console.warn('react-native-accessibility-controller: onAccessibilityEvent is only supported on Android');
        return { remove: () => { } };
    }
    const sub = emitter.addListener('onAccessibilityEvent', callback);
    return { remove: () => sub.remove() };
}
/**
 * Subscribe to window-change events.
 *
 * Returns a Subscription — call `.remove()` to unsubscribe when done.
 */
function onWindowChange(callback) {
    if (!emitter) {
        console.warn('react-native-accessibility-controller: onWindowChange is only supported on Android');
        return { remove: () => { } };
    }
    const sub = emitter.addListener('onWindowChange', callback);
    return { remove: () => sub.remove() };
}
// ---------------------------------------------------------------------------
// MediaProjection screenshot (no AccessibilityService required)
// ---------------------------------------------------------------------------
/**
 * Ask the user to grant screen-capture permission via the system dialog.
 * Returns `true` if permission was granted, `false` if denied.
 *
 * Must be called before `captureWithMediaProjection()`. On Android 14+, a
 * foreground service with `foregroundServiceType="mediaProjection"` must be
 * running before the first capture.
 */
async function requestMediaProjection() {
    return NativeAccessibilityController_1.default.requestMediaProjection();
}
/**
 * Capture a screenshot using the previously granted MediaProjection permission.
 * Returns a base64-encoded PNG string.
 *
 * Faster than `takeScreenshot()` and does not require the AccessibilityService.
 */
async function captureWithMediaProjection() {
    return NativeAccessibilityController_1.default.captureWithMediaProjection();
}
/**
 * Stop the active MediaProjection session and release all associated resources.
 * Call this when screen capture is no longer needed.
 */
async function releaseMediaProjection() {
    return NativeAccessibilityController_1.default.releaseMediaProjection();
}
// ---------------------------------------------------------------------------
// Service lifecycle
// ---------------------------------------------------------------------------
/**
 * Check whether the AccessibilityService is currently enabled.
 */
async function isServiceEnabled() {
    return NativeAccessibilityController_1.default.isServiceEnabled();
}
/**
 * Prompt the user to enable the AccessibilityService in Android settings.
 */
async function requestServiceEnable() {
    return NativeAccessibilityController_1.default.requestServiceEnable();
}
/**
 * Check whether the SYSTEM_ALERT_WINDOW ("Draw over other apps") permission
 * has been granted. Returns true on non-Android platforms.
 */
async function canDrawOverlays() {
    if (react_native_1.Platform.OS !== 'android')
        return true;
    return NativeAccessibilityController_1.default.canDrawOverlays();
}
/**
 * Opens the system "Draw over other apps" settings page for this package.
 * Call canDrawOverlays() after the user returns to verify the grant.
 * No-op on non-Android platforms (always permitted).
 */
async function requestOverlayPermission() {
    if (react_native_1.Platform.OS !== 'android')
        return;
    return NativeAccessibilityController_1.default.requestOverlayPermission();
}
var hooks_1 = require("./hooks");
Object.defineProperty(exports, "useAccessibilityTree", { enumerable: true, get: function () { return hooks_1.useAccessibilityTree; } });
Object.defineProperty(exports, "useScreenText", { enumerable: true, get: function () { return hooks_1.useScreenText; } });
Object.defineProperty(exports, "useAccessibilityEvents", { enumerable: true, get: function () { return hooks_1.useAccessibilityEvents; } });
Object.defineProperty(exports, "useWindowChange", { enumerable: true, get: function () { return hooks_1.useWindowChange; } });
Object.defineProperty(exports, "useServiceStatus", { enumerable: true, get: function () { return hooks_1.useServiceStatus; } });
Object.defineProperty(exports, "useOverlay", { enumerable: true, get: function () { return hooks_1.useOverlay; } });
