/// <reference types="expo/types/metro-require" />

import { ExpoRoot } from "expo-router";

// Compatibility component for tools that still import App.tsx. The configured
// entry is expo-router/entry; providers and navigation live in src/app/_layout.tsx.
export default function App() {
  const context = require.context("./src/app");
  return <ExpoRoot context={context} />;
}
