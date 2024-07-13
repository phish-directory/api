import Vapor

func routes(_ app: Application) throws {
    app.get { req async throws in
        "It works! Check out the api docs if you need docs"
    }

    app.get("health") { req async throws in
       // return stats about the server in json format
        return [
            "status": "ok",
            "uptime": "1234",
            ]
    }

    app.get("check") { req async throws in

       guard let url = req.query[String.self, at: "url"] else {
        throw Abort(.badRequest, reason: "Missing URL")
    }


// set gsb to the GoogleSafeBrowsing service
    let gsb = GoogleSafeBrowsing()
    let gsbResponse = try await gsb.check(domain: url)

    // check if gsb response is an empty object
    if gsbResponse.isEmpty {
        return [
            "url": url,
            "isPhish": "false"
        ]
    } else {
        return [
            "url": url,
            "isPhish": "true"
        ]
    }


    // let urls = [
    //     "google.com",
    //     "apple.com",
    // ]

    // if urls.contains(url) {
    //     return [
    //         "url": url,
    //         "isPhish": "true"
    //     ]
    // } else {
    //     return [
    //         "url": url,
    //         "isPhish": "false"
    //     ]
    // }

    }

    // // check if the req.body contains the key "url"
    // guard let url = req.query[String.self, at: "url"] else {
    //     throw Abort(.badRequest)
    // }

    // // check if the url is in the urls array, and return if it is
    // if urls.contains(url) {
    //     return "URL is in the list"

    // } else {
    //     return "URL is not in the list"
    // }



    }
