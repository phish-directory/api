// create a GoogleSafeBrowsing service with 2 methods, check and report
// check will take a url and return if it is a phish or not
// report will take a url and report it as a phish
// the service will use the Google Safe Browsing API
// https://developers.google.com/safe-browsing/v4

import Foundation
import Vapor

struct GoogleSafeBrowsing {

  struct GoogleSafeBrowsingResponse: Codable {
    // Define the structure of the response type here
  }

  func check(domain: String) async {

    guardDomain(domain)

    let domain = domain.canonicalizeURL()

    let apiKey = ProcessInfo.processInfo.environment["GOOGLE_API_KEY"] ?? ""
    let url = URL(
      string: "https://www.google.com/safebrowsing/v4/threatMatches:find?key=\(apiKey)")!

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("internal-server@phish.directory", forHTTPHeaderField: "User-Agent")
    request.setValue("internal-server@phish.directory", forHTTPHeaderField: "X-Identity")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("https://phish.directory", forHTTPHeaderField: "Referer")

    // set request body
    let reqBody = [
      "client": [
        "clientId": "phish.directory",
        "clientVersion": "1.0.0",
      ],
      "threatInfo": [
        "threatTypes": [
          "MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION",
        ],
        "platformTypes": ["ANY_PLATFORM"],
        "threatEntryTypes": ["URL"],
        "threatEntries": [
          ["url": domain]
        ],
      ],
    ]

    request.httpBody = try JSONSerialization.data(withJSONObject: reqBody)
    let (data, _) = try await URLSession.shared.data(for: request)

    let response = try JSONDecoder().decode(GoogleSafeBrowsingResponse.self, from: data)

    return response
  }

  // func report(url: String) async throws {
  //   return
  // }

}
