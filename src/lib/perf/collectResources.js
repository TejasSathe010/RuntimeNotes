/**
 * Groups and summarizes Resource Timing entries
 */
export const collectResources = () => {
    const entries = performance.getEntriesByType('resource');
    const summary = {
        js: { count: 0, size: 0, entries: [] },
        css: { count: 0, size: 0, entries: [] },
        font: { count: 0, size: 0, entries: [] },
        img: { count: 0, size: 0, entries: [] },
        other: { count: 0, size: 0, entries: [] },
        critical: [],
    };

    entries.forEach(entry => {
        const { name, initiatorType, transferSize, encodedBodySize, duration, startTime } = entry;
        const size = transferSize || encodedBodySize || 0;

        let type = 'other';
        if (name.endsWith('.js') || initiatorType === 'script') type = 'js';
        else if (name.endsWith('.css') || initiatorType === 'link') type = 'css';
        else if (name.endsWith('.woff2') || name.endsWith('.woff') || initiatorType === 'css') {
            // initiatorType common for fonts is 'css' or 'other'
            if (name.match(/\.(woff2|woff|ttf|otf)/) || initiatorType === 'font') type = 'font';
        }
        else if (initiatorType === 'img' || name.match(/\.(png|jpg|jpeg|svg|webp|avif)/)) type = 'img';

        summary[type].count++;
        summary[type].size += size;
        summary[type].entries.push({
            name: name.split('/').pop(),
            size,
            duration,
            startTime
        });

        // Critical Request Heuristic:
        // 1. Render-blocking CSS/Fonts
        // 2. Large resources ( > 50KB )
        // 3. Slow resources ( > 500ms )
        if (type === 'css' || type === 'font' || size > 51200 || duration > 500) {
            summary.critical.push({
                name: name.split('/').pop(),
                type,
                size,
                duration,
                reason: getReason(type, size, duration)
            });
        }
    });

    // Sort critical by impact
    summary.critical.sort((a, b) => b.size - a.size);

    return summary;
};

const getReason = (type, size, duration) => {
    const reasons = [];
    if (type === 'css') reasons.push('CSS');
    if (type === 'font') reasons.push('Font');
    if (size > 51200) reasons.push('Large');
    if (duration > 500) reasons.push('Slow');
    return reasons.join(', ');
};
