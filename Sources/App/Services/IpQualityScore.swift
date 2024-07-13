import Foundation
import Vapor

struct IpQualityScore {

// check function that returns data
  func check(domain: String) async -> {

    guardDomain(domain)

    let domain = domain.canonicalizeURL()

    let apiKey = ProcessInfo.processInfo.environment["IPQS_API_KEY"]
    let url = URL(
      string: "https://www.ipqualityscore.com/api/json/url/\(apiKey)/\(domain)")!

    var request = URLRequest(url: url)
    request.httpMethod = "GET"
    request.setValue("internal-server@phish.directory", forHTTPHeaderField: "User-Agent")
    request.setValue("internal-server@phish.directory", forHTTPHeaderField: "X-Identity")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("https://phish.directory", forHTTPHeaderField: "Referer")

    // make the request
    let (data, _) = try await URLSession.shared.data(for: request)

    let response = try JSONDecoder().decode(IpQualityScoreResponse.self, from: data)

    return response
  }

}