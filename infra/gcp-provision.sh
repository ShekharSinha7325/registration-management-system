#!/bin/bash
# ============================================================
# GCP Provisioning Script — Registration Management System
# Creates 3 isolated environments: dev / qa / prod
# Run this ONCE per environment (pass env name as arg)
# Usage: ./gcp-provision.sh dev   (or qa / prod)
# ============================================================
set -euo pipefail

ENV=${1:?"Usage: ./gcp-provision.sh <dev|qa|prod>"}
BILLING_ACCOUNT_ID="XXXXXX-XXXXXX-XXXXXX"   # <-- replace with: gcloud billing accounts list
ORG_ID=""                                   # optional, leave blank if not using an org
PROJECT_ID="registration-${ENV}-$(date +%s | tail -c 6)"
REGION="asia-south1"
ZONE="asia-south1-a"
VM_NAME="${ENV}-vm"
MACHINE_TYPE="e2-small"          # bump to e2-medium for prod if needed
IMAGE_FAMILY="ubuntu-2204-lts"
IMAGE_PROJECT="ubuntu-os-cloud"

echo ">>> Creating project: $PROJECT_ID"
gcloud projects create "$PROJECT_ID" --name="registration-${ENV}"

echo ">>> Linking billing account"
gcloud billing projects link "$PROJECT_ID" --billing-account="$BILLING_ACCOUNT_ID"

gcloud config set project "$PROJECT_ID"

echo ">>> Enabling required APIs"
gcloud services enable compute.googleapis.com

echo ">>> Reserving static external IP"
gcloud compute addresses create "${ENV}-ip" --region="$REGION"
STATIC_IP=$(gcloud compute addresses describe "${ENV}-ip" --region="$REGION" --format="get(address)")

echo ">>> Creating firewall rules (22, 80, 443)"
gcloud compute firewall-rules create "${ENV}-allow-ssh-http-https" \
  --allow=tcp:22,tcp:80,tcp:443 \
  --direction=INGRESS \
  --target-tags="${ENV}-server" \
  --source-ranges=0.0.0.0/0

echo ">>> Creating Compute Engine VM: $VM_NAME"
gcloud compute instances create "$VM_NAME" \
  --zone="$ZONE" \
  --machine-type="$MACHINE_TYPE" \
  --image-family="$IMAGE_FAMILY" \
  --image-project="$IMAGE_PROJECT" \
  --tags="${ENV}-server" \
  --address="$STATIC_IP" \
  --metadata-from-file=startup-script=./vm-startup.sh

echo ">>> Done. Project: $PROJECT_ID | VM: $VM_NAME | Static IP: $STATIC_IP"
echo ">>> Add these as GitHub Secrets:"
echo "    ${ENV^^}_VM_IP=$STATIC_IP"
echo "    ${ENV^^}_VM_USER=<your ssh user, e.g. github-deployer>"
echo "    ${ENV^^}_SSH_KEY=<private key contents>"
echo "    ${ENV^^}_MONGODB_URI=<mongodb atlas connection string>"
