// swift-tools-version: 5.10
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "phish.directory",
    products: [
        // Products define the executables and libraries a package produces, making them visible to other packages.
        .library(
            name: "phish.directory",
            targets: ["phish.directory"]),
    ],
     dependencies: [
        .package(url: "https://github.com/vapor/vapor", from: "4.102.0"),
        .package(url: "https://github.com/swift-server/swift-openapi-vapor", from: "1.0.1"),
        .package(url: "https://github.com/vapor/postgres-nio", from: "1.21.5")
    ],
    targets: [
        // Targets are the basic building blocks of a package, defining a module or a test suite.
        // Targets can depend on other targets in this package and products from dependencies.
        .executableTarget(name: "phish.directory"),
    ]
)
