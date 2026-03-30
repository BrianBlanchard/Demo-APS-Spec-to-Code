# Frontend Project Structure Best Practices

## Overview

This document outlines recommended project structure for frontend applications.

## Directory Structure

```
src/
├── components/       # Reusable UI components
├── pages/            # Page-level components
├── hooks/            # Custom React hooks
├── services/         # API services and data fetching
├── utils/            # Utility functions
├── types/            # TypeScript type definitions
├── constants/        # Application constants
└── styles/           # Global styles and themes
```

## Component Organization

- Group related components together
- Use index files for clean imports
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks

## File Naming

- Use PascalCase for component files
- Use camelCase for utility and service files
- Use kebab-case for configuration files
