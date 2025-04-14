# phish.directory API

API for [phish.directory](https://phish.directory), a community-driven anti-phishing tool.  
We help catch, prevent, and catalog phishing links and attempts.

---

## 🚀 Overview

This is the backend API that powers [phish.directory](https://phish.directory).  
It provides endpoints to submit, verify, and retrieve phishing reports.  
Built with Express.js and TypeScript. Uses Drizzle ORM.

---

## 📚 Documentation

- API Docs: [api.phish.directory/docs](https://api.phish.directory/docs/)
- Postman Collection: [Postman Workspace](https://www.postman.com/phishdirectory/workspace/phish-directory)

---

## ⚙ Tech Stack

- **TypeScript**
- **Express.js**
- **Drizzle ORM**
- **Docker** (for development)
- **Playwright** (for testing)

---

## 🛠 Getting Started

Clone the repo and install dependencies:

```bash
git clone https://github.com/phishdirectory/api.git
cd api
bun install
```

Start the development server:

```bash
bun dev
```

To run tests:

```bash
bun test
```

---

## 🐳 Docker

To run with Docker:

```bash
docker compose up --build
```

---

## 🤝 Contributing

We welcome contributions!  
Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) and [Security Policy](./SECURITY.md) before submitting a PR.

---

## 📄 License

AGPL-3.0  
See [LICENSE](./LICENSE) for details.
