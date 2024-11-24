# Vercel Blob Manager

A modern web application for managing files and folders in Vercel Blob Storage. Built with Next.js 14 and the latest Vercel Blob SDK.

## Features

- 📁 File and Directory Management
  - Create, delete, and navigate directories
  - Upload and manage files
  - Tree-style file explorer with intuitive UI
- ✏️ File Editing
  - Built-in text editor for file contents
  - Real-time content updates
  - Support for empty files and directories
- 🎯 Modern UI/UX
  - Clean and responsive design
  - Split-pane layout for efficient workspace management
  - Loading states and smooth transitions
- 🛠️ Technical Features
  - Built with Next.js 14 App Router
  - Server/Client implementation switching for testing
  - TypeScript for type safety
  - Shadcn UI components for consistent design

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm (recommended) or npm
- A Vercel account and Blob Storage access

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/iFwu/vercel-blob-manager.git
cd vercel-blob-manager
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file with your Vercel Blob credentials:
```
NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"
```

4. For testing with client-side implementation, create a `.env.test.local`:
```
NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"
NEXT_PUBLIC_IS_TEST="true"
```

### Development

Run the development server:
```bash
pnpm dev
# or for testing environment
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Architecture

The application uses a hybrid approach for Blob Storage operations:
- Server-side implementation (`actions.server.ts`) for production
- Client-side implementation (`actions.client.ts`) for testing
- Environment-based switching between implementations

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **UI Components**: Shadcn UI
- **Storage**: Vercel Blob
- **State Management**: React Hooks
- **Development**: pnpm, ESLint, Prettier

## License

MIT License - feel free to use this project for your own purposes.
