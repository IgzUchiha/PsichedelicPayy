# Build stage
FROM rust:1.68-bullseye AS builder

# Install nightly toolchain
RUN rustup toolchain install nightly-2023-01-04 && \
    rustup default nightly-2023-01-04 && \
    rustup component add clippy

# Install build dependencies including Go (required by geth-utils)
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    libclang-dev \
    cmake \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Go 1.21
RUN wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz \
    && tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz \
    && rm go1.21.5.linux-amd64.tar.gz
ENV PATH="/usr/local/go/bin:${PATH}"

WORKDIR /app

# Copy workspace files
COPY Cargo.toml Cargo.lock rust-toolchain.toml ./
COPY pkg ./pkg

# Build release binary
RUN cargo build --release --bin node

# Runtime stage
FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl1.1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/target/release/node /app/node

# Copy fixtures if needed (params for ZK proofs)
COPY fixtures ./fixtures

# Create data directories
RUN mkdir -p /data/db /data/smirk

# Expose RPC port
EXPOSE 8080

# Set environment variables
ENV POLY_RPC__LADDR="0.0.0.0:8080"
ENV POLY_DB__PATH="/data/db"
ENV POLY_SMIRK__PATH="/data/smirk"

CMD ["/app/node"]
