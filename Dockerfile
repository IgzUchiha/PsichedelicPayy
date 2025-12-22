# Stage 1: Build Solidity contracts
FROM node:18-bullseye AS eth-builder

WORKDIR /app/eth

# Copy eth package files
COPY eth/package.json eth/yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy contract sources and compile
COPY eth/ ./
RUN yarn hardhat compile

# Stage 2: Build Rust binary
FROM rust:1.68-bullseye AS builder

# Install nightly toolchain
RUN rustup toolchain install nightly-2023-01-04 && \
    rustup default nightly-2023-01-04 && \
    rustup component add clippy

# Install build dependencies with retry logic for network issues
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    libclang-dev \
    cmake \
    wget \
    ca-certificates \
    || (sleep 5 && apt-get update && apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    libclang-dev \
    cmake \
    wget \
    ca-certificates) \
    && rm -rf /var/lib/apt/lists/*

# Install Go 1.21
RUN wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz \
    && tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz \
    && rm go1.21.5.linux-amd64.tar.gz
ENV PATH="/usr/local/go/bin:${PATH}"

WORKDIR /app

# Copy compiled contract artifacts from eth-builder
COPY --from=eth-builder /app/eth/artifacts ./eth/artifacts

# Copy workspace files
COPY Cargo.toml Cargo.lock rust-toolchain.toml ./
COPY pkg ./pkg

# Copy fixtures BEFORE building (needed for include_bytes! macro)
COPY fixtures ./fixtures

# Verify the param files exist and have actual content (not LFS pointers)
RUN echo "Checking fixtures..." && \
    ls -la fixtures/params/ && \
    file fixtures/params/kzg_bn254_6.srs && \
    test $(stat -c%s fixtures/params/kzg_bn254_6.srs) -gt 1000 || \
    (echo "ERROR: LFS files not fetched! File is too small." && exit 1)

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
