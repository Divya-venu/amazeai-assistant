# AI Business Intelligence Platform - Deployment Guide

This guide provides step-by-step instructions for deploying the fullstack application to the cloud.

## 1. Database Setup: MongoDB Atlas
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (the free tier works great).
3. Create a Database User with a username and password.
4. Go to **Network Access** and add `0.0.0.0/0` (allow access from anywhere) or specifically add Render's IP if preferred.
5. Get your **Connection String** (choose "Connect your application").
   - It will look like: `mongodb+srv://<username>:<password>@cluster.mongodb.net/ai-business-platform`

## 2. Backend Deployment: Render
1. Create a [Render](https://render.com/) account.
2. Select **New > Web Service**.
3. Connect your GitHub repository.
4. Configure the service:
   - **Name**: `ai-business-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add **Environment Variables**:
   - `PORT`: `5000`
   - `MONGO_URI`: (Your MongoDB Atlas string)
   - `JWT_SECRET`: (A long random string)
   - `GROQ_API_KEY`: (Your Groq API key)
   - `CORS_ORIGIN`: `https://your-frontend-url.vercel.app` (Set this after deploying frontend)

## 3. Frontend Deployment: Vercel
1. Create a [Vercel](https://vercel.com/) account.
2. Select **Add New > Project**.
3. Connect the same GitHub repository.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
5. Add **Environment Variables**:
   - `VITE_API_URL`: `https://your-backend-url.onrender.com/api` (Copy this from your Render dashboard)

## 4. Final Steps
1. Once both are deployed, ensure the `CORS_ORIGIN` in Render matches your Vercel URL exactly.
2. Test the signup/login and dataset upload flows on the live site.
