/**
 * React hooks for react-native-accessibility-controller.
 *
 * These hooks handle lifecycle management (cleanup on unmount, polling
 * teardown) so callers don't have to wire subscriptions manually.
 *
 * Imports are done directly from the native module (not from ./index) to
 * avoid a circular dependency.
 */
import type { AccessibilityNode, A11yEvent, WindowInfo, OverlayConfig, OverlayUpdateConfig } from './types';
export interface UseAccessibilityTreeOptions {
    /**
     * Automatically poll the tree every `pollIntervalMs` milliseconds.
     * Pass `undefined` (default) to disable automatic polling — you can
     * still refresh manually via the returned `refresh()` callback.
     */
    pollIntervalMs?: number;
    /**
     * Fetch the tree immediately on mount (default: true).
     */
    fetchOnMount?: boolean;
}
export interface UseAccessibilityTreeResult {
    tree: AccessibilityNode[] | null;
    loading: boolean;
    error: Error | null;
    /** Manually trigger a fresh fetch. */
    refresh: () => void;
}
/**
 * Fetches and optionally polls the accessibility tree of the current screen.
 *
 * ```tsx
 * const { tree, loading, error, refresh } = useAccessibilityTree({
 *   pollIntervalMs: 1000,
 * });
 * ```
 */
export declare function useAccessibilityTree(options?: UseAccessibilityTreeOptions): UseAccessibilityTreeResult;
export interface UseAccessibilityEventsOptions {
    /**
     * Maximum number of events to keep in the buffer (default: 50).
     * Oldest events are dropped when the buffer is full.
     */
    maxEvents?: number;
}
/**
 * Subscribes to raw accessibility events and returns a rolling buffer.
 *
 * ```tsx
 * const events = useAccessibilityEvents({ maxEvents: 20 });
 * ```
 */
export declare function useAccessibilityEvents(options?: UseAccessibilityEventsOptions): A11yEvent[];
export interface ServiceStatus {
    /** True when the AccessibilityService is running. */
    isEnabled: boolean;
    /** True when the SYSTEM_ALERT_WINDOW ("Draw over other apps") permission is granted. */
    canDrawOverlays: boolean;
    /** True while the initial status check is in progress. */
    loading: boolean;
    error: Error | null;
    /** Manually re-check both permissions immediately. */
    refresh: () => void;
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
export declare function useServiceStatus(options?: {
    pollIntervalMs?: number;
}): ServiceStatus;
export interface UseScreenTextOptions {
    /**
     * Automatically poll the serialised screen text every `pollIntervalMs` ms.
     * Pass `undefined` (default) to disable automatic polling.
     */
    pollIntervalMs?: number;
    /**
     * Fetch immediately on mount (default: true).
     */
    fetchOnMount?: boolean;
}
export interface UseScreenTextResult {
    text: string | null;
    loading: boolean;
    error: Error | null;
    /** Manually trigger a fresh fetch. */
    refresh: () => void;
}
/**
 * Fetches and optionally polls the serialised text representation of the
 * current screen. Useful for showing a live preview of what the agent sees.
 *
 * ```tsx
 * const { text, loading } = useScreenText({ pollIntervalMs: 2000 });
 * ```
 */
export declare function useScreenText(options?: UseScreenTextOptions): UseScreenTextResult;
/**
 * Subscribes to window-change events and returns the latest active window.
 *
 * ```tsx
 * const win = useWindowChange();
 * console.log(win?.packageName); // "com.example.app"
 * ```
 */
export declare function useWindowChange(): WindowInfo | null;
export interface UseOverlayResult {
    /** True while the native overlay window is shown. */
    isVisible: boolean;
    /** Show the overlay with the given configuration. */
    show: (config: OverlayConfig) => Promise<void>;
    /** Update the overlay content (action text and step count). No-op if not visible. */
    update: (config: OverlayUpdateConfig) => Promise<void>;
    /** Hide the overlay. */
    hide: () => Promise<void>;
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
export declare function useOverlay(options?: {
    onStop?: () => void;
}): UseOverlayResult;
//# sourceMappingURL=hooks.d.ts.map