# Tatara Bakery Website

A modern bakery website built with Next.js, Supabase, and Tailwind CSS.

## Features

- 🛍️ Product catalog with categories
- 📦 Supabase integration for product management
- 📱 Responsive design with Tailwind CSS
- ⚡ Fast performance with Next.js 15
- 🔄 Real-time data updates
- 🚀 Ready for deployment on Vercel

## Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS, TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- Supabase account (https://supabase.com)
- Vercel account (https://vercel.com)
- GitHub account

## Setup Instructions

### 1. Setup Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. In your Supabase project, go to SQL Editor and create the following tables:

```sql
-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR,
  category UUID REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
  ('Bread', 'Fresh baked breads'),
  ('Pastries', 'Delicious pastries'),
  ('Cakes', 'Custom cakes'),
  ('Cookies', 'Sweet cookies');

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category) VALUES
  ('Sourdough Bread', 'Artisan sourdough', 50000, 'https://via.placeholder.com/300', 
    (SELECT id FROM categories WHERE name = 'Bread')),
  ('Croissant', 'Buttery French croissant', 25000, 'https://via.placeholder.com/300',
    (SELECT id FROM categories WHERE name = 'Pastries')),
  ('Chocolate Cake', 'Rich chocolate cake', 150000, 'https://via.placeholder.com/300',
    (SELECT id FROM categories WHERE name = 'Cakes'));
```

3. Get your Supabase URL and Anon Key:
   - Go to Settings → API
   - Copy `Project URL` and `anon public` key

### 2. Configure Environment Variables

Create `.env.local` in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Install Dependencies and Run

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Connecting to GitHub and Vercel

### 1. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/tatara-bakery.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com/new)
2. Import your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click Deploy

## Project Structure

```
tatara/
├── app/                 # Next.js app directory
│   ├── page.tsx        # Home page
│   ├── products/       # Products page
│   └── about/          # About page
├── components/         # React components
│   ├── Header.tsx      # Navigation header
│   └── ProductCard.tsx # Product display card
├── lib/
│   └── supabase.ts     # Supabase client setup
├── types/
│   └── product.ts      # TypeScript interfaces
└── public/             # Static assets
```

## Database Schema

### Categories Table
- `id` (UUID): Primary key
- `name` (VARCHAR): Category name
- `description` (TEXT): Category description
- `created_at` (TIMESTAMP): Creation timestamp

### Products Table
- `id` (UUID): Primary key
- `name` (VARCHAR): Product name
- `description` (TEXT): Product description
- `price` (DECIMAL): Product price
- `image_url` (VARCHAR): Product image URL
- `category` (UUID): Foreign key to categories
- `created_at` (TIMESTAMP): Creation timestamp

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Supabase Documentation](https://supabase.com/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
