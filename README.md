# Git Gud Racing

A modern Next.js racing league management platform for iRacing enthusiasts, built with TypeScript, tRPC, and Drizzle ORM.

## Features

- **Racing League Management**: Organize and track racing leagues and series
- **Member Management**: User profiles with racing statistics and achievements
- **iRacing Integration**: Connect with iRacing accounts and track performance
- **Data Visualization**: Interactive charts and statistics using Recharts
- **Authentication**: Secure authentication with Better Auth
- **Responsive Design**: Modern UI built with Radix UI and Tailwind CSS
- **Type Safety**: Full TypeScript support with Zod validation

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: MySQL with Drizzle ORM
- **Authentication**: Better Auth
- **API Layer**: tRPC with React Query
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Type Safety**: TypeScript + Zod
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MySQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gitgud
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Configure your database connection and other required environment variables.

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:push` - Push database schema changes

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Shared UI components
├── modules/               # Feature modules
│   ├── admin/            # Admin management
│   ├── auth/             # Authentication
│   ├── dashboard/        # Dashboard components
│   ├── home/             # Home page features
│   ├── iracing/          # iRacing integration
│   ├── members/          # Member management
│   ├── profile/          # User profiles
│   └── schedule/         # Race scheduling
├── db/                   # Database schema and connection
├── lib/                  # Utility libraries
├── hooks/                # Custom React hooks
└── trpc/                 # tRPC configuration
```

## Key Features

### Racing Series Management
Track different racing series with logos, statistics, and participant data.

### Member Profiles
Comprehensive user profiles including:
- Racing statistics
- Achievement badges
- Performance metrics
- Team affiliations

### Data Visualization
Interactive charts showing:
- Performance trends
- Series comparisons
- Statistical breakdowns

### Admin Panel
Administrative interface for:
- Member management
- Series configuration
- Data oversight

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and commit: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is private and proprietary.

## Support

For support and questions, please open an issue on the repository.
