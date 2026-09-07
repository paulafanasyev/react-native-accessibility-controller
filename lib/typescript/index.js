import { NativeEventEmitter, Platform } from 'react-native';
import NativeAccessibilityController from './NativeAccessibilityController';
// ---------------------------------------------------------------------------
// Event emitter (singleton) — only instantiated on Android
// ---------------------------------------------------------------------------
const emitter = Platform.OS === 'android'
    ? new NativeEventEmitter(NativeAccessibilityController)
    : null;
// ---------------------------------------------------------------------------
// Screen reading
// ---------------------------------------------------------------------------
/**
 * Capture the full accessibility tree of the current screen.
 */
export async function getAccessibilityTree() {
    return NativeAccessibilityController.getAccessibilityTree();
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
export async function findNode(query) {
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
export async function findAllNodes(query) {
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
export async function waitForNode(query, options = {}) {
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
export async function getScreenText() {
    return NativeAccessibilityController.getScreenText();
}
/**
 * Take a screenshot and return it as a base64-encoded image string.
 */
export async function takeScreenshot() {
    return NativeAccessibilityController.takeScreenshot();
}
// ---------------------------------------------------------------------------
// Node actions
// ---------------------------------------------------------------------------
/**
 * Perform an arbitrary action on a node identified by its ID.
 */
export async function performAction(nodeId, action) {
    return NativeAccessibilityController.performAction(nodeId, action);
}
/**
 * Tap (click) a node.
 */
export async function tapNode(nodeId) {
    return NativeAccessibilityController.tapNode(nodeId);
}
/**
 * Long-press a node.
 */
export async function longPressNode(nodeId) {
    return NativeAccessibilityController.longPressNode(nodeId);
}
/**
 * Set the text content of an editable node.
 */
export async function setNodeText(nodeId, text) {
    return NativeAccessibilityController.setNodeText(nodeId, text);
}
/**
 * Scroll a scrollable node in the given direction.
 */
export async function scrollNode(nodeId, direction) {
    return NativeAccessibilityController.scrollNode(nodeId, direction);
}
// ---------------------------------------------------------------------------
// Coordinate-based gestures
// ---------------------------------------------------------------------------
/**
 * Tap at screen coordinates.
 */
export async function tap(x, y) {
    return NativeAccessibilityController.tap(x, y);
}
/**
 * Long-press at screen coordinates.
 */
export async function longPress(x, y) {
    return NativeAccessibilityController.longPress(x, y);
}
/**
 * Swipe between two screen coordinates.
 */
export async function swipe(startX, startY, endX, endY, durationMs = 300) {
    return NativeAccessibilityController.swipe(startX, startY, endX, endY, durationMs);
}
// ---------------------------------------------------------------------------
// Global actions
// ---------------------------------------------------------------------------
/**
 * Execute a system-level global action (home, back, recents, etc.).
 */
export async function globalAction(action) {
    return NativeAccessibilityController.globalAction(action);
}
/**
 * Open an app by its Android package name.
 */
export async function openApp(packageName) {
    return NativeAccessibilityController.openApp(packageName);
}
/**
 * Returns a list of all user-launchable apps installed on the device.
 * Each entry includes the Android package name and the human-readable label.
 */
export async function getInstalledApps() {
    return NativeAccessibilityController.getInstalledApps();
}
// ---------------------------------------------------------------------------
// Overlay
// ---------------------------------------------------------------------------
/**
 * Show a floating overlay window with the given configuration.
 */
export async function showOverlay(config) {
    return NativeAccessibilityController.showOverlay(config);
}
/**
 * Update the content of the agent-status overlay (action text + step count).
 * No-op if no overlay is currently shown.
 */
export async function updateOverlay(config) {
    return NativeAccessibilityController.updateOverlay(config);
}
/**
 * Hide the floating overlay window.
 */
export async function hideOverlay() {
    return NativeAccessibilityController.hideOverlay();
}
/**
 * Subscribe to the overlay stop button tap event.
 * Fired when the user taps the Stop (■) button in the agent-status overlay.
 *
 * Returns a Subscription — call `.remove()` to unsubscribe.
 */
export function onOverlayStop(callback) {
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
export function onAccessibilityEvent(callback) {
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
export function onWindowChange(callback) {
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
export async function requestMediaProjection() {
    return NativeAccessibilityController.requestMediaProjection();
}
/**
 * Capture a screenshot using the previously granted MediaProjection permission.
 * Returns a base64-encoded PNG string.
 *
 * Faster than `takeScreenshot()` and does not require the AccessibilityService.
 */
export async function captureWithMediaProjection() {
    return NativeAccessibilityController.captureWithMediaProjection();
}
/**
 * Stop the active MediaProjection session and release all associated resources.
 * Call this when screen capture is no longer needed.
 */
export async function releaseMediaProjection() {
    return NativeAccessibilityController.releaseMediaProjection();
}
// ---------------------------------------------------------------------------
// Service lifecycle
// ---------------------------------------------------------------------------
/**
 * Check whether the AccessibilityService is currently enabled.
 */
export async function isServiceEnabled() {
    return NativeAccessibilityController.isServiceEnabled();
}
/**
 * Prompt the user to enable the AccessibilityService in Android settings.
 */
export async function requestServiceEnable() {
    return NativeAccessibilityController.requestServiceEnable();
}
/**
 * Check whether the SYSTEM_ALERT_WINDOW ("Draw over other apps") permission
 * has been granted. Returns true on non-Android platforms.
 */
export async function canDrawOverlays() {
    if (Platform.OS !== 'android')
        return true;
    return NativeAccessibilityController.canDrawOverlays();
}
/**
 * Opens the system "Draw over other apps" settings page for this package.
 * Call canDrawOverlays() after the user returns to verify the grant.
 * No-op on non-Android platforms (always permitted).
 */
export async function requestOverlayPermission() {
    if (Platform.OS !== 'android')
        return;
    return NativeAccessibilityController.requestOverlayPermission();
}
export { useAccessibilityTree, useScreenText, useAccessibilityEvents, useWindowChange, useServiceStatus, useOverlay, } from './hooks';
//# sourceMappingURL=index.js.map