# FinDash — Personal Finance Manager 🚀

FinDash is a premium, modern, and highly interactive Personal Finance Manager built with React and Tailwind CSS v4. It features a beautiful glassmorphism aesthetic, dynamic live charts, and a seamless user experience reminiscent of top-tier SaaS dashboards like Stripe and Revolut.

## ✨ Features

- **📊 Live Dashboard**: Real-time aggregation of your net worth, income, expenses, and savings rate.
- **📈 Dynamic Charts**: Interactive Area, Bar, and Pie charts powered by Recharts that react to your transaction data.
- **💳 Accounts Management**: Connect, edit, and track multiple bank accounts, credit cards, and cash wallets.
- **💸 Transaction Tracking**: Log income and expenses with detailed categories, statuses, and animated entry modals.
- **🎯 Budget Goals**: Set monthly budgets per category with visual SVG ring-charts that glow when you exceed limits.
- **🌗 Dark / Light Mode**: Seamless theme switching with a unified CSS variable system.
- **💱 Multi-Currency Support**: Instantly swap between USD, EUR, GBP, JPY, and more across the entire app.
- **🔍 Command Palette**: Press `Ctrl+K` (or `Cmd+K`) to search transactions and navigate instantly.
- **🔔 Smart Notifications**: Actionable alerts for budgets, security, and large transactions.
- **📱 Responsive & PWA Ready**: Optimized for desktop, tablet, and mobile with a custom bottom navigation bar. Can be installed as a Progressive Web App.
- **📄 CSV Export**: Download your transaction history with a single click.

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (using `@theme` directives)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **State Management**: React Context API (`FinanceContext`, `ThemeContext`, `ToastContext`)

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18+) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Rishi-ks666/PFM.git
   cd PFM
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

### Building for Production

To create an optimized production build:
```bash
npm run build
```
The output will be available in the `dist` directory.

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication wrappers
│   ├── layout/        # Navbar, Sidebar, BottomNav, MainLayout
│   └── ui/            # Reusable components (Charts, Modals, Cards, Toasts, Tables)
├── context/           # Global state providers (Finance, Theme, Toast)
├── hooks/             # Custom hooks (useFinanceStats)
├── pages/             # Main application views (Dashboard, Transactions, Accounts, etc.)
├── routes/            # React Router configuration
├── App.jsx            # Root component injecting providers
└── index.css          # Global styles, Tailwind directives, custom glassmorphism, and keyframes
```

## 🎨 Design Philosophy

FinDash prioritizes visual excellence. It utilizes:
- Deep, immersive gradients and noise overlays.
- `backdrop-blur` for authentic glassmorphism.
- Micro-animations and staggered fade-ins for a snappy feel.
- High-contrast elements and accessible color palettes.

## 📄 License

This project is open-source and available for personal or educational use.
