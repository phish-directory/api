import Vapor
import JWT

// configures your application
public func configure(_ app: Application) async throws {

    let corsConfiguration = CORSMiddleware.Configuration(
    allowedOrigin: .all,
    allowedMethods: [.GET, .POST, .PUT, .OPTIONS, .DELETE, .PATCH],
    allowedHeaders: [.accept, .authorization, .contentType, .origin, .xRequestedWith, .userAgent, .accessControlAllowOrigin]
)
let cors = CORSMiddleware(configuration: corsConfiguration)
// cors middleware should come before default error middleware using `at: .beginning`
app.middleware.use(cors, at: .beginning)

    // register routes
    try routes(app)
}