# BAZAR THOLE - Full Stack E-Commerce (Static Deploy Ready)

বাংলা নির্দেশাবলী নিচে দেওয়া হয়েছে (Bengali instructions are provided below).

This is a highly optimized, fully featured static e-commerce web application. All data, settings, configurations, and administration capabilities are fully managed in the browser using a high-performance **Local Storage Database Engine** (`localStorage`). 

This means you **do not need any database or Node.js server setup on your hosting provider**. You can host this entire app on any standard shared hosting (like cPanel, Hostinger, GoDaddy, Namecheap) or static site hosting platforms (like Netlify, Vercel, GitHub Pages) completely free or at ultra-low cost, and it will load instantly!

---

## 🚀 How to Run Locally

1. **Install Node.js**: Ensure you have [Node.js](https://nodejs.org) installed (v18 or higher recommended).
2. **Install Dependencies**: Open your terminal in the project directory and run:
   ```bash
   npm install
   ```
3. **Run Development Server**: Start the local server by running:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 📦 How to Build and Deploy to Hosting (cPanel / Shared Hosting)

Follow these simple steps to host the website on your own custom domain:

### Step 1: Compile the Project
In your project folder, run the build command:
```bash
npm run build
```
This will compile your TypeScript code and bundle all assets into a highly compressed folder called **`dist`** at the root of your project.

### Step 2: Prepare the Files
1. Open the **`dist`** folder.
2. Select all files and folders inside **`dist`** (such as `index.html`, `assets`, etc.).
3. Compress/Zip them into a single file (e.g., `bazar-thole.zip`).
   * *Note: Zip the **contents** of the `dist` folder, NOT the `dist` folder itself!*

### Step 3: Upload to Hosting
1. Log in to your hosting provider's Control Panel (e.g., **cPanel**).
2. Open the **File Manager** and navigate to your domain's root folder (usually **`public_html`**).
   * *If you want to host it on a subdomain or subdirectory (like `yourdomain.com/shop`), create that folder first and open it.*
3. Click **Upload** and select your `bazar-thole.zip` file.
4. Once uploaded, right-click the file and choose **Extract**.
5. Delete the `bazar-thole.zip` file from the server.
6. **Congratulations!** Your website is now live on your domain!

---

# বাংলা নির্দেশিকা (Bengali Guide)

এই ওয়েবসাইটটি সম্পূর্ণ অপ্টিমাইজড এবং একটি **স্ট্যাটিক ডিপ্লয়মেন্ট রেডি** অ্যাপ্লিকেশন। এর সমস্ত ডাটাবেজ, সেটিংস, প্রোডাক্ট ও অর্ডার ম্যানেজমেন্ট ব্রাউজারের `localStorage` এর মাধ্যমে পরিচালিত হয়।

এর ফলে আপনার হোস্টিং সার্ভারে কোনো জটিল SQL ডাটাবেজ বা Node.js সার্ভার কনফিগার করার প্রয়োজন নেই। আপনি যেকোনো সাধারণ শেয়ার্ড হোস্টিং (যেমন cPanel, Hostinger, GoDaddy, Namecheap) বা ফ্রি স্ট্যাটিক হোস্টিং-এ (যেমন Netlify, Vercel, GitHub Pages) এটি সরাসরি হোস্ট করে চালাতে পারবেন।

---

## 🚀 লোকাল কম্পিউটারে রান করার নিয়ম

১. **Node.js ইন্সটল করুন**: প্রথমে আপনার কম্পিউটারে [Node.js](https://nodejs.org) (v18 বা তার বেশি) ইন্সটল করুন।
২. **ডিপেন্ডেন্সি ইন্সটল করুন**: প্রজেক্ট ফোল্ডারে টার্মিনাল খুলে নিচের কমান্ডটি রান করুন:
   ```bash
   npm install
   ```
৩. **লোকাল সার্ভার চালু করুন**: নিচের কমান্ডটি দিয়ে ডেভেলপমেন্ট সার্ভার চালু করুন:
   ```bash
   npm run dev
   ```
   এবার ব্রাউজারে `http://localhost:3000` লিখে এন্টার দিলেই ওয়েবসাইটটি দেখতে পাবেন।

---

## 📦 নিজের ডোমেইনে হোস্টিং সার্ভারে আপলোড করার নিয়ম

খুব সহজেই আপনার নিজের হোস্টিং সার্ভারে সাইটটি লাইভ করার জন্য নিচের ৩টি ধাপ অনুসরণ করুন:

### ধাপ ১: প্রোজেক্টটি বিল্ড করুন
আপনার লোকাল প্রজেক্ট ফোল্ডারে টার্মিনাল খুলে নিচের বিল্ড কমান্ডটি লিখুন:
```bash
npm run build
```
এই কমান্ডটি রান করার সাথে সাথে প্রজেক্টের রুট ডিরেক্টরিতে **`dist`** নামে একটি নতুন ফোল্ডার তৈরি হবে যার মধ্যে ওয়েবসাইটের সম্পূর্ণ প্রোডাকশন কোড জমা হবে।

### ধাপ ২: ফাইলগুলো জিপ (Zip) করুন
১. **`dist`** ফোল্ডারটি ওপেন করুন।
২. ফোল্ডারের ভেতরের সমস্ত ফাইল এবং ফোল্ডার সিলেক্ট করুন (যেমন: `index.html`, `assets` ফোল্ডার ইত্যাদি)।
৩. সবগুলো একসাথে সিলেক্ট করে রাইট ক্লিক করে জিপ ফাইল তৈরি করুন (যেমন: `bazar-thole.zip`)।
   * *সতর্কতা: `dist` ফোল্ডারটি জিপ করবেন না, বরং `dist` ফোল্ডারের **ভেতরের কন্টেন্টগুলো** জিপ করবেন!*

### ধাপ ৩: হোস্টিং সার্ভারে আপলোড করুন
১. আপনার হোস্টিং প্রোভাইডারের কন্ট্রোল প্যানেলে (যেমন: **cPanel**) লগইন করুন।
২. **File Manager**-এ গিয়ে আপনার ডোমেইনের রুট ফোল্ডার (সাধারণত **`public_html`**) ওপেন করুন।
   * *আপনি যদি কোনো সাবফোল্ডারে সাইটটি রাখতে চান (যেমন: `domain.com/shop`), তাহলে সেই নামে একটি ফোল্ডার তৈরি করে সেটি ওপেন করুন।*
३. **Upload** বাটনে ক্লিক করে আপনার তৈরি করা `bazar-thole.zip` ফাইলটি আপলোড করুন।
৪. আপলোড শেষ হলে ফাইলটির উপর রাইট ক্লিক করে **Extract** সিলেক্ট করুন।
৫. এক্সট্রাক্ট করা হয়ে গেলে জিপ ফাইলটি সার্ভার থেকে ডিলিট করে দিন।
৬. **অভিনন্দন!** আপনার ডোমেইনে ওয়েবসাইটটি এখন সাকসেসফুলি লাইভ হয়ে গেছে!
