import Vapor
import JWT

// configures your application
public func configure(_ app: Application) async throws {
    // register routes
    try routes(app)
}
