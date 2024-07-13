import Foundation
import Vapor

struct Phisherman {

// check function that returns data
  func check(domain: String) async -> {

    guardDomain(domain)

    let domain = domain.canonicalizeURL()

    let apiKey = ProcessInfo.processInfo.environment["PHISHERMAN_API_KEY"]

    let url = URL(
      string: "https://api.phisherman.gg/v2/domains/check/\(domain)")!

    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    request.setValue("internal-server@phish.directory", forHTTPHeaderField: "User-Agent")
    request.setValue("internal-server@phish.directory", forHTTPHeaderField: "X-Identity")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("https://phish.directory", forHTTPHeaderField: "Referer")

    // add bearer token
    request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")

    // make the request
    let (data, _) = try await URLSession.shared.data(for: request)

    let response = try JSONDecoder().decode(PhishermanResponse.self, from: data)

    return response
  }
}
