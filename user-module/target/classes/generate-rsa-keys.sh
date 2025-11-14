#!/bin/bash
# Generate RSA key pair for password encryption
# This script generates a 2048-bit RSA key pair

echo "Generating RSA key pair..."

# Generate private key
openssl genpkey -algorithm RSA -out rsa-private.pem -pkeyopt rsa_keygen_bits:2048

# Generate public key from private key
openssl rsa -pubout -in rsa-private.pem -out rsa-public.pem

echo "RSA key pair generated successfully!"
echo "Private key: rsa-private.pem"
echo "Public key: rsa-public.pem"
echo ""
echo "Please copy these files to src/main/resources/ directory"

