# Registration Management System — 3-Environment Deployment Guide

Full stack: **Node.js/Express + MongoDB** (backend) and **React** (frontend), deployed to
**GCP Compute Engine VMs** across `dev` / `qa` / `prod`, using **Nginx**, **PM2**, and
**GitHub Actions** for CI/CD. Same architecture as your existing Student Management System.

```
GitHub Repo → Branches (dev/qa/prod) → GitHub Actions → GCP VM (Nginx + PM2 + Node + React) → MongoDB Atlas
```

---

## 0. Prerequisites

- GCP account with billing enabled
- GitHub account + this repo pushed to GitHub
- MongoDB Atlas account (free M0 cluster is enough for dev/qa)
- `gcloud` CLI installed locally (`gcloud init` done)
- A domain name (optional but recommended for HTTPS)

---

## 1. Push this project to GitHub

```bash
cd registration-management-system
git init
git add .
git commit -m "Initial commit: registration management system"
gh repo create registration-management-system --private --source=. --push
# or manually: git remote add origin <your-repo-url> && git push -u origin main
```

Create three long-lived branches matching the environments:

```bash
git checkout -b dev  && git push -u origin dev
git checkout -b qa   && git push -u origin qa
git checkout -b prod && git push -u origin prod
git checkout main
```

---

## 2. Set up MongoDB Atlas (one cluster, 3 databases)

1. Go to https://cloud.mongodb.com → Create a free M0 cluster.
2. Database Access → create a user (e.g. `reg_app_user`) with a strong password.
3. Network Access → Add IP Address → allow your 3 VM static IPs (added in step 3) — or `0.0.0.0/0` for quick testing (not recommended for prod).
4. Get your connection string, and create 3 logical databases by using different DB names in the URI:
   - `.../registration_dev`
   - `.../registration_qa`
   - `.../registration_prod`

You'll paste these into each VM's `.env` file in step 5.

---

## 3. Provision GCP infrastructure (repeat for dev, qa, prod)

The script `infra/gcp-provision.sh` creates an isolated GCP project, a Compute Engine VM,
a static IP, and firewall rules for each environment.

```bash
cd infra
chmod +x gcp-provision.sh vm-startup.sh

# Edit gcp-provision.sh first: set BILLING_ACCOUNT_ID (get it via `gcloud billing accounts list`)

./gcp-provision.sh dev
./gcp-provision.sh qa
./gcp-provision.sh prod
```

Each run prints a **static IP**. The `vm-startup.sh` script runs automatically on first boot
and installs Node.js 20, Nginx, PM2, Git, Certbot, and configures the firewall (ufw).

**Wait ~2 minutes** after creation for the startup script to finish, then verify:

```bash
gcloud compute ssh dev-vm --zone=asia-south1-a --command="node -v && nginx -v && pm2 -v"
```

---

## 4. Create a deploy SSH key (used by GitHub Actions)

```bash
ssh-keygen -t ed25519 -f ~/.ssh/gh-deploy-key -C "github-actions-deploy" -N ""
```

For **each** VM, add the public key so GitHub Actions can SSH in:

```bash
gcloud compute ssh dev-vm --zone=asia-south1-a --command \
  "echo '$(cat ~/.ssh/gh-deploy-key.pub)' >> ~/.ssh/authorized_keys"
# repeat for qa-vm, prod-vm
```

Keep `~/.ssh/gh-deploy-key` (the **private** key) — you'll paste its contents into GitHub Secrets next.

---

## 5. Set up the app directory + .env on each VM

SSH into each VM and clone the repo:

```bash
gcloud compute ssh dev-vm --zone=asia-south1-a
```

Then, on the VM:

```bash
sudo mkdir -p /var/www/registration-app
sudo chown -R $USER:$USER /var/www/registration-app
cd /var/www/registration-app
git clone -b dev https://github.com/<you>/registration-management-system.git .

# Create the real .env from the example
cp backend/.env.example backend/.env
nano backend/.env
# Fill in: NODE_ENV=production, PORT=5000, MONGODB_URI=<dev connection string>, CORS_ORIGIN=http://dev.yourdomain.com
```

