![Solana](https://img.shields.io/badge/Solana-14F195?style=flat-square&logo=solana&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white)
![Anchor](https://img.shields.io/badge/Anchor-667EEA?style=flat-square)

# QA Sandbox Smart Contract

Solana smart contract на Anchor Framework - защищённый счётчик с тестами.

## Требования

Проект протестирован и работает на следующих версиях:

| Компонент | Версия | Команда проверки |
|-----------|--------|------------------|
| **Node.js** | 20.20.0 | `node --version` |
| **Yarn** | 1.22.22 | `yarn --version` |
| **Rust** | 1.89.0 | `rustc --version` |
| **Solana CLI** | 2.2.20 | `solana --version` |
| **Anchor** | 0.32.1 | `anchor --version` |

### Установка зависимостей

```bash
# Node.js (через nvm рекомендуется)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Yarn
npm install -g yarn

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.32.1
avm use 0.32.1
