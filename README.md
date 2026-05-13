# Fabtops Headless E-Commerce

A high-performance, aesthetically stunning headless e-commerce store for **Fabtops**, built with Next.js 14, Shopify Storefront API, and Framer Motion.

## 🚀 Features

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS with a custom Pinkish Design System
- **Shopify Integration**: GraphQL-based Storefront API client
- **Animations**: Fluid page transitions and micro-interactions using Framer Motion
- **Cart System**: Client-side state management with Shopify checkout redirection
- **Performance**: Static generation with Incremental Static Regeneration (ISR)
- **Responsive**: Mobile-first, touch-friendly UI

## 🛠️ Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- Shopify Storefront API

## 📋 Prerequisites

- Node.js 18+
- Shopify Store with Storefront API enabled
- Shopify Storefront Access Token

## ⚙️ Setup

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   SHOPIFY_STORE_DOMAIN=fabtops.myshopify.com
   SHOPIFY_STOREFRONT_API_TOKEN=your_access_token_here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
4. **Run the development server**
   ```bash
   npm run dev
   ```

## 📦 Shopify Storefront API Scopes

Ensure your Storefront API token has the following scopes:
- `unauthenticated_read_product_listings`
- `unauthenticated_read_product_inventory`
- `unauthenticated_write_checkouts`
- `unauthenticated_read_checkouts`

## 🎨 Design System

The project uses a custom pink theme defined in `tailwind.config.ts`.
- **Primary**: Pink shades (#ff6b8a, #ff4d73, etc.)
- **Neutral**: Gray shades for typography and backgrounds
- **Typography**: Inter (Google Fonts)

## 🚀 Deployment

The project is ready to be deployed on **Vercel**:
1. Connect your GitHub repository to Vercel.
2. Add the environment variables from `.env.local`.
3. Deploy!

## 📄 License

MIT
