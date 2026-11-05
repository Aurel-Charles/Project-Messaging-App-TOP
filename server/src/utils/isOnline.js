
const ONLINE_THRESHOLD_MS = 2 * 60 * 1000 // 2min

export function isOnline(lastSeenAt) {
    const now = new Date()
    return  now - lastSeenAt < ONLINE_THRESHOLD_MS
}