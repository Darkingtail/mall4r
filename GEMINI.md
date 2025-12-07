# Gemini Context & Guidelines for mall4r

## Project Overview

**mall4r** is a React/TypeScript rewrite of the Vue-based `mall4v` client.

- **Goal**: Replicate functionality of `mall4v` using React ecosystem patterns.
- **Reference**: `mall4j/front-end/mall4v` (Vue codebase) for business logic and functional parity. The reference repository is located at `D:\dev\darkingtail\mall4j`.
- **Backend**: Java backend in `mall4j`. API contracts must be strictly preserved.

## Tech Stack

- **Core**: React 18, TypeScript, Vite
- **State Management**: Zustand
- **UI Framework**: Ant Design (v5) + Tailwind CSS (v4)
- **Routing**: React Router Dom (v7)
- **HTTP**: Axios
- **Build/Lint**: ESLint, Prettier

## Project Structure

- `src/service/api`: API definitions (mirroring backend services).
- `src/components`: Reusable UI components.
- `src/pages`: Route components.
- `src/store`: Global state (Zustand).
- `src/utils`: Shared utilities.
- `src/theme`: Theme configurations (AntD tokens, global CSS).
- `src/router`: Routing configuration.

## Current Progress

- **Authentication**: Login flow completed.
- **Routing**: Base routing configuration completed.
- **Demo Feature**: A complete CURD example is implemented in `src/pages/nest/nest1/testUser` (view) and `src/service/api/nest/nest1/test-user` (api). use this as a reference for future feature implementations.

## Development Commands

- `pnpm dev`: Start dev server.
- `pnpm build`: Type check and build for production.
- `pnpm lint`: Run ESLint.
- `pnpm format`: Run Prettier.

## Convention Rules

- **Naming**: PascalCase for components, camelCase for functions/hooks.
- **Styling**: Tailwind utilities preferred; CSS modules/global CSS for complex overrides.
- **Commits**: Follow Conventional Commits.
