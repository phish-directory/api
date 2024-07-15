import Foundation

enum LinkType: String, Codable {
  case unknown
  case discord
  case instagram
  case other
}

struct Link: Codable {
  var id: UUID?
  var link: String
  var type: LinkType
  var reportedBy: UUID?
  var dateReported: Date
}
