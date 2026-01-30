# Performance Budget Overlay

A dev-friendly performance overlay for the RuntimeNotes blog to monitor Web Vitals and resource budgets in real-time.

## Features
- **Web Vitals**: Real-time measurement of LCP, CLS, INP, and TTFB.
- **Resource Tracking**: Groups JS, CSS, and Fonts with total size measurements.
- **Budget Monitoring**: Pass/Fail indicators based on configurable thresholds.
- **Critical Requests**: Identifying render-blocking or high-impact resources.
- **Snapshot Support**: One-click copy of performance data to clipboard.

## How to Enable

The overlay is off by default for production users. You can enable it using any of the following methods:

1. **URL Parameter**: Append `?perf=1` to the URL.
2. **Local Storage**: Set `localStorage.setItem('PERF_OVERLAY', '1')` in the console.
3. **Development Mode**: Enabled by default in `npm run dev`.

## Metrics Explained

| Metric | Target | Description |
|--------|--------|-------------|
| **LCP** | <= 2500ms | Largest Contentful Paint: Marks the point when the main content has likely loaded. |
| **CLS** | <= 0.1 | Cumulative Layout Shift: Measures visual stability. |
| **INP** | <= 200ms | Interaction to Next Paint: Measures responsiveness to user input. |
| **TTFB** | <= 600ms | Time to First Byte: Time taken for the server to send the first byte of data. |

## Budget Thresholds (Configurable)

Budgets are defined in `src/lib/perf/overlayConfig.js`:
- **JS Total**: 200 KB (target gzip size)
- **CSS Total**: 50 KB
- **Fonts Total**: 120 KB

## Implementation Details
- **Zero Impact**: Code is lazy-loaded and only runs when enabled.
- **Collectors**: Uses `PerformanceObserver` for vitals and `ResourceTiming` for assets.
- **Privacy**: No data leaves the browser; snapshots are copied to your clipboard locally.

## Known Limitations
- **Size Reporting**: `transferSize` may be 0 for cross-origin resources if `Timing-Allow-Origin` headers are missing.
- **INP Verification**: INP measurements require user interaction with the page to populate.
