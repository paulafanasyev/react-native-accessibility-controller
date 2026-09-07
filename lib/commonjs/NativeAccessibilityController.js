"use strict";
/**
 * TurboModule spec for react-native-accessibility-controller.
 *
 * This file is the source-of-truth for codegen. React Native's codegen reads
 * it to generate the C++ TurboModule glue that bridges Kotlin ↔ JS without
 * going through the legacy bridge.
 *
 * All method signatures here must match AccessibilityControllerModule.kt.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_1 = require("react-native");
exports.default = react_native_1.TurboModuleRegistry.getEnforcing('AccessibilityController');