Repeat for `qa-vm` (branch `qa`) and `prod-vm` (branch `prod`), each with its own `.env`.

---

## 6. Configure Nginx on each VM

Copy the matching config from `infra/nginx/` to the VM:

```bash
# on your local machine
gcloud compute scp infra/nginx/dev.conf dev-vm:~/dev.conf --zone=asia-south1-a
```

```bash
# on the VM
sudo mv ~/dev.conf /etc/nginx/sites-available/registration-dev
sudo ln -s /etc/nginx/sites-available/registration-dev /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Repeat for `qa.conf` → `qa-vm`, `prod.conf` → `prod-vm`.
Edit `server_name` in each file to match your real subdomain (e.g. `dev.yourdomain.com`).

**Optional — enable HTTPS:**
```bash
sudo certbot --nginx -d dev.yourdomain.com
```

---

## 7. First manual deploy (to confirm everything works before CI/CD)

On each VM:

```bash
cd /var/www/registration-app
chmod +x scripts/deploy.sh infra/pm2/*.js
./scripts/deploy.sh dev      # or qa / prod
```

Visit `http://<VM_STATIC_IP>` or `http://dev.yourdomain.com` — you should see the registration form.

---

## 8. Configure GitHub Secrets (for CI/CD)

In your GitHub repo → **Settings → Secrets and variables → Actions**, add, for each environment:

| Secret | Example |
|---|---|
| `DEV_VM_IP` | `34.12.34.56` |
| `DEV_VM_USER` | `your-linux-username` |
| `DEV_SSH_KEY` | contents of `~/.ssh/gh-deploy-key` (private key) |
| `DEV_MONGODB_URI` | `mongodb+srv://.../registration_dev` |

...and the same for `QA_*` and `PROD_*`.

---

## 9. GitHub Actions CI/CD (already included)

Workflows are in `.github/workflows/`:
- `deploy-dev.yml` → triggers on push to `dev` branch
- `deploy-qa.yml` → triggers on push to `qa` branch
- `deploy-prod.yml` → triggers on push to `prod` branch

Each pipeline: checkout → install deps → run tests → build frontend → SSH into the matching
VM → run `scripts/deploy.sh <env>` (git pull, npm install, pm2 restart, nginx reload).

**To deploy:** just push/merge into the target branch:

```bash
git checkout dev
git push origin dev   # triggers Deploy to DEV automatically
```

Promote through environments via PRs: `dev` → `qa` → `prod`.

---

## 10. Rollback

```bash
# on the affected VM
cd /var/www/registration-app
git log --oneline -5        # find the last good commit
git checkout <commit-hash>
pm2 restart ecosystem.<env>.config.js --update-env
sudo systemctl reload nginx
```

---

## Project structure

```
registration-management-system/
├── backend/                  # Express API (registration CRUD)
├── frontend/                 # React UI
├── infra/
│   ├── gcp-provision.sh      # Creates GCP project + VM + firewall + static IP
│   ├── vm-startup.sh         # Installs Node, Nginx, PM2, Certbot on first boot
│   ├── nginx/{dev,qa,prod}.conf
│   └── pm2/ecosystem.{dev,qa,prod}.config.js
├── scripts/deploy.sh         # Runs on the VM: pull, build, restart, reload
└── .github/workflows/        # deploy-dev.yml, deploy-qa.yml, deploy-prod.yml
```

---

## API Reference (backend)

| Method | Route | Description |
|---|---|---|
| POST | `/api/registrations` | Create a registration |
| GET | `/api/registrations` | List (supports `?status=&search=&page=&limit=`) |
| GET | `/api/registrations/:id` | Get one |
| PUT | `/api/registrations/:id` | Update (e.g. approve/reject) |
| DELETE | `/api/registrations/:id` | Delete |
| GET | `/api/health` | Health check |

---

## Local development (without any cloud infra)

```bash
# backend
cd backend
cp .env.example .env   # set MONGODB_URI to a local/dev Atlas cluster
npm install
npm run dev             # http://localhost:5000

# frontend (new terminal)
cd frontend
npm install
npm start                # http://localhost:3000
```

<!-- CI/CD test trigger -->
