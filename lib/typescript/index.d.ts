export type { AccessibilityNode, NodeAction, GlobalAction, ScrollDirection, OverlayConfig, OverlayUpdateConfig, A11yEvent, WindowInfo, Subscription, FindNodeQuery, WaitForNodeOptions, InstalledApp, } from './types';
import type { AccessibilityNode, NodeAction, GlobalAction, ScrollDirection, OverlayConfig, OverlayUpdateConfig, A11yEvent, WindowInfo, Subscription, FindNodeQuery, WaitForNodeOptions, InstalledApp } from './types';
/**
 * Capture the full accessibility tree of the current screen.
 */
export declare function getAccessibilityTree(): Promise<AccessibilityNode[]>;
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
export declare function findNode(query: FindNodeQuery): Promise<AccessibilityNode | null>;
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
export declare function findAllNodes(query: FindNodeQuery): Promise<AccessibilityNode[]>;
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
export declare function waitForNode(query: FindNodeQuery, options?: WaitForNodeOptions): Promise<AccessibilityNode>;
/**
 * Get a serialised text representation of the current screen.
 */
export declare function getScreenText(): Promise<string>;
/**
 * Take a screenshot and return it as a base64-encoded image string.
 */
export declare function takeScreenshot(): Promise<string>;
/**
 * Perform an arbitrary action on a node identified by its ID.
 */
export declare function performAction(nodeId: string, action: NodeAction): Promise<boolean>;
/**
 * Tap (click) a node.
 */
export declare function tapNode(nodeId: string): Promise<boolean>;
/**
 * Long-press a node.
 */
export declare function longPressNode(nodeId: string): Promise<boolean>;
/**
 * Set the text content of an editable node.
 */
export declare function setNodeText(nodeId: string, text: string): Promise<boolean>;
/**
 * Scroll a scrollable node in the given direction.
 */
export declare function scrollNode(nodeId: string, direction: ScrollDirection): Promise<boolean>;
/**
 * Tap at screen coordinates.
 */
export declare function tap(x: number, y: number): Promise<boolean>;
/**
 * Long-press at screen coordinates.
 */
export declare function longPress(x: number, y: number): Promise<boolean>;
/**
 * Swipe between two screen coordinates.
 */
export declare function swipe(startX: number, startY: number, endX: number, endY: number, durationMs?: number): Promise<boolean>;
/**
 * Execute a system-level global action (home, back, recents, etc.).
 */
export declare function globalAction(action: GlobalAction): Promise<boolean>;
/**
 * Open an app by its Android package name.
 */
export declare function openApp(packageName: string): Promise<boolean>;
/**
 * Returns a list of all user-launchable apps installed on the device.
 * Each entry includes the Android package name and the human-readable label.
 */
export declare function getInstalledApps(): Promise<InstalledApp[]>;
/**
 * Show a floating overlay window with the given configuration.
 */
export declare function showOverlay(config: OverlayConfig): Promise<void>;
/**
 * Update the content of the agent-status overlay (action text + step count).
 * No-op if no overlay is currently shown.
 */
export declare function updateOverlay(config: OverlayUpdateConfig): Promise<void>;
/**
 * Hide the floating overlay window.
 */
export declare function hideOverlay(): Promise<void>;
/**
 * Subscribe to the overlay stop button tap event.
 * Fired when the user taps the Stop (■) button in the agent-status overlay.
 *
 * Returns a Subscription — call `.remove()` to unsubscribe.
 */
export declare function onOverlayStop(callback: () => void): Subscription;
/**
 * Subscribe to raw accessibility events.
 *
 * Returns a Subscription — call `.remove()` to unsubscribe when done.
 */
export declare function onAccessibilityEvent(callback: (event: A11yEvent) => void): Subscription;
/**
 * Subscribe to window-change events.
 *
 * Returns a Subscription — call `.remove()` to unsubscribe when done.
 */
export declare function onWindowChange(callback: (window: WindowInfo) => void): Subscription;
/**
 * Ask the user to grant screen-capture permission via the system dialog.
 * Returns `true` if permission was granted, `false` if denied.
 *
 * Must be called before `captureWithMediaProjection()`. On Android 14+, a
 * foreground service with `foregroundServiceType="mediaProjection"` must be
 * running before the first capture.
 */
export declare function requestMediaProjection(): Promise<boolean>;
/**
 * Capture a screenshot using the previously granted MediaProjection permission.
 * Returns a base64-encoded PNG string.
 *
 * Faster than `takeScreenshot()` and does not require the AccessibilityService.
 */
export declare function captureWithMediaProjection(): Promise<string>;
/**
 * Stop the active MediaProjection session and release all associated resources.
 * Call this when screen capture is no longer needed.
 */
export declare function releaseMediaProjection(): Promise<void>;
/**
 * Check whether the AccessibilityService is currently enabled.
 */
export declare function isServiceEnabled(): Promise<boolean>;
/**
 * Prompt the user to enable the AccessibilityService in Android settings.
 */
export declare function requestServiceEnable(): Promise<void>;
/**
 * Check whether the SYSTEM_ALERT_WINDOW ("Draw over other apps") permission
 * has been granted. Returns true on non-Android platforms.
 */
export declare function canDrawOverlays(): Promise<boolean>;
/**
 * Opens the system "Draw over other apps" settings page for this package.
 * Call canDrawOverlays() after the user returns to verify the grant.
 * No-op on non-Android platforms (always permitted).
 */
export declare function requestOverlayPermission(): Promise<void>;
export type { UseAccessibilityTreeOptions, UseAccessibilityTreeResult, UseScreenTextOptions, UseScreenTextResult, UseAccessibilityEventsOptions, ServiceStatus, UseOverlayResult, } from './hooks';
export { useAccessibilityTree, useScreenText, useAccessibilityEvents, useWindowChange, useServiceStatus, useOverlay, } from './hooks';
//# sourceMappingURL=index.d.ts.map