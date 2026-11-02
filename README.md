# 🚀 Complete Free Hosting & GitHub Pages Guide for Shivashakti Crackers

Your project is pre-configured with `.nojekyll`, `netlify.toml`, and `vercel.json` so you can deploy it for **100% free** in under 2 minutes.

---

## Method 1: Host on GitHub Pages directly from VS Code (Recommended)

1. **Open Project in VS Code:**
   - Unzip `shivashakti_crackers_vscode_project.zip` and open the `shivashakti-crackers-vscode` folder in VS Code (`File → Open Folder`).
2. **Publish to GitHub from VS Code:**
   - Click the **Source Control** icon on the left sidebar in VS Code (or press `Ctrl+Shift+G`).
   - Click **"Publish to GitHub"** (sign in to your GitHub account if prompted).
   - Select **"Publish to GitHub public repository"** and name it `shivashakti-crackers`.
3. **Turn on GitHub Pages:**
   - Open your repository on `https://github.com/<your-username>/shivashakti-crackers`.
   - Click **Settings** (top tab) → **Pages** (left sidebar).
   - Under **Build and deployment → Source**, choose **Deploy from a branch**.
   - Select branch **`main`** and folder **`/ (root)`**, then click **Save**.
   - Within 60 seconds, your website will be live at:
     `https://<your-username>.github.io/shivashakti-crackers/`

---

## Method 2: How to Edit Products & Update Your Live GitHub Website

Because public customers cannot see the Dashboard, you have **two ways** as the Store Owner to update product prices on your live website:

### Way A: Direct Browser-to-GitHub Live Sync (No VS Code Needed!)
1. Visit your live website and **triple-click the round `VM Creations` badge** in the top-left corner (or go to `/admin.html`).
2. Log in with your Owner Password (`shiva2026`).
3. Edit any product names, prices, or stock status in the **Manage Products** tab.
4. Switch to the **💻 VS Code Export & Setup Guide** tab inside the Dashboard.
5. In the **Direct Browser-to-GitHub Pages Live Publisher** box, enter:
   - **GitHub Repo:** `your-username/shivashakti-crackers`
   - **Branch:** `main`
   - **GitHub Personal Access Token:** Create one at `GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens` with **Contents: Read and write** permission for your repository.
6. Click **🚀 Publish Live to GitHub Repository** — your changes are committed directly to GitHub and go live for all customers in ~30–60 seconds!

### Way B: Update via VS Code
1. Edit your prices in the Dashboard, click **⬇️ Download products.js**, and replace `js/products.js` in your VS Code project folder.
2. In VS Code Source Control (`Ctrl+Shift+G`), type a commit message (e.g., `"Updated rates"`) and click **Commit & Sync (Push)**.

---

## Method 3: Instant 30-Second Hosting on Netlify Drop or Vercel

- **Netlify Drop:** Go to `https://app.netlify.com/drop` and drag-and-drop your unzipped `shivashakti-crackers-vscode` folder onto the page. It gives you an instant `https://...netlify.app` link!
- **Vercel:** Go to `https://vercel.com/new` and import your GitHub repository, or drag-and-drop the folder at `https://vercel.com/drop`.
- **Cloudflare Pages:** Go to `https://dash.cloudflare.com/` → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** (or **Upload assets**).
