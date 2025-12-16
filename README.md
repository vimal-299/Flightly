# Flightly - Modern Flight Booking Platform

Flightly is a cutting-edge flight booking web application designed to provide a seamless and visually innovative experience for users. Built with the latest web technologies, it features dynamic pricing, 3D visualizations, and secure wallet integration.

![Flightly Home Screen](/plane.glb) <!-- Placeholder for a screenshot if available, otherwise just text description or remove -->

## 🚀 Features

-   **Flight Search**: Search for flights by departure city, arrival city, and date.
-   **Dynamic Pricing**: Intelligent surge pricing model based on demand.
-   **User Authentication**: Secure Sign-in/Sign-up via Email & Password and Google OAuth (powered by Better-Auth).
-   **Wallet System**: Built-in user wallet for seamless flight booking. Top-up securely.
-   **3D Experience**: Interactive 3D plane models providing a unique UI experience.
-   **Booking Management**: View booking history and detailed flight information.
-   **PDF Tickets**: Instantly generate and download PDF tickets for your bookings.
-   **Responsive Design**: Fully optimized for desktop and mobile devices.

## 🛠️ Tech Stack

-   **Frontend**: [Next.js 16 (App Router)](https://nextjs.org/), [React 19](https://react.dev/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) for animations.
-   **3D Graphics**: [Three.js](https://threejs.org/), [React Three Fiber](https://docs.pmnd.rs/react-three-fiber).
-   **Backend / Database**: [Drizzle ORM](https://orm.drizzle.team/), [PostgreSQL](https://www.postgresql.org/).
-   **Authentication**: [Better-Auth](https://www.better-auth.com/).
-   **Utilities**: `jspdf` for ticket generation, `lucide-react` for icons.

## ⚙️ Installation & Setup

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js (v18+ recommended)
-   PostgreSQL database (local or cloud like Neon/Supabase)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/flightly.git
cd flightly
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
BETTER_AUTH_SECRET=your_generated_secret
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Database Setup

Push the database schema:

```bash
npm run db:push
```

Seed the database with initial flight data :


### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Project Structure

-   `app/`: Next.js App Router pages and API routes.
-   `app/actions/`: Server actions for data mutations (auth, bookings, user stats).
-   `app/components/`: Reusable UI components (Navbar, 3D models, Cards).
-   `db/`: Database schema, connection setup, and seed scripts.
-   `lib/`: Utility libraries and authentication configuration.
-   `public/`: Static assets (images, 3D models).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

