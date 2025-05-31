# Starlight 2.0.0 🌟

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Rust](https://img.shields.io/badge/rust-2024-orange.svg)](https://www.rust-lang.org/)
[![Development Status](https://img.shields.io/badge/status-alpha-red.svg)](https://github.com/EvarinDev/Starlight)

> A modern Discord bot framework built with Rust, featuring a modular architecture and powerful API capabilities.

## 🚧 Development Status

**⚠️ Alpha Version**: Starlight 2.0.0 is currently in active development. Features and APIs may change without notice.

## 📋 Overview

Starlight is a next-generation Discord bot framework designed with performance, modularity, and developer experience in mind. Built entirely in Rust, it leverages the power of async/await patterns and modern Discord API features.

### 🏗️ Architecture

The project is organized into three main components:

- **🔧 Bootstrap**: Initialization and configuration management
- **🌐 StarlightAPI**: Database abstraction and API layer with PostgreSQL support
- **⚡ StarlightCore**: Discord bot core functionality using the Twilight library

## ✨ Features

- 🚀 **High Performance**: Built with Rust for maximum speed and memory safety
- 🔄 **Async/Await**: Fully asynchronous architecture using Tokio
- 🗄️ **Database Integration**: PostgreSQL support via SeaORM
- 🎯 **Discord API**: Complete Discord API coverage through Twilight
- 🧩 **Modular Design**: Clean separation of concerns across multiple crates
- 📊 **Caching**: In-memory caching for optimal performance
- 🔐 **Type Safety**: Leverages Rust's type system for reliable code

## 🛠️ Tech Stack

| Component      | Technology                                  | Purpose               |
| -------------- | ------------------------------------------- | --------------------- |
| Runtime        | [Tokio](https://tokio.rs/)                  | Async runtime         |
| Discord API    | [Twilight](https://twilight.rs/)            | Discord bot framework |
| Database       | [SeaORM](https://www.sea-ql.org/SeaORM/)    | ORM for PostgreSQL    |
| Serialization  | [Serde](https://serde.rs/)                  | JSON handling         |
| Error Handling | [Anyhow](https://github.com/dtolnay/anyhow) | Error management      |

## 🚀 Quick Start

### Prerequisites

- Rust 2024 Edition or later
- PostgreSQL database
- Discord Bot Token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EvarinDev/Starlight.git
   cd Starlight
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Discord token and database credentials
   ```

3. **Build the project**
   ```bash
   cargo build
   ```

4. **Run the bot**
   ```bash
   cargo run --bin StarlightCore
   ```

### Environment Configuration

Create a `.env` file in the project root:

```env
DISCORD_TOKEN=your_discord_bot_token_here
DATABASE_URL=postgresql://username:password@localhost/starlight_db
```

## 🏗️ Project Structure

```
Starlight/
├── Bootstrap/           # Initialization and bootstrap logic
│   ├── src/
│   │   └── main.rs     # Bootstrap entry point
│   └── Cargo.toml
├── StarlightAPI/        # Database and API layer
│   ├── src/
│   │   └── main.rs     # API server entry point
│   └── Cargo.toml      # Database dependencies (SeaORM, etc.)
├── StarlightCore/       # Discord bot core
│   ├── src/
│   │   └── main.rs     # Bot main logic with Twilight
│   ├── test/           # Core functionality tests
│   └── Cargo.toml      # Discord API dependencies
├── Cargo.toml           # Workspace configuration
└── README.md
```

## 🧩 Components

### Bootstrap
The initialization system responsible for:
- Configuration loading
- Environment setup
- Service orchestration

### StarlightAPI
Database and API management featuring:
- PostgreSQL integration via SeaORM
- RESTful API endpoints
- Data persistence layer
- Environment configuration

### StarlightCore
The heart of the Discord bot with:
- Discord Gateway connection via Twilight
- Event handling and processing
- Message and interaction management
- In-memory caching system
- Guild and user state management

## 🔧 Development

### Building Individual Components

```bash
# Build all components
cargo build

# Build specific component
cargo build -p Bootstrap
cargo build -p StarlightAPI
cargo build -p StarlightCore
```

### Running Tests

```bash
# Run all tests
cargo test

# Run tests for specific component
cargo test -p StarlightCore
```

### Development Dependencies

The project uses several key Rust crates:

- **Twilight Ecosystem**: Complete Discord API coverage
  - `twilight-gateway`: WebSocket connection management
  - `twilight-http`: HTTP API client
  - `twilight-cache-inmemory`: Efficient caching
  - `twilight-model`: Discord API types
  - `twilight-interactions`: Slash commands and interactions

- **Database Layer**:
  - `sea-orm`: Modern ORM with async support
  - `sqlx-postgres`: PostgreSQL driver

- **Async Runtime**:
  - `tokio`: Async runtime with full feature set
  - `futures-util`: Additional async utilities

## 📚 Documentation

Documentation is currently being developed alongside the codebase. For now, refer to:

- [Twilight Documentation](https://twilight.rs/) for Discord API usage
- [SeaORM Guide](https://www.sea-ql.org/SeaORM/) for database operations
- [Tokio Tutorial](https://tokio.rs/tokio/tutorial) for async programming

## 🤝 Contributing

Starlight is in active development and welcomes contributions! Please note that as an alpha project, the API is subject to breaking changes.

### Development Guidelines

1. Follow Rust conventions and use `rustfmt`
2. Ensure all tests pass before submitting PRs
3. Update documentation for new features
4. Use conventional commit messages

## 📝 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **EvarinDev** - *Initial work and project maintainer*

## 🗺️ Roadmap

- [ ] Complete API layer implementation
- [ ] Add comprehensive test coverage
- [ ] Implement plugin system
- [ ] Add configuration management UI
- [ ] Performance optimization and benchmarking
- [ ] Documentation website
- [ ] Docker containerization
- [ ] CI/CD pipeline setup

## ⚠️ Disclaimer

This project is in alpha development. Use in production environments is not recommended until a stable release is available.

---

**Built with ❤️ and ⚡ by the EvarinDev**