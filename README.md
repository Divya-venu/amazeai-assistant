# AI Business Intelligence Assistant

A comprehensive real-world SaaS Dashboard using React, TailwindCSS, Chart.js, Node.js, Express, MongoDB, and OpenAI for financial intelligence.

## Features

- **Modern Interactive Dashboard**: TailwindCSS dark-mode interface with Chart.js analytics graphs.
- **Real-Time Data**: Instant UI updates across clients via Socket.io when new sales are recorded.
- **Automated Profit Calculation**: Mongoose pre-save hooks handle accurate profitability numbers.
- **AI Financial Insights**: Connects to Groq Cloud to parse shop revenue data and output actionable intelligence.
- **RAG Chat Assistant**: Uses Vector Embeddings to contextually answer queries based on live store data.
- **Predictive Sales Forecasting**: Linear Regression algorithm mapped to predict 30-day revenue and product demand.
- **WhatsApp Webhook Ready**: API endpoints set up logic for an AI-powered conversational agent directly on WhatsApp via Meta APIs.
- **JWT & Role Security**: Secure HTTP-only Cookie JWT sessions and endpoint authentication.

## Getting Started

### 1. Database Setup
Ensure you have MongoDB running locally or on Atlas. The default connection points to `mongodb://localhost:27017/ai_business_assistant`.

### 2. Backend Configuration
Navigate to `/backend`:
1. Rename `.env.example` to `.env` if missing.
2. Insert your `GROQ_API_KEY`. (Required for insights and chat).
3. Insert `WHATSAPP_TOKEN` if testing real webhooks.
4. Run:
```bash
cd backend
npm install
npm start
```
The backend initializes the web server on `http://localhost:5000` inside your terminal!
Optionally, repopulate mock sales via:
```bash
node seed_sales.js
```

### 3. Frontend Configuration
Navigate to `/frontend`:
```bash
cd frontend
npm install
npm run dev
```
Access the application locally at `http://localhost:5173`.

### 4. Running the Project
- After both frontend and backend are running, navigate to the Dashboard.
- Register an account or log in.
- View interactive charts, and press **Generate AI Insights** to execute the analytics.
- Start asking queries in the chatbot component, knowing it contextually understands your sales metrics!
