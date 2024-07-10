import Vapor

func routes(_ app: Application) throws {
    app.get { req async throws in
        "It works! Check out the api docs if you need docs"
    }

    app.get("health") { req async throws in
        "OK"
    }

    app.get("check") { req async throws in

    let urls = [
        "google.com",
        "apple.com",
    ]

    // check if the req.body contains the key "url"
    guard let url = req.query[String.self, at: "url"] else {
        throw Abort(.badRequest)
    }

    // check if the url is in the urls array, and return if it is
    if urls.contains(url) {
        return "URL is in the list"

    } else {
        return "URL is not in the list"
    }


    }
}
