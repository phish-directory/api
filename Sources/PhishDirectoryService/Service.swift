import OpenAPIRuntime
import OpenAPIVapor
import Vapor
import PostgresNIO

@main
struct Service {
  let postgresClient: PostgresClient

  static func main() async throws {

    let postgresClient = PostgresClient(
      configuration: .init (
        host: "localhost",
        username: "phish",
        password: nil,
        database: nil,
        tls: .disable
      )
    )

    let service = Service(postgresClient: postgresClient)

  }
}