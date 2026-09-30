# Nagpur Real Estate Property Analysis & Brokerage

A full-stack real estate platform designed for property discovery, client requirement matching, property comparison, and market analysis for Nagpur.

## Features

* Property browsing and detailed property views
* Requirement-based property matching
* Property filtering, ranking, and scoring
* Property comparison
* Locality and market analytics
* Interactive property and locality maps
* User authentication and saved properties
* Admin dashboard and property management
* Property image integration
* NLP-based property requirement processing

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS

**Backend:** FastAPI, Python

**Database:** PostgreSQL, Supabase

**APIs & Tools:** REST API, Pexels API, Git, GitHub

## Project Structure

```text
nagpur-realestate/
├── backend/
│   ├── app/
│   │   ├── matching/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── lib/
│       └── pages/
│
├── docs/
├── .gitignore
└── README.md
```

## How It Works

The platform allows users to explore properties and submit their requirements. The backend processes these requirements and analyzes available properties using factors such as location, budget, property type, area, and matching criteria.

The application also provides analytical tools for brokers and administrators to examine property and locality data.

## Running Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Configure the required environment variables in:

```text
.env
```

Start the FastAPI application using the project's configured start command.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Sensitive credentials are stored in local `.env` files and are not committed to the repository.

See `.env.example` for the required environment variable structure.

## Status

✅ Core application completed. Additional features and improvements are planned.
