import Foundation

extension String {
    func removingCharacters(in characterSet: CharacterSet) -> String {
        return self.unicodeScalars.filter { !characterSet.contains($0) }.map { String($0) }.joined()
    }

    func percentUnescaped() -> String {
        return self.removingPercentEncoding ?? self
    }

    func canonicalizeURL() -> String? {
        guard var components = URLComponents(string: self) else { return nil }

        // Step 1: Remove tab (0x09), CR (0x0d), and LF (0x0a) characters
        let unwantedCharacterSet = CharacterSet(charactersIn: "\u{09}\u{0D}\u{0A}")
        let sanitizedURL = self.removingCharacters(in: unwantedCharacterSet)

        // Step 2: Remove the fragment
        components = URLComponents(string: sanitizedURL) ?? components
        components.fragment = nil

        // Step 3: Repeatedly percent-unescape the URL
        var percentUnescapedURL = components.string ?? sanitizedURL
        var previousUnescapedURL: String
        repeat {
            previousUnescapedURL = percentUnescapedURL
            percentUnescapedURL = previousUnescapedURL.percentUnescaped()
        } while percentUnescapedURL != previousUnescapedURL

        // Convert to ASCII Punycode if it's an internationalized domain name (IDN)
        if let host = components.host, let punycodeHost = host.applyingTransform(.toLatin, reverse: false) {
            components.host = punycodeHost
        }

        // Ensure URL has a path component
        if components.path.isEmpty {
            components.path = "/"
        }

        return components.string
    }
}

// Example usage
// if let canonicalizedURL = "http://google.com/#frag".canonicalizeURL() {
//     print("Canonicalized URL: \(canonicalizedURL)")
// }
