# Project Management Dashboard

This is a modern, responsive frontend for a project management application, built with React, TypeScript, and Vite. It features a clean, intuitive user interface inspired by tools like Linear and Jira, with a focus on efficient task management and project visualization.

![Project Management Dashboard Screenshot](https://i.imgur.com/YOUR_SCREENSHOT_URL.png)
_(Replace with a screenshot of your application)_

## ✨ Features

- **Interactive Kanban Board:** Visualize workflows with a drag-and-drop Kanban board.
- **Task Management:** Create, update, and view tasks in a detailed modal.
- **Filtering and Search:** Quickly find tasks with dynamic filtering by search term and team members.
- **Modern UI/UX:** A clean and professional interface built with Material-UI.
- **Component-Based Architecture:** A well-structured and maintainable codebase using React components.
- **Client-Side Routing:** Seamless navigation between pages, powered by React Router.

## 🛠️ Tech Stack

- **Framework:** [React](https://reactjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **UI Library:** [Material-UI (MUI)](https://mui.com/)
- **Drag & Drop:** [@dnd-kit](https://dndkit.com/)
- **Routing:** [React Router](https://reactrouter.com/)
- **Charting:** [Recharts](https://recharts.org/)
- **Linting:** [ESLint](https://eslint.org/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [pnpm](https://pnpm.io/) or [npm](https://www.npmjs.com/) (package manager)

### Installation

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/MidLaneX/frontend-app.git
    cd frontend-app
    ```

2.  **Install dependencies:**

    Using pnpm (recommended):

    ```sh
    pnpm install
    ```

    Or using npm:

    ```sh
    npm install
    ```

3.  **Run the development server:**

    Using pnpm:

    ```sh
    pnpm dev
    ```

    Or using npm:

    ```sh
    npm run dev
    ```

    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## 📜 Available Scripts

In the project directory, you can run the following commands:

### Using pnpm (recommended):

- `pnpm dev`: Runs the app in development mode.
- `pnpm build`: Builds the app for production to the `dist` folder.
- `pnpm build:ci`: Runs full CI build with type-check, lint, and build.
- `pnpm lint`: Lints the codebase using ESLint.
- `pnpm lint:fix`: Fixes auto-fixable lint issues.
- `pnpm lint:ci`: Runs lint with zero warnings for CI.
- `pnpm type-check`: Runs TypeScript type checking.
- `pnpm validate`: Runs both type-check and lint for code validation.
- `pnpm preview`: Serves the production build locally for preview.
- `pnpm clean`: Cleans the build artifacts.

### Using npm:

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run build:ci`: Runs full CI build with type-check, lint, and build.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run lint:fix`: Fixes auto-fixable lint issues.
- `npm run lint:ci`: Runs lint with zero warnings for CI.
- `npm run type-check`: Runs TypeScript type checking.
- `npm run validate`: Runs both type-check and lint for code validation.
- `npm run preview`: Serves the production build locally for preview.
- `npm run clean`: Cleans the build artifacts.

## 🔄 CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment:

### Workflow Features:

- **🔍 Code Quality Checks**: TypeScript type checking, ESLint linting
- **🏗️ Build Verification**: Ensures the application builds successfully
- **📦 Artifact Management**: Stores build artifacts for deployment
- **🔒 Security Scanning**: Checks for vulnerabilities in dependencies
- **🚀 Automated Deployment**: Deploys to production on main branch pushes

### Workflow Triggers:

- **Push Events**: Triggers on `main` and `develop` branches
- **Pull Requests**: Runs quality checks and creates preview builds
- **Manual Dispatch**: Can be triggered manually from GitHub Actions tab

### Branch Strategy:

- `main`: Production-ready code, auto-deploys on push
- `develop`: Development branch for feature integration
- Feature branches: Use pull requests to merge into `develop`

### Quality Gates:

✅ TypeScript compilation must pass  
✅ ESLint must pass with zero warnings  
✅ Build must complete successfully  
✅ Security audit must pass  
✅ All checks required before merge

## 📁 Project Structure

The project follows a standard React application structure:

```
/
├── public/             # Static assets
├── src/
│   ├── assets/         # Images and other assets
│   ├── components/     # Reusable UI components
│   ├── data/           # Mock data for development
│   ├── pages/          # Top-level page components
│   ├── main.tsx        # Main application entry point
│   └── App.tsx         # Root application component
├── eslint.config.js    # ESLint configuration
├── package.json        # Project dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/MidLaneX/frontend-app/issues).

## 🔐 Authentication & Token Management

This application implements automatic token refresh functionality for seamless user authentication:

### Key Features:

- **Automatic Token Refresh**: Access tokens are automatically refreshed 5 minutes before expiration
- **Background Monitoring**: Continuous token status monitoring with periodic checks
- **Retry Logic**: Failed API requests are automatically retried after token refresh
- **Secure Storage**: Tokens stored securely in localStorage with proper cleanup
- **Device Tracking**: Includes device information in refresh requests for security

### Implementation:

- **TokenManager**: Singleton class handling token storage, validation, and refresh logic
- **API Interceptors**: Automatic token attachment and refresh on 401 responses
- **React Hook**: `useTokenRefresh` for monitoring and background token management
- **Seamless UX**: Users experience no interruptions from token expiration

The system automatically handles JWT access tokens and refresh tokens, ensuring users stay authenticated throughout their session without manual intervention.
