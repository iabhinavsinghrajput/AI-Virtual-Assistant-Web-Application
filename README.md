# AI Virtual Assistant Web Application

A full-stack web application featuring an AI virtual assistant. The project is built with a modern tech stack utilizing React for the frontend and Node.js/Express for the backend. It integrates with Google's Gemini API for AI capabilities and Cloudinary for media management.

## Live Demo

*Add your live demo link here:* [Live Demo](https://ai-virtual-assistant-web-application-1.onrender.com/)

## Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router DOM
- **Icons:** React Icons
- **HTTP Client:** Axios

### Backend
- **Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **File Uploads:** Multer & Cloudinary
- **AI Integration:** Gemini API (via custom integration)

## Project Structure

```
virtualAssistant/
├── backend/       # Node.js Express server
└── frontend/      # React Vite application
```

## Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/) instance running
- [Cloudinary](https://cloudinary.com/) account
- Gemini API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory and add the following environment variables:
   ```env
   PORT=5000
   MONGODB_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   GEMINI_API_URL=your_gemini_api_url_with_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage
Once both servers are running, open your browser and navigate to the frontend URL (usually `http://localhost:5173`) to interact with the AI Virtual Assistant.
