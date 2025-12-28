# AI Expense Tracker

A modern, AI-powered expense tracking application built with Next.js, TypeScript, Prisma, and PostgreSQL. Automatically categorize your transactions using OpenAI, visualize spending patterns with beautiful dashboards, and manage your finances effortlessly.

## ✨ Features

- 🤖 **AI-Powered Categorization** - Automatically categorize transactions with intelligent AI that learns from your spending patterns
- 📊 **Beautiful Dashboards** - Visualize your spending with interactive charts and insights
- 📥 **CSV Import** - Easily import transactions from bank statements or other expense tracking tools
- 🔍 **Smart Review Queue** - Review and approve low-confidence AI categorizations with reasoning
- 🔐 **Secure Authentication** - Email/password authentication with bcrypt hashing
- 💰 **Transaction Management** - Create, edit, delete, and organize transactions with an intuitive interface
- 📈 **Real-time Insights** - Get instant insights into your spending habits and trends
- 🎨 **Modern UI** - Beautiful, responsive design with smooth animations

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js (Auth.js v5)
- **AI:** OpenAI API
- **Styling:** Tailwind CSS
- **Charts:** Chart.js with React-Chartjs-2
- **State Management:** React Query (TanStack Query)
- **Animations:** Framer Motion

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key (for AI categorization)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AI-Expense-Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/expense_tracker"
   NEXTAUTH_SECRET="your-secret-key-here"
   OPENAI_API_KEY="your-openai-api-key-here"
   ```

4. **Set up the database**
   ```bash
   # Run migrations
   npm run prisma:migrate
   
   # Seed the database with demo data
   npm run prisma:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Default Credentials

After seeding, you can log in with:
- **Email:** `demo@local.dev`
- **Password:** `demo123`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed the database with demo data

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── api/                # API routes
│   ├── dashboard/          # Dashboard page
│   ├── transactions/       # Transaction pages
│   └── upload/             # CSV upload page
├── components/             # React components
│   ├── Charts/            # Chart components
│   └── ...                # Other reusable components
├── lib/                    # Utility functions and configurations
│   ├── ai/                 # OpenAI integration
│   ├── hooks/              # Custom React hooks
│   └── providers/          # Context providers
├── prisma/                 # Prisma schema and migrations
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seed script
└── public/                 # Static assets
```

## 🔒 Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI categorization | Yes |

## 🎯 Key Features Explained

### AI Categorization
The app uses OpenAI to automatically categorize transactions. When you have uncategorized transactions, click "AI Categorize" to let the AI analyze and categorize them based on description, merchant, and amount.

### Review Queue
Transactions with low AI confidence (< 0.6) or uncategorized transactions appear in the Review Queue. You can review AI suggestions, see reasoning, and manually approve or change categories.

### CSV Import
Upload CSV files with your bank transactions. The app will parse, validate, and import them in bulk. Supported formats include date, description, amount, and optional merchant/category columns.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Charts powered by [Chart.js](https://www.chartjs.org/)
- AI powered by [OpenAI](https://openai.com/)

---

Made with ❤️ using Next.js and AI

