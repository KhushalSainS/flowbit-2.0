# DocumentAI Platform

DocumentAI is an intelligent document processing platform that allows users to upload, analyze, and extract insights from their documents.

## Features

- **Document Upload & Management**: Securely upload and organize your documents
- **AI-Powered Analysis**: Extract insights and key information from documents
- **Project Organization**: Group related documents in projects for better organization
- **User Authentication**: Secure access with NextAuth integration
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: Local storage (configurable for cloud services)

## Project Structure

The project follows a modular architecture:

```
/src
  /app                  # Global pages and layouts
  /modules              # Feature-based modules
    /auth               # Authentication module
    /documents          # Document management module
    /projects           # Project management module
    /users              # User management module
  /common               # Shared resources
    /components         # Reusable components
    /lib                # Utility libraries
    /hooks              # Custom React hooks
    /utils              # Utility functions
  /styles               # Global styles
/public                 # Static assets
/prisma                 # Prisma schema and migrations
```

### Module Structure

Each module follows a consistent structure:

```
/module-name
  /api                  # API routes
  /components           # Module-specific components
  /hooks                # Module-specific hooks
  /services             # Business logic services
  /types                # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/documentai.git
cd documentai
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory:
```
DATABASE_URL="postgresql://user:password@localhost:5432/documentai"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
UPLOAD_MAX_SIZE="10485760" # 10MB in bytes
```

4. Run Prisma migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

### Prisma Migrations

This project uses Prisma ORM for database management. To set up the database:

1. Make sure your PostgreSQL instance is running
2. Update the `DATABASE_URL` in your `.env` file
3. Run the migrations:
```bash
npx prisma migrate dev --name init
```

### Seeding Data (Optional)

To seed the database with initial data:

```bash
npx prisma db seed
```

## Deployment

### Production Build

Create a production build:

```bash
npm run build
# or
yarn build
```

### Deployment Options

#### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set up the required environment variables
3. Deploy with the default settings

#### Traditional Hosting

1. Build the application
2. Set up environment variables
3. Run the production server:
```bash
npm start
# or
yarn start
```

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature-name`
3. Make changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
