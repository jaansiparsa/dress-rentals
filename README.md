# Dress Rentals Platform

A web platform where students can rent dresses from each other using their school email authentication.

## Features

- School email authentication
- Browse and filter dresses by type, size, and availability
- List dresses for rent
- Manage rental requests
- User profiles and reviews

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes
- Database: MongoDB
- Authentication: NextAuth.js

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app` - Next.js app directory containing pages and components
- `/components` - Reusable React components
- `/lib` - Utility functions and database models
- `/public` - Static assets
- `/styles` - Global styles and Tailwind configuration

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request
