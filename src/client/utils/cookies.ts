// Client-side utility to get user info from cookies
export function getCurrentUserFromCookies(): string | null {
    if (typeof document === "undefined") return null;

    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "username") {
            return decodeURIComponent(value);
        }
    }
    return null;
}
