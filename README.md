# Git Gud Racing

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11-blue?logo=trpc&logoColor=white)](https://trpc.io/)
[![License](https://img.shields.io/badge/license-Private-red)](LICENSE)

A modern, full-stack racing league management platform designed specifically for iRacing enthusiasts. Built with cutting-edge web technologies, Git Gud Racing provides comprehensive tools for organizing racing leagues, tracking member performance, and visualizing racing statistics with beautiful, interactive charts.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Demo](#-demo)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Scripts](#-scripts)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Development Workflow](#-development-workflow)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

## ✨ Features

### Core Functionality
- **🏁 Racing League Management**: Create, organize, and track multiple racing leagues and series
- **👥 Member Management**: Comprehensive user profiles with detailed racing statistics and achievements
- **🔗 iRacing Integration**: Seamless connection with iRacing accounts for real-time performance tracking
- **📊 Data Visualization**: Interactive charts and statistics powered by Recharts
- **🔐 Secure Authentication**: Modern authentication system using Better Auth with Google OAuth
- **📱 Responsive Design**: Mobile-first design with beautiful UI components from Radix UI
- **🛡️ Type Safety**: Full TypeScript support with Zod validation for robust data handling

### Advanced Features
- **📈 Performance Analytics**: Track racing improvements over time with detailed metrics
- **🏆 Achievement System**: Unlock badges and track milestones
- **📅 Race Scheduling**: Organize and manage race calendars
- **👨‍💼 Admin Panel**: Complete administrative interface for league management
- **🔄 Real-time Updates**: Live data synchronization with iRacing services
- **🎯 Series Filtering**: Advanced filtering and search capabilities

## 🛠️ Tech Stack

**Frontend:**
- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://typescriptlang.org/) - Static type checking
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://radix-ui.com/) - Unstyled, accessible UI primitives
- [Recharts](https://recharts.org/) - Composable charting library

**Backend:**
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe SQL ORM
- [Better Auth](https://better-auth.com/) - Authentication library
- [Zod](https://zod.dev/) - TypeScript-first schema validation

**Database & Deployment:**
- [MySQL](https://mysql.com/) - Relational database
- [Vercel](https://vercel.com/) - Deployment platform
- [React Query](https://tanstack.com/query) - Data fetching and caching

## 🚀 Demo

> 🚧 **Coming Soon**: Live demo will be available once deployed

### Screenshots
- Dashboard overview with racing statistics
- Member profiles with performance charts
- Series management interface
- Admin panel for league administration

## 🏃 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** 18+ and npm
- **MySQL** database (local or remote)
- **iRacing** account for API integration

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/gitgud.git
   cd gitgud
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following required variables in `.env.local`:
   
   | Variable | Description | Example |
   |----------|-------------|---------|
   | `NEXT_PUBLIC_APP_URL` | Your app's URL | `http://localhost:3000` |
   | `DATABASE_URL` | MySQL connection string | `mysql://user:pass@localhost:3306/gitgud` |
   | `BETTER_AUTH_SECRET` | Authentication secret key | Generate with `openssl rand -base64 32` |
   | `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Console |
   | `GOOGLE_CLIENT_SECRET` | Google OAuth secret | From Google Console |
   | `IRACING_EMAIL` | Your iRacing email | `your-email@example.com` |
   | `IRACING_PASSWORD` | Your iRacing password | Your account password |

4. **Set up the database:**
   ```bash
   # Push the schema to your database
   npm run db:push
   
   # Optional: Open database studio
   npm run db:studio
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

## 📚 API Documentation

### tRPC Procedures

The application uses tRPC for type-safe API communication. Key procedures include:

#### iRacing Module
- `iracing.getUser` - Fetch user profile and statistics
- `iracing.getUserSummary` - Get user racing summary
- `iracing.getUserRecentRaces` - Retrieve recent race results
- `iracing.getAllSeries` - Fetch available racing series
- `iracing.weeklySeriesResults` - Get weekly series standings

#### Members Module  
- `members.getMany` - List all members with filtering
- `members.getOne` - Get detailed member information

#### Profile Module
- `profile.getOne` - Get user profile
- `profile.edit` - Update user profile
- `profile.create` - Create new profile

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/*` | Various | Authentication routes |
| `/api/trpc/*` | POST | tRPC procedure calls |
| `/api/cronjobs/*` | POST | Scheduled data updates |

## 🗄️ Database Schema

### Core Tables

**Users & Authentication:**
- `user` - User accounts and basic information
- `session` - User session management
- `account` - OAuth account linking

**iRacing Data:**
- `iracingauth` - iRacing account authentication
- `seasons` - Racing season information
- `series` - Racing series details
- `seriesWeeklyStats` - Weekly series statistics
- `userSeasonData` - User performance per season

### Key Relationships
- Users can have multiple racing seasons
- Series contain weekly statistical data
- Users have detailed performance metrics per series

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbo |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint code analysis |
| `npm run db:generate` | Generate database migrations |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |
| `npm run db:push` | Push schema changes to database |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main application pages
│   └── api/               # API routes and endpoints
├── components/            # Shared UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   └── profile-card/     # Feature-specific components
├── modules/              # Feature modules (domain-driven structure)
│   ├── auth/             # Authentication logic
│   ├── dashboard/        # Dashboard components
│   ├── iracing/          # iRacing integration
│   ├── members/          # Member management
│   ├── profile/          # User profile features
│   └── manage/           # Admin management tools
├── db/                   # Database configuration
│   └── schemas/          # Database schema definitions
├── lib/                  # Utility libraries and configurations
├── hooks/                # Custom React hooks
└── trpc/                 # tRPC configuration and routers
```

### Module Architecture
Each feature module follows a consistent structure:
- `server/` - Server-side logic and tRPC procedures
- `ui/` - UI components and views
- `hooks/` - Module-specific React hooks
- `types.ts` - TypeScript type definitions
- `constants.ts` - Module constants

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Automatic deployments on push to main

### Environment Variables for Production
Ensure all variables from `.env.example` are configured in your deployment environment.

### Database Considerations
- Use a production MySQL database (PlanetScale, Railway, etc.)
- Run migrations: `npm run db:migrate`
- Consider connection pooling for high traffic

## 💻 Development Workflow

### Code Style
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting with Tailwind CSS plugin
- **TypeScript** - Strict type checking enabled

### Testing
```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Git Workflow
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes with descriptive commits
3. Run linting and type checking
4. Push and create Pull Request

## 🔧 Troubleshooting

### Common Issues

**Database Connection Issues:**
```bash
# Check your DATABASE_URL format
mysql://username:password@host:port/database

# Test database connection
npm run db:studio
```

**iRacing Authentication:**
- Ensure credentials are correct in `.env.local`
- Check iRacing account has API access enabled
- Verify email/password don't contain special characters

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Type Errors:**
```bash
# Regenerate database types
npm run db:generate

# Check TypeScript configuration
npx tsc --noEmit
```

### Performance Issues
- Check database query performance in Drizzle Studio
- Monitor API response times in browser dev tools
- Consider implementing caching for frequently accessed data

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the development workflow above
4. Ensure all tests pass and linting is clean

### Pull Request Process
1. Update documentation if needed
2. Add tests for new features
3. Ensure TypeScript types are correct
4. Write clear, descriptive commit messages
5. Submit pull request with detailed description

### Code Guidelines
- Follow existing code style and patterns
- Use TypeScript strict mode
- Write self-documenting code with clear variable names
- Add comments for complex business logic
- Ensure responsive design for UI components

### Issue Reporting
When reporting issues, please include:
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Relevant error messages or screenshots

## 📄 License

This project is private and proprietary. All rights reserved.

## 🆘 Support

For support, questions, or feature requests:

- **Issues**: [GitHub Issues](https://github.com/your-username/gitgud/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/gitgud/discussions)
- **Email**: your-email@example.com

### Getting Help

1. Check existing issues and documentation
2. Search discussions for similar questions
3. Create a new issue with detailed information
4. Tag appropriate labels for faster response

---

<div align="center">

**Built with ❤️ for the iRacing community**

[⬆ Back to Top](#git-gud-racing)

</div>