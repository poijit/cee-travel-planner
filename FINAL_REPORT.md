# AI-Powered Travel Planner - Final Project Report

## 1. Executive Summary
The AI-Powered Travel Planner is a full-stack web application designed to help users instantly generate, visualize, and save custom travel itineraries. By inputting a destination, duration, budget, and personal interests, users receive a highly structured, day-by-day plan powered by state-of-the-art Large Language Models (LLMs). The application features an interactive map, budget visualization charts, real-time weather data, and secure cloud storage.

## 2. Technology Stack & Architecture
This project was built using modern web development standards and cloud infrastructure:

*   **Frontend & Backend Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (with global Dark Mode support)
*   **Authentication:** NextAuth.js (GitHub OAuth)
*   **Database:** MongoDB Atlas (Managed NoSQL)
*   **Deployment:** Vercel (CI/CD via GitHub)

### 2.1 Why Next.js?
Next.js was chosen because it allows for seamless Full-Stack development. We can write our React frontend components and our secure backend API routes (like `/api/generate-itinerary`) in the exact same repository.

## 3. Core Features & Integrations

### 3.1 Multi-AI Provider Generation
The core feature of the app is the itinerary generator. To ensure high availability and give users a choice, we implemented a **Strategy Pattern** that supports two different AI providers:
1.  **Google Gemini (1.5 Flash):** Fast, reliable, and excellent at adhering to structured JSON outputs.
2.  **Groq (Meta Llama 3.3 70B):** Utilizes specialized LPU hardware for lightning-fast inference.

The AI is prompted to return exclusively valid JSON matching a strict schema, which the Next.js backend parses and safely passes to the frontend.

### 3.2 Interactive Dashboard (Tier B Requirements)
Once the AI generates the itinerary, the data is passed to three specialized dashboard components:
*   **Interactive Map (`react-leaflet`):** Dynamically plots the destination using OpenStreetMap data. The component is dynamically imported to prevent Server-Side Rendering (SSR) crashes.
*   **Cost Visualization (`react-chartjs-2`):** Reads the estimated costs from the AI's JSON output and renders a beautiful bar chart breaking down daily expenses.
*   **Live Weather (`OpenWeatherMap API`):** Fetches real-time temperature, humidity, and conditions for the chosen destination.

### 3.3 Secure Authentication
To comply with security best practices, hardcoded passwords are strictly avoided. We integrated **NextAuth.js** using GitHub OAuth. When users click "Log in", they authenticate securely via GitHub. This ensures our app never handles or stores sensitive passwords, and allows us to uniquely identify users via their GitHub ID.

### 3.4 Cloud Database Persistence
Users can save their favorite generated trips to the cloud. We implemented **MongoDB Atlas**, a highly scalable NoSQL database. 
*   **Collection:** `trips`
*   **Structure:** Each document contains `UserId` (the user's GitHub ID), a unique `TripId`, and the itinerary JSON.
Our backend API routes (`/api/trips`) use the official `mongodb` driver to securely perform Create, Read, and Delete operations.

## 4. Deployment Strategy
The application is deployed on **Vercel**, which provides a seamless CI/CD pipeline integrated with GitHub.

1.  **Infrastructure:** Serverless functions handle the backend API routes.
2.  **Environment Variables:** All sensitive API keys and database connection strings are managed securely via the Vercel dashboard.
3.  **Automatic Deploys:** Every push to the `master` branch triggers an automatic production build and deployment.

## 5. Conclusion
This project successfully demonstrates the integration of modern UI design, third-party API orchestration (AI, Maps, Weather), secure authentication, and cloud infrastructure management. It serves as a robust foundation for a scalable, AI-driven SaaS application.
