import Foundation

enum AccountType: String, Codable {
  case user
  case bot
  case admin
}

struct User {
  var id: UUID?
  var name: String
  var email: String
  var accountType: AccountType
  var passwordHash: String
  var dateCreated: Date
  var dateUpdated: Date
  var dateDeleted: Date?
}

extension User {
  var isDeleted: Bool {
    return dateDeleted != nil
  }
}