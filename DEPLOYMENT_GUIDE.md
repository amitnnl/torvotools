# Torvo Tools - Production Deployment Guide

This guide outlines the professional protocol for deploying the Torvo Tools e-commerce platform.

---

## 1. Prerequisites
Ensure your production server meets these minimum requirements:
- **Web Server:** Apache (with `mod_rewrite` enabled).
- **PHP:** Version 8.0 or higher.
- **PHP Extensions:** `pdo_mysql`, `openssl`, `mbstring`.
- **Database:** MySQL 5.7+ or MariaDB 10.3+.
- **SSL Certificate:** Required for Razorpay (HTTPS).

---

## 2. Git Version Control Setup (cPanel)

### A. Initialize Git Repository
To track deployments and enable proper HEAD commit highlighting in cPanel's Git Version Control:

1. **Access cPanel SSH Terminal** and navigate to your repository root:
```bash
cd ~/public_html
```

2. **Initialize Git** (if not already initialized):
```bash
git init
```

3. **Configure Git User** (required for commits):
```bash
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

4. **Add All Files**:
```bash
git add .
```

5. **Create Initial Commit**:
```bash
git commit -m "Initial production deployment"
```

### B. Ensure HEAD Commit Displays Properly

If the HEAD commit is not highlighting in cPanel's Git Version Control interface:

1. **Verify Git Status**:
```bash
git status
git log --oneline -5  # View recent commits
```

2. **If no commits exist**, create one as shown in Step A above.

3. **Fix Missing .git/HEAD reference** (if needed):
```bash
git rev-parse HEAD  # Should return a valid commit hash
```

4. **Refresh cPanel Interface**: Log out and back into cPanel, then navigate to **Files > Git Version Control** to see the updated HEAD commit highlighted.

### C. Automated Deployment with Git Hooks

Create a post-receive hook to auto-deploy on git push:

1. **Access Terminal** and navigate to the git repository:
```bash
cd ~/public_html/.git/hooks
```

2. **Create post-receive hook**:
```bash
cat > post-receive << 'EOF'
#!/bin/bash
git --work-tree=/home/your_username/public_html --git-dir=/home/your_username/public_html/.git checkout -f
echo "Deployment complete. New commit deployed."
EOF
chmod +x post-receive
```

3. **Test the hook** by making a commit from development machine and pushing to server.

---

## 3. Backend Deployment (API)

### A. Upload Files
Upload the entire `/backend` directory to your server (e.g., to `/public_html/backend`).

### B. Install Dependencies
Connect to your server via SSH, navigate to the `backend` folder, and run:
```bash
composer install --no-dev --optimize-autoloader
```

### C. Environment Configuration
Create or update the `.env` file in your production `backend/` folder:
```env
# Production Database
DB_HOST=your_production_host
DB_NAME=your_production_db_name
DB_USER=your_production_user
DB_PASS=your_production_password

# Security
JWT_SECRET=generate_a_long_random_string_here
```

### D. Directory Permissions
Ensure the server can write to the uploads folder:
```bash
chmod -R 775 backend/uploads
chmod 664 backend/error.log
```

---

## 4. Database Migration

1. Create a new database in your hosting control panel (cPanel/Plesk).
2. Use **phpMyAdmin** or a MySQL client to import the `backend/final_database.sql` file.
3. Verify the `site_settings` table contains your production website URL.

---

## 5. Frontend Deployment (React)

### A. Point to Production API
Open `frontend/.env.production` and set your live API URL:
```env
VITE_API_URL=https://your-domain.com/backend/api
```

### B. Generate Production Build
On your local machine, navigate to the `frontend/` folder and run:
```bash
npm install
npm run build
```
This will create a `frontend/dist` folder.

### C. Upload Build
Upload the **contents** of the `frontend/dist` folder to your server's web root (usually `/public_html/`).

### D. Verify .htaccess
Ensure the `.htaccess` file exists in your web root to handle React Router navigation:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 6. Post-Deployment Logic

### A. Configure Razorpay
1. Log in to your **Admin Panel** on the live site.
2. Navigate to **Settings > Business**.
3. Input your **Razorpay Live Key ID** and **Live Secret Key**.
4. Set your **Tax Percentage** and **Currency Symbol** (e.g., ₹).

### B. Test Transmission
1. **Search:** Verify the "Search Core" identifies products on the live server.
2. **Shortlist:** Add a product to your wishlist to test database persistence.
3. **Analytics:** Ensure the Admin Dashboard loads charts correctly.
4. **Payment:** Perform a test transaction using Razorpay's "Test Mode" on the live URL.

---

## Technical Support
For technical issues during deployment, refer to the `backend/error.log` file.
