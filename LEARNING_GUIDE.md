# 📚 Learning Guide: AI Travel Planner

Welcome to the learning guide! This document explains exactly what we have built so far, why we made certain choices, and how the code works. This is perfect for understanding your project and preparing for your final presentation or video demo.

---

## 1. What is Next.js? (Our Core Framework)
We are using **Next.js**. Think of Next.js as a powerful wrapper around React. 
Normally, a web app has a "Frontend" (the buttons and design) and a "Backend" (a separate server that talks to databases). 
Next.js is special because it is **Full-Stack**. It lets us write our Frontend UI and our Backend API logic in the exact same project folder.

**Key Files We Created:**
* `src/app/layout.tsx`: This is the master wrapper for your entire website. Every page is rendered inside this layout. This is where we load our global fonts and CSS.
* `src/app/globals.css`: This is where we define our global design system.

---

## 2. Tailwind CSS (Our Design System)
Instead of writing hundreds of lines of confusing CSS in separate files, we use **Tailwind CSS**. 
Tailwind lets us design elements by adding "utility classes" directly in our HTML/React code.
For example, instead of writing `background-color: blue; text-align: center;`, we just write `<div className="bg-blue-500 text-center">`.

**What I did:**
I updated `src/app/globals.css` to define our core colors (`--color-primary`, `--color-background-dark`, etc.). I also set up the rules for **Dark Mode** so the app can switch themes automatically based on user preference.

---

## 3. NextAuth.js (Our Login System - GitHub)
To fulfill the "User Login" requirement (which bans hardcoded credentials), we use a library called **NextAuth.js** (also known as Auth.js).
Building a secure login system from scratch with a database is extremely difficult and dangerous. NextAuth provides a pre-built, highly secure way to let users log in using their existing **GitHub** accounts. We chose GitHub because setting it up requires no verification or consent screens—it takes seconds!

**How it works in our code:**
1. **The Backend Route (`src/app/api/auth/[...nextauth]/route.ts`)**: This file is a Next.js API route. When a user clicks "Log in with GitHub", NextAuth uses the `GITHUB_ID` and `GITHUB_SECRET` from our `.env.local` file to securely talk to GitHub's servers. If GitHub says "Yes, this is a real user", NextAuth creates a secure "session" for them.
2. **The Frontend Provider (`src/components/providers/AuthProvider.tsx`)**: We wrap our entire application in a `<SessionProvider>`. This ensures that every page in our app knows if the user is currently logged in or not.

---

## 4. AWS DynamoDB (Our Database)
We need a place to save the itineraries that users create. We chose **AWS DynamoDB** because it is a "serverless" database. This means it doesn't run 24/7 draining your AWS Learner credits; you only "pay" when you actually save or read a trip.

**How it works in our code:**
* **The Connection File (`src/lib/aws.ts`)**: This file acts as the bridge between our Next.js app and AWS. It uses the official `@aws-sdk/client-dynamodb` library. It reads the three AWS keys (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_SESSION_TOKEN`) from your `.env.local` file to prove to AWS that we have permission to save data to your account.

---

## 5. The Environment File (`.env.local`)
You will notice this file contains all our "secrets" (API keys and passwords). 
**Why don't we just hardcode these passwords directly into `aws.ts` or `route.ts`?**
If we hardcoded them, and you uploaded this project to GitHub (which is a requirement for your class), anyone in the world could see your passwords, use your AWS credits, or use your Gemini AI quota.
By putting them in `.env.local`, Next.js knows to **never** upload this file to GitHub. It stays safely on your local computer.

---

## Summary of Our Current Architecture
1. The user visits our site (Frontend, React).
2. They click "Login". Our app talks to **NextAuth** (Backend API), which talks to **GitHub**.
3. Once logged in, the user types a prompt. We will send this to the **Gemini API**.
4. Gemini returns an itinerary. We show it on the screen.
5. The user clicks "Save Trip". Our backend uses the **AWS SDK** (`aws.ts`) to send the data to your **DynamoDB** table.
