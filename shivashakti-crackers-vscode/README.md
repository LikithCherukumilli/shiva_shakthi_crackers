# 🎆 Shivashakti Crackers (శివశక్తి క్రాకర్స్) — Customer Storefront & Private Owner Dashboard

A complete, dynamic Diwali Cracker Storefront and **Owner-Only Protected Dashboard** built for **Shivashakti Crackers (Chintal Basti, Khairatabad, Hyderabad)**.

## 🔒 How Public Customers vs. Store Owner Access Works

- **Public Customers (`index.html`):** Customers visiting the website **cannot see or access the Dashboard**. There are no "Admin Dashboard" buttons or "Edit Price" links anywhere on the customer pages.
- **Store Owner Private Access (2 Ways):**
  1. **Dedicated Owner File in VS Code (`admin.html`):** Open `admin.html` in your browser to go directly to the Owner Password Login screen.
  2. **Secret Owner Shortcut on `index.html`:** Triple-click (click 3 times quickly) on the round **VM Creations** logo in the top-left corner, or add `#admin` to the end of the URL (`index.html#admin`).
- **Default Owner Password:** `shiva2026` *(You can change this password inside the Dashboard under the **Store & Security Settings** tab!)*

## 📁 VS Code Folder Structure

```text
shivashakti-crackers-vscode/
├── index.html          # Public Customer Storefront (No Dashboard buttons visible to customers)
├── admin.html          # Direct Store Owner Login & Product Management Portal
├── css/
│   └── styles.css      # Custom festive Diwali theme & animations
├── js/
│   ├── products.js     # All 68 official Rate List crackers & store settings
│   └── app.js          # Storefront Cart, Owner Auth Gate, Admin CRUD & LocalStorage sync
├── assets/
│   ├── poster.jpeg     # Official Shivashakti Crackers Diwali Poster
│   └── ratelist.jpg    # Official 68-Item Rate List (Pages 1, 2 & 3)
└── README.md           # Setup & Owner login instructions
```

## 🚀 How to Run in VS Code

1. **Unzip** this project folder and open VS Code.
2. Go to **File → Open Folder...** and select the `shivashakti-crackers-vscode` folder.
3. Install the **Live Server** extension in VS Code (by Ritwick Dey).
4. Right-click `index.html` and select **"Open with Live Server"** for the public storefront, or open `admin.html` to manage products.
