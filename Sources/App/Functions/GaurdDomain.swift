// create a function that checks if a string is null or empty, and throws an error if it is
func guardDomain(_ domain: String) throws {
  guard !domain.isEmpty else {
    throw Abort(.badRequest, reason: "Missing Domain")
  }
}
