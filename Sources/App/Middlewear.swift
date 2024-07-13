import Vapor

struct AuthTokenMiddlewear: AsyncMiddleware {
    func respond(to request: Request, chainingTo next: AsyncResponder) async throws -> Response {

        //         guard let token = request.headers.bearerAuthorization?.token else {
        //             throw Abort(.unauthorized)
        //         }

        //         guard token == "secret" else
        //         {
        //             throw Abort(.unauthorized)
        //         }

        return try await next.respond(to: request)

    }
}
