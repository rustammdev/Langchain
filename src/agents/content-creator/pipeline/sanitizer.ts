export const enforceTwitterLimits = (thread: string[]) =>
    thread.map(t => t.length > 260 ? t.slice(0, 257) + '...' : t);