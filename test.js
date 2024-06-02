// function getFullUrl(url) {
//     // Create a new URL object
//     const parsedUrl = new URL(url);

//     // Check if protocol is missing
//     if (!parsedUrl.protocol) {
//         // Prepend http:// if requested protocol is http
//         parsedUrl.protocol =
//             (window.location.protocol === "http:" ? "http" : "https") + "://";
//     }

//     // Get the full URL string
//     const fullUrl = parsedUrl.toString();

//     // Check if www prefix is missing
//     if (!fullUrl.startsWith("www.")) {
//         // Prepend www. if not present
//         return `www.${fullUrl}`;
//     }

//     return fullUrl;
// }

function getFullUrl(url) {
    const protocol =
        url.startsWith("http") && !url.startsWith("https") ? "http" : "https";
    const pureUrl = url
        .replace("https://", "")
        .replace("http://", "")
        .replace("www.", "");
    return `${protocol}://www.${pureUrl}`;
}

// Test cases
const urls = [
    "https://www.google.com",
    "https://google.com",
    "google.com",
    "www.google.com",
    "http://example.com", // Preserve http
];

for (const url of urls) {
    const fullUrl = getFullUrl(url);
    console.log(fullUrl);
}
