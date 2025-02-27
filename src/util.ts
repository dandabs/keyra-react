export function toSentenceCase(str: string) {
    if (!str) return "";
    str = str.trim();
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}