# SkinSense -- Phase 0: Foundation

> **Duration:** Weeks 1--3
> **Goal:** Set up the infrastructure that every future phase depends on.
> **User-facing features:** None. This phase is pure engineering scaffolding.
> **Prerequisite reading:** `00-Master-Overview.md` (and nothing else).

---

## Table of Contents

1. [Monorepo Setup](#1-monorepo-setup)
2. [Expo App Scaffold](#2-expo-app-scaffold-appsmobile)
3. [NestJS Backend](#3-nestjs-backend-appsapi)
4. [Database Schema (Prisma)](#4-database-schema-prisma)
5. [Shared Types Package](#5-shared-types-package-packagestypes)
6. [Auth (Supabase)](#6-auth-supabase)
7. [S3 & Upload](#7-s3--upload)
8. [CI/CD Pipeline](#8-cicd-pipeline)
9. [Deployment](#9-deployment)
10. [Sentry Setup](#10-sentry-setup)
11. [Deliverable Checklist](#11-deliverable-checklist)

---

## 1. Monorepo Setup

### 1.1 Initialize the Repository

```bash
mkdir skinsense && cd skinsense
git init
corepack enable
corepack prepare pnpm@latest --activate
pnpm init
```

Set the `packageManager` field in the root `package.json`:

```jsonc
// package.json (root)
{
  "name": "skinsense",
  "private": true,
  "packageManager": "pnpm@9.15.4",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\""
  },
  "devDependencies": {
    "turbo": "^2.4.0",
    "prettier": "^3.4.0"
  }
}
```

### 1.2 pnpm Workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 1.3 Directory Structure

Create the full skeleton:

```
skinsense/
├── apps/
│   ├── mobile/              # Expo app (React Native + TypeScript)
│   └── api/                 # NestJS backend (TypeScript)
├── packages/
│   ├── types/               # @skinsense/types -- Zod schemas + inferred TS types
│   ├── ui/                  # @skinsense/ui -- shared RN components (placeholder)
│   └── config/              # @skinsense/config -- ESLint, TSConfig, Prettier
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI pipeline
├── .gitignore
├── .npmrc
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### 1.4 `.npmrc`

```ini
# .npmrc
auto-install-peers=true
strict-peer-dependencies=false
```

### 1.5 `turbo.json`

```jsonc
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 1.6 Shared TypeScript Config (`packages/config`)

```jsonc
// packages/config/package.json
{
  "name": "@skinsense/config",
  "version": "0.0.0",
  "private": true,
  "files": ["tsconfig.base.json", "tsconfig.node.json", "tsconfig.react-native.json", "eslint-preset.js", "prettier-preset.js"]
}
```

#### Base TSConfig

```jsonc
// packages/config/tsconfig.base.json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules", "dist"]
}
```

#### Node TSConfig (for `apps/api` and `packages/types`)

```jsonc
// packages/config/tsconfig.node.json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```

#### React Native TSConfig (for `apps/mobile`)

```jsonc
// packages/config/tsconfig.react-native.json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "lib": ["ES2022"],
    "types": ["nativewind/types"]
  }
}
```

### 1.7 Shared ESLint Config

```js
// packages/config/eslint-preset.js
const { resolve } = require("node:path");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports" },
    ],
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
  ignorePatterns: ["dist/", "node_modules/", ".turbo/"],
};
```

Install the shared ESLint dependencies as devDependencies at the `packages/config` level:

```bash
pnpm --filter @skinsense/config add -D \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-config-prettier
```

### 1.8 Shared Prettier Config

```js
// packages/config/prettier-preset.js
/** @type {import("prettier").Config} */
module.exports = {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  printWidth: 100,
  bracketSpacing: true,
  arrowParens: "always",
};
```

Root `.prettierrc.js`:

```js
// .prettierrc.js (root)
module.exports = require("@skinsense/config/prettier-preset");
```

### 1.9 `.gitignore`

```gitignore
# .gitignore
node_modules/
dist/
.turbo/
.env
.env.local
.env.*.local
*.tsbuildinfo

# Expo
.expo/
ios/
android/

# Prisma
apps/api/prisma/migrations/**/migration_lock.toml

# OS
.DS_Store
Thumbs.db
```

---

## 2. Expo App Scaffold (`apps/mobile`)

### 2.1 Create the App

```bash
cd apps/
npx create-expo-app mobile --template tabs
cd mobile
```

After scaffolding, update `apps/mobile/package.json`:

```jsonc
{
  "name": "@skinsense/mobile",
  "version": "0.0.1",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "dev": "expo start --dev-client",
    "build": "echo 'Mobile builds via EAS'",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "test": "jest"
  }
}
```

### 2.2 Install Core Dependencies

```bash
# Navigation & routing
pnpm --filter @skinsense/mobile add expo-router expo-linking expo-constants expo-status-bar

# Data fetching & state
pnpm --filter @skinsense/mobile add @tanstack/react-query @tanstack/query-async-storage-persister
pnpm --filter @skinsense/mobile add zustand
pnpm --filter @skinsense/mobile add react-native-mmkv

# Styling
pnpm --filter @skinsense/mobile add nativewind tailwindcss
pnpm --filter @skinsense/mobile add -D tailwindcss

# Auth token storage
pnpm --filter @skinsense/mobile add expo-secure-store

# Observability
pnpm --filter @skinsense/mobile add @sentry/react-native

# Workspace dependency
pnpm --filter @skinsense/mobile add @skinsense/types@workspace:*
```

### 2.3 NativeWind (Tailwind CSS) Configuration

```js
// apps/mobile/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // SkinSense brand palette -- placeholder values, refine in Phase 6
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#f8fafc",
        },
      },
    },
  },
  plugins: [],
};
```

```css
/* apps/mobile/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Add the Babel preset for NativeWind in `apps/mobile/babel.config.js`:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

Import the global stylesheet in `apps/mobile/app/_layout.tsx` (see section 2.4).

### 2.4 Expo Router File Structure

```
apps/mobile/app/
├── _layout.tsx                 # Root layout (providers, error boundary)
├── index.tsx                   # Redirect to (tabs) or (auth)
├── (auth)/
│   ├── _layout.tsx             # Auth stack layout
│   ├── login.tsx               # Login screen
│   └── register.tsx            # Registration screen
└── (tabs)/
    ├── _layout.tsx             # Tab bar layout
    ├── home.tsx                # Dashboard / home
    ├── scan.tsx                # Start a scan
    ├── routine.tsx             # View current routine
    ├── progress.tsx            # Progress & history
    └── settings.tsx            # User settings
```

#### Root Layout (`apps/mobile/app/_layout.tsx`)

This is the most important file -- it wraps the entire app with all providers.

```tsx
import "../global.css";
import { Slot, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import * as Sentry from "@sentry/react-native";
import { useAuthStore } from "../stores/auth";

// Initialize Sentry
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? "",
  tracesSampleRate: 1.0,
  environment: __DEV__ ? "development" : "production",
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60,   // 1 hour
      retry: 2,
    },
  },
});

function AuthGate() {
  const segments = useSegments();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, segments, router]);

  return <Slot />;
}

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
    </QueryClientProvider>
  );
}

export default Sentry.wrap(RootLayout);
```

#### Tab Layout (`apps/mobile/app/(tabs)/_layout.tsx`)

```tsx
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#16a34a",
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="scan" options={{ title: "Scan" }} />
      <Tabs.Screen name="routine" options={{ title: "Routine" }} />
      <Tabs.Screen name="progress" options={{ title: "Progress" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
```

#### Auth Layout (`apps/mobile/app/(auth)/_layout.tsx`)

```tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />;
  );
}
```

#### Placeholder Screen (repeat pattern for all screens)

```tsx
// apps/mobile/app/(tabs)/home.tsx
import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <Text className="text-lg font-semibold text-gray-800">Home</Text>
      <Text className="mt-2 text-sm text-gray-500">Phase 0 placeholder</Text>
    </View>
  );
}
```

Every tab screen and auth screen follows this same placeholder pattern. Replace "Home" with the screen name.

### 2.5 TanStack Query Persistence (MMKV)

```ts
// apps/mobile/lib/query-persister.ts
import { MMKV } from "react-native-mmkv";
import type { Persister } from "@tanstack/query-persist-client-core";

const storage = new MMKV({ id: "skinsense-query-cache" });

export const mmkvPersister: Persister = {
  persistClient: async (client) => {
    storage.set("query-client", JSON.stringify(client));
  },
  restoreClient: async () => {
    const data = storage.getString("query-client");
    return data ? JSON.parse(data) : undefined;
  },
  removeClient: async () => {
    storage.delete("query-client");
  },
};
```

Then in `_layout.tsx`, wrap the `QueryClientProvider` with persistence:

```tsx
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { mmkvPersister } from "../lib/query-persister";

// Replace <QueryClientProvider> with:
<PersistQueryClientProvider client={queryClient} persistOptions={{ persister: mmkvPersister }}>
  <AuthGate />
</PersistQueryClientProvider>
```

### 2.6 Zustand Auth Store

```ts
// apps/mobile/stores/auth.ts
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setTokens: (access: string, refresh: string) => Promise<void>;
  clearTokens: () => Promise<void>;
  loadTokens: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  setTokens: async (access, refresh) => {
    await SecureStore.setItemAsync("access_token", access);
    await SecureStore.setItemAsync("refresh_token", refresh);
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
  },

  clearTokens: async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    set({ accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  loadTokens: async () => {
    const access = await SecureStore.getItemAsync("access_token");
    const refresh = await SecureStore.getItemAsync("refresh_token");
    set({
      accessToken: access,
      refreshToken: refresh,
      isAuthenticated: !!access,
    });
  },
}));
```

### 2.7 EAS Configuration

```bash
npx eas-cli init
```

```jsonc
// apps/mobile/eas.json
{
  "cli": {
    "version": ">= 14.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "env": {
        "EXPO_PUBLIC_API_URL": "http://localhost:3000",
        "EXPO_PUBLIC_SENTRY_DSN": ""
      }
    },
    "preview": {
      "distribution": "internal",
      "autoIncrement": true,
      "channel": "preview",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api-preview.skinsense.app",
        "EXPO_PUBLIC_SENTRY_DSN": "YOUR_SENTRY_DSN"
      }
    },
    "production": {
      "autoIncrement": true,
      "channel": "production",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.skinsense.app",
        "EXPO_PUBLIC_SENTRY_DSN": "YOUR_SENTRY_DSN"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID",
        "ascAppId": "YOUR_ASC_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-services.json",
        "track": "internal"
      }
    }
  }
}
```

### 2.8 EAS Update

```bash
npx eas-cli update:configure
```

This adds the `expo-updates` config to `app.json`. Verify the following keys exist:

```jsonc
// In apps/mobile/app.json -> expo
{
  "updates": {
    "url": "https://u.expo.dev/YOUR_PROJECT_ID"
  },
  "runtimeVersion": {
    "policy": "appVersion"
  }
}
```

### 2.9 `apps/mobile/tsconfig.json`

```jsonc
{
  "extends": "@skinsense/config/tsconfig.react-native.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

---

## 3. NestJS Backend (`apps/api`)

### 3.1 Scaffold

```bash
cd apps/
npx @nestjs/cli new api --strict --skip-git --package-manager pnpm
```

Update `apps/api/package.json`:

```jsonc
{
  "name": "@skinsense/api",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,test}/**/*.ts\"",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "prisma generate",
    "prisma:migrate:dev": "prisma migrate dev",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "prisma:seed": "ts-node prisma/seed.ts"
  }
}
```

### 3.2 Install Dependencies

```bash
# Core
pnpm --filter @skinsense/api add @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs

# Prisma
pnpm --filter @skinsense/api add @prisma/client
pnpm --filter @skinsense/api add -D prisma

# Redis & queues
pnpm --filter @skinsense/api add ioredis @nestjs/bullmq bullmq

# Auth
pnpm --filter @skinsense/api add @supabase/supabase-js jsonwebtoken jwks-rsa
pnpm --filter @skinsense/api add -D @types/jsonwebtoken

# Validation
pnpm --filter @skinsense/api add zod nestjs-zod

# AWS S3
pnpm --filter @skinsense/api add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Observability
pnpm --filter @skinsense/api add @sentry/node @sentry/nestjs
pnpm --filter @skinsense/api add uuid
pnpm --filter @skinsense/api add -D @types/uuid

# Config
pnpm --filter @skinsense/api add @nestjs/config

# Health check
pnpm --filter @skinsense/api add @nestjs/terminus

# Workspace dependency
pnpm --filter @skinsense/api add @skinsense/types@workspace:*
```

### 3.3 Module Structure

```
apps/api/src/
├── main.ts
├── app.module.ts
├── common/
│   ├── filters/
│   │   └── global-exception.filter.ts
│   ├── middleware/
│   │   └── request-id.middleware.ts
│   ├── guards/
│   │   └── supabase-auth.guard.ts
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   └── logger/
│       └── structured-logger.service.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   └── auth.service.ts
├── scan/
│   ├── scan.module.ts
│   ├── scan.controller.ts
│   └── scan.service.ts
├── product/
│   ├── product.module.ts
│   ├── product.controller.ts
│   └── product.service.ts
├── routine/
│   ├── routine.module.ts
│   ├── routine.controller.ts
│   └── routine.service.ts
├── upload/
│   ├── upload.module.ts
│   ├── upload.controller.ts
│   └── upload.service.ts
├── queue/
│   ├── queue.module.ts
│   ├── queue.producer.ts
│   └── processors/
│       └── scan.processor.ts      # Mock processor for Phase 0
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── health/
    ├── health.module.ts
    └── health.controller.ts
```

### 3.4 Entry Point (`main.ts`)

```ts
// apps/api/src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as Sentry from "@sentry/nestjs";
import { StructuredLogger } from "./common/logger/structured-logger.service";

async function bootstrap() {
  // Initialize Sentry before anything else
  Sentry.init({
    dsn: process.env.SENTRY_DSN ?? "",
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: 1.0,
  });

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(new StructuredLogger());
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.warn(`API running on port ${port}`);
}

void bootstrap();
```

### 3.5 App Module (`app.module.ts`)

```ts
// apps/api/src/app.module.ts
import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { APP_FILTER } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ScanModule } from "./scan/scan.module";
import { ProductModule } from "./product/product.module";
import { RoutineModule } from "./routine/routine.module";
import { UploadModule } from "./upload/upload.module";
import { QueueModule } from "./queue/queue.module";
import { HealthModule } from "./health/health.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? "localhost",
        port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    PrismaModule,
    AuthModule,
    ScanModule,
    ProductModule,
    RoutineModule,
    UploadModule,
    QueueModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
```

### 3.6 Request ID Middleware

```ts
// apps/api/src/common/middleware/request-id.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = (req.headers["x-request-id"] as string) ?? uuidv4();
    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);
    next();
  }
}
```

### 3.7 Structured Logger

```ts
// apps/api/src/common/logger/structured-logger.service.ts
import { LoggerService, Injectable } from "@nestjs/common";

@Injectable()
export class StructuredLogger implements LoggerService {
  log(message: string, context?: string) {
    this.emit("info", message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.emit("error", message, context, { trace });
  }

  warn(message: string, context?: string) {
    this.emit("warn", message, context);
  }

  debug(message: string, context?: string) {
    this.emit("debug", message, context);
  }

  verbose(message: string, context?: string) {
    this.emit("verbose", message, context);
  }

  private emit(
    level: string,
    message: string,
    context?: string,
    extra?: Record<string, unknown>,
  ) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      context: context ?? "Application",
      message,
      ...extra,
    };
    process.stdout.write(JSON.stringify(entry) + "\n");
  }
}
```

### 3.8 Global Exception Filter

```ts
// apps/api/src/common/filters/global-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";
import * as Sentry from "@sentry/node";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : (exceptionResponse as Record<string, unknown>).message as string ?? message;
      details = typeof exceptionResponse === "object" ? exceptionResponse : undefined;
    } else {
      // Report unexpected errors to Sentry
      Sentry.captureException(exception);
    }

    const body = {
      statusCode: status,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.requestId,
    };

    // Log the error as structured JSON
    const logEntry = {
      timestamp: body.timestamp,
      level: "error",
      context: "ExceptionFilter",
      requestId: request.requestId,
      method: request.method,
      path: request.url,
      statusCode: status,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
    };
    process.stdout.write(JSON.stringify(logEntry) + "\n");

    response.status(status).json(body);
  }
}
```

### 3.9 Supabase Auth Guard

```ts
// apps/api/src/common/guards/supabase-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { createClient } from "@supabase/supabase-js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      supabaseId?: string;
    }
  }
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase = createClient(
    process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  );

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing or invalid authorization header");
    }

    const token = authHeader.slice(7);

    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    request.supabaseId = user.id;
    return true;
  }
}
```

### 3.10 Current User Decorator

```ts
// apps/api/src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

export const CurrentUser = createParamDecorator(
  (data: "supabaseId" | "userId" | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (data) {
      return request[data];
    }
    return { supabaseId: request.supabaseId, userId: request.userId };
  },
);
```

### 3.11 Prisma Module

```ts
// apps/api/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

```ts
// apps/api/src/prisma/prisma.module.ts
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### 3.12 Health Check

```ts
// apps/api/src/health/health.controller.ts
import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from "@nestjs/terminus";
import { PrismaService } from "../prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck("database", this.prisma),
    ]);
  }
}
```

```ts
// apps/api/src/health/health.module.ts
import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
```

### 3.13 Queue Module (BullMQ with Mock Processor)

```ts
// apps/api/src/queue/queue.module.ts
import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { QueueProducer } from "./queue.producer";
import { ScanProcessor } from "./processors/scan.processor";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "scan-processing",
    }),
  ],
  providers: [QueueProducer, ScanProcessor],
  exports: [QueueProducer],
})
export class QueueModule {}
```

```ts
// apps/api/src/queue/queue.producer.ts
import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import type { Queue } from "bullmq";
import type { ScanJobPayload } from "@skinsense/types";

@Injectable()
export class QueueProducer {
  constructor(@InjectQueue("scan-processing") private scanQueue: Queue) {}

  async enqueueScan(payload: ScanJobPayload): Promise<string> {
    const job = await this.scanQueue.add("process-scan", payload, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    });
    return job.id ?? "";
  }
}
```

```ts
// apps/api/src/queue/processors/scan.processor.ts
import { Processor, WorkerHost } from "@nestjs/bullmq";
import type { Job } from "bullmq";
import type { ScanJobPayload } from "@skinsense/types";
import { PrismaService } from "../../prisma/prisma.service";

@Processor("scan-processing")
export class ScanProcessor extends WorkerHost {
  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<ScanJobPayload>): Promise<void> {
    const { scanId } = job.data;

    // Update status to PROCESSING
    await this.prisma.scan.update({
      where: { id: scanId },
      data: { status: "PROCESSING" },
    });

    // --- MOCK INFERENCE ---
    // In Phase 0, this returns dummy data.
    // In Phase 3, this calls the FastAPI inference service.
    const mockResult = {
      skinHealthScore: 72,
      zoneScores: {
        forehead: { acne: 15, redness: 10, texture: 20 },
        leftCheek: { acne: 25, redness: 30, texture: 15 },
        rightCheek: { acne: 20, redness: 25, texture: 15 },
        nose: { acne: 10, redness: 15, texture: 10 },
        chin: { acne: 30, redness: 20, texture: 25 },
      },
      findings: [
        {
          zone: "leftCheek",
          concern: "ACNE",
          severity: "MODERATE",
          description: "Moderate inflammatory acne detected on the left cheek.",
        },
        {
          zone: "chin",
          concern: "ACNE",
          severity: "MILD",
          description: "Mild comedonal acne on the chin area.",
        },
      ],
      metadata: {
        barrierScore: null,
        skinAge: null,
      },
    };

    await this.prisma.scanResult.create({
      data: {
        scanId,
        skinHealthScore: mockResult.skinHealthScore,
        zoneScores: mockResult.zoneScores,
        findings: mockResult.findings,
        metadata: mockResult.metadata,
        modelVersion: "mock-v0.0.0",
        processingTimeMs: 1500,
      },
    });

    // Update scan status to COMPLETED
    await this.prisma.scan.update({
      where: { id: scanId },
      data: { status: "COMPLETED" },
    });
  }
}
```

### 3.14 Stub Controllers

Each module needs a controller with Zod-validated endpoints. Phase 0 implementations return placeholder responses or perform basic CRUD. The controller signatures establish the API contract.

**Scan Controller** (`apps/api/src/scan/scan.controller.ts`):

```ts
import { Controller, Post, Get, Param, Body, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../common/guards/supabase-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { ScanService } from "./scan.service";
import { CreateScanSchema } from "@skinsense/types";

@Controller("scans")
@UseGuards(SupabaseAuthGuard)
export class ScanController {
  constructor(private scanService: ScanService) {}

  @Post()
  create(
    @CurrentUser("supabaseId") supabaseId: string,
    @Body() body: unknown,
  ) {
    const parsed = CreateScanSchema.parse(body);
    return this.scanService.create(supabaseId, parsed);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.scanService.findOne(id);
  }

  @Get(":id/result")
  getResult(@Param("id") id: string) {
    return this.scanService.getResult(id);
  }
}
```

**Upload Controller** (`apps/api/src/upload/upload.controller.ts`):

```ts
import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../common/guards/supabase-auth.guard";
import { UploadService } from "./upload.service";

@Controller("upload")
@UseGuards(SupabaseAuthGuard)
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post("presign")
  presign(@Body() body: { contentType: string; fileExtension: string }) {
    return this.uploadService.generatePresignedUrl(
      body.contentType,
      body.fileExtension,
    );
  }
}
```

The Product, Routine, and Auth controllers follow the same pattern: guard-protected, Zod-validated, delegating to a service.

### 3.15 Environment Variables (`apps/api/.env.example`)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/skinsense?schema=public"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_JWT_SECRET="your-jwt-secret"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
S3_BUCKET_NAME="skinsense-uploads"

# Sentry
SENTRY_DSN=""

# App
NODE_ENV="development"
PORT="3000"
CORS_ORIGIN="*"
```

### 3.16 `apps/api/tsconfig.json`

```jsonc
{
  "extends": "@skinsense/config/tsconfig.node.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts"]
}
```

---

## 4. Database Schema (Prisma)

### 4.1 Initialize Prisma

```bash
cd apps/api
npx prisma init
```

### 4.2 Schema (`apps/api/prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ──────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────

enum SkinType {
  OILY
  DRY
  COMBINATION
  NORMAL
  SENSITIVE
}

enum ScanStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum ProductCategory {
  CLEANSER
  TONER
  SERUM
  MOISTURIZER
  SPF
  TREATMENT
  MASK
  EYE_CREAM
}

enum SkinConcern {
  ACNE
  REDNESS
  PIGMENTATION
  DRYNESS
  FINE_LINES
  OILINESS
  SENSITIVITY
  TEXTURE
}

enum PriceTier {
  BUDGET
  MID
  PREMIUM
}

// ──────────────────────────────────────────────
// Models
// ──────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  supabaseId    String    @unique
  email         String    @unique
  skinType      SkinType?
  fitzpatrick   Int?      // Fitzpatrick scale: 1-6
  birthYear     Int?
  allergies     String[]  // Ingredient names the user is allergic to
  isPregnant    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  scans         Scan[]
  routines      Routine[]

  @@index([supabaseId])
}

model Scan {
  id            String      @id @default(cuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  status        ScanStatus  @default(PENDING)
  imageKeys     String[]    // S3 object keys for uploaded images
  questionnaire Json        // Structured quiz responses (validated by Zod at app layer)
  createdAt     DateTime    @default(now())

  result        ScanResult?

  @@index([userId])
  @@index([status])
}

model ScanResult {
  id                String    @id @default(cuid())
  scanId            String    @unique
  scan              Scan      @relation(fields: [scanId], references: [id], onDelete: Cascade)
  version           Int       @default(1)
  skinHealthScore   Int       // 0-100 overall score
  zoneScores        Json      // { forehead: { acne: 45, redness: 20, ... }, ... }
  findings          Json      // Finding[] -- individual detected concerns
  metadata          Json      // Extensible: barrier score, skin age, etc. (added in later phases)
  modelVersion      String    // Identifies which model/version produced this result
  processingTimeMs  Int       // How long inference took in milliseconds
  createdAt         DateTime  @default(now())
}

model Product {
  id                String          @id @default(cuid())
  name              String
  brand             String
  category          ProductCategory
  skinTypes         SkinType[]
  concerns          SkinConcern[]
  ingredients       String[]        // Full INCI ingredient list
  activeIngredients Json            // { name: string, concentration?: string }[]
  priceTier         PriceTier
  imageUrl          String?
  purchaseUrl       String?
  isActive          Boolean         @default(true)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@index([category])
  @@index([brand])
}

model Routine {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  scanResultId  String
  version       Int       @default(1)
  amSteps       Json      // RoutineStep[] -- morning routine
  pmSteps       Json      // RoutineStep[] -- evening routine
  createdAt     DateTime  @default(now())

  @@index([userId])
}

model AdherenceLog {
  id          String    @id @default(cuid())
  userId      String
  routineId   String
  date        DateTime  @db.Date
  amCompleted Boolean   @default(false)
  pmCompleted Boolean   @default(false)
  createdAt   DateTime  @default(now())

  @@unique([userId, routineId, date])
  @@index([userId])
}
```

### 4.3 Initial Migration

```bash
cd apps/api
npx prisma migrate dev --name init
```

This generates the SQL migration file in `apps/api/prisma/migrations/` and applies it to the local database. Commit the migration files to git.

### 4.4 Seed Script (`apps/api/prisma/seed.ts`)

The seed script populates the database with test data for local development.

```ts
// apps/api/prisma/seed.ts
import { PrismaClient, SkinType, ProductCategory, SkinConcern, PriceTier } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed a test user
  const user = await prisma.user.upsert({
    where: { email: "test@skinsense.dev" },
    update: {},
    create: {
      supabaseId: "test-supabase-id-000",
      email: "test@skinsense.dev",
      skinType: SkinType.COMBINATION,
      fitzpatrick: 3,
      birthYear: 1995,
      allergies: ["fragrance", "alcohol"],
      isPregnant: false,
    },
  });

  // Seed sample products
  const products = [
    {
      name: "Gentle Foaming Cleanser",
      brand: "CeraVe",
      category: ProductCategory.CLEANSER,
      skinTypes: [SkinType.NORMAL, SkinType.COMBINATION, SkinType.OILY],
      concerns: [SkinConcern.ACNE, SkinConcern.OILINESS],
      ingredients: ["Water", "Glycerin", "Cocamidopropyl Hydroxysultaine", "Sodium Lauroyl Sarcosinate", "Niacinamide", "Ceramide NP", "Ceramide AP", "Ceramide EOP"],
      activeIngredients: [
        { name: "Niacinamide", concentration: "4%" },
        { name: "Ceramides" },
      ],
      priceTier: PriceTier.BUDGET,
      imageUrl: null,
      purchaseUrl: null,
    },
    {
      name: "Hyaluronic Acid 2% + B5",
      brand: "The Ordinary",
      category: ProductCategory.SERUM,
      skinTypes: [SkinType.DRY, SkinType.NORMAL, SkinType.COMBINATION],
      concerns: [SkinConcern.DRYNESS, SkinConcern.FINE_LINES],
      ingredients: ["Water", "Sodium Hyaluronate", "Pentylene Glycol", "Propanediol", "Sodium Hyaluronate Crosspolymer", "Panthenol"],
      activeIngredients: [
        { name: "Hyaluronic Acid", concentration: "2%" },
        { name: "Vitamin B5" },
      ],
      priceTier: PriceTier.BUDGET,
      imageUrl: null,
      purchaseUrl: null,
    },
    {
      name: "Ultra Facial Cream SPF 30",
      brand: "Kiehl's",
      category: ProductCategory.SPF,
      skinTypes: [SkinType.NORMAL, SkinType.DRY],
      concerns: [SkinConcern.DRYNESS],
      ingredients: ["Water", "Glycerin", "Ethylhexyl Methoxycinnamate", "Squalane", "Prunus Armeniaca Kernel Oil"],
      activeIngredients: [
        { name: "SPF 30" },
        { name: "Squalane" },
      ],
      priceTier: PriceTier.PREMIUM,
      imageUrl: null,
      purchaseUrl: null,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  // Seed a sample scan with result
  const scan = await prisma.scan.create({
    data: {
      userId: user.id,
      status: "COMPLETED",
      imageKeys: ["scans/test-user/scan-001/front.jpg"],
      questionnaire: {
        primaryConcern: "acne",
        skinFeeling: "oily_by_noon",
        currentProducts: ["cleanser", "moisturizer"],
        sunExposure: "moderate",
      },
    },
  });

  await prisma.scanResult.create({
    data: {
      scanId: scan.id,
      skinHealthScore: 72,
      zoneScores: {
        forehead: { acne: 15, redness: 10, texture: 20 },
        leftCheek: { acne: 25, redness: 30, texture: 15 },
        rightCheek: { acne: 20, redness: 25, texture: 15 },
        nose: { acne: 10, redness: 15, texture: 10 },
        chin: { acne: 30, redness: 20, texture: 25 },
      },
      findings: [
        {
          zone: "leftCheek",
          concern: "ACNE",
          severity: "MODERATE",
          description: "Moderate inflammatory acne detected on the left cheek.",
        },
      ],
      metadata: {},
      modelVersion: "mock-v0.0.0",
      processingTimeMs: 1500,
    },
  });

  console.warn("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `apps/api/package.json`:

```jsonc
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Run the seed:

```bash
npx prisma db seed
```

---

## 5. Shared Types Package (`packages/types`)

### 5.1 Package Setup

```jsonc
// packages/types/package.json
{
  "name": "@skinsense/types",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

```jsonc
// packages/types/tsconfig.json
{
  "extends": "@skinsense/config/tsconfig.node.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "composite": true
  },
  "include": ["src/**/*.ts"]
}
```

### 5.2 Enums (`packages/types/src/enums.ts`)

Mirror the Prisma enums so the mobile app can use them without importing Prisma:

```ts
// packages/types/src/enums.ts
export const SkinType = {
  OILY: "OILY",
  DRY: "DRY",
  COMBINATION: "COMBINATION",
  NORMAL: "NORMAL",
  SENSITIVE: "SENSITIVE",
} as const;
export type SkinType = (typeof SkinType)[keyof typeof SkinType];

export const ScanStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;
export type ScanStatus = (typeof ScanStatus)[keyof typeof ScanStatus];

export const ProductCategory = {
  CLEANSER: "CLEANSER",
  TONER: "TONER",
  SERUM: "SERUM",
  MOISTURIZER: "MOISTURIZER",
  SPF: "SPF",
  TREATMENT: "TREATMENT",
  MASK: "MASK",
  EYE_CREAM: "EYE_CREAM",
} as const;
export type ProductCategory = (typeof ProductCategory)[keyof typeof ProductCategory];

export const SkinConcern = {
  ACNE: "ACNE",
  REDNESS: "REDNESS",
  PIGMENTATION: "PIGMENTATION",
  DRYNESS: "DRYNESS",
  FINE_LINES: "FINE_LINES",
  OILINESS: "OILINESS",
  SENSITIVITY: "SENSITIVITY",
  TEXTURE: "TEXTURE",
} as const;
export type SkinConcern = (typeof SkinConcern)[keyof typeof SkinConcern];

export const PriceTier = {
  BUDGET: "BUDGET",
  MID: "MID",
  PREMIUM: "PREMIUM",
} as const;
export type PriceTier = (typeof PriceTier)[keyof typeof PriceTier];

export const Severity = {
  MILD: "MILD",
  MODERATE: "MODERATE",
  SEVERE: "SEVERE",
} as const;
export type Severity = (typeof Severity)[keyof typeof Severity];
```

### 5.3 Zod Schemas and Inferred Types (`packages/types/src/schemas.ts`)

```ts
// packages/types/src/schemas.ts
import { z } from "zod";

// ──────────────────────────────────────────────
// Finding — a single detected concern in a zone
// ──────────────────────────────────────────────

export const FindingSchema = z.object({
  zone: z.string(),                        // e.g. "forehead", "leftCheek"
  concern: z.string(),                     // e.g. "ACNE", "REDNESS"
  severity: z.enum(["MILD", "MODERATE", "SEVERE"]),
  description: z.string(),
});

export type Finding = z.infer<typeof FindingSchema>;

// ──────────────────────────────────────────────
// ZoneScore — per-zone breakdown of concern scores
// ──────────────────────────────────────────────

export const ZoneScoreSchema = z.record(
  z.string(),                              // zone name
  z.record(z.string(), z.number()),        // { concern: score }
);

export type ZoneScore = z.infer<typeof ZoneScoreSchema>;

// ──────────────────────────────────────────────
// ScanResult — the full analysis result
// ──────────────────────────────────────────────

export const ScanResultSchema = z.object({
  id: z.string(),
  scanId: z.string(),
  version: z.number().int().positive(),
  skinHealthScore: z.number().int().min(0).max(100),
  zoneScores: ZoneScoreSchema,
  findings: z.array(FindingSchema),
  metadata: z.record(z.string(), z.unknown()),
  modelVersion: z.string(),
  processingTimeMs: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});

export type ScanResult = z.infer<typeof ScanResultSchema>;

// ──────────────────────────────────────────────
// ScanJobPayload — what gets enqueued to BullMQ
// ──────────────────────────────────────────────

export const ScanJobPayloadSchema = z.object({
  scanId: z.string(),
  userId: z.string(),
  imageKeys: z.array(z.string()).min(1).max(5),
  questionnaire: z.record(z.string(), z.unknown()),
});

export type ScanJobPayload = z.infer<typeof ScanJobPayloadSchema>;

// ──────────────────────────────────────────────
// CreateScan — request body for POST /scans
// ──────────────────────────────────────────────

export const CreateScanSchema = z.object({
  imageKeys: z.array(z.string()).min(1).max(5),
  questionnaire: z.record(z.string(), z.unknown()),
});

export type CreateScan = z.infer<typeof CreateScanSchema>;

// ──────────────────────────────────────────────
// RoutineStep — one step in a skincare routine
// ──────────────────────────────────────────────

export const RoutineStepSchema = z.object({
  order: z.number().int().positive(),
  productId: z.string(),
  productName: z.string(),
  category: z.string(),
  instructions: z.string(),
  durationSeconds: z.number().int().nonnegative().optional(),
  isOptional: z.boolean().default(false),
});

export type RoutineStep = z.infer<typeof RoutineStepSchema>;

// ──────────────────────────────────────────────
// ProductCard — product data for display on mobile
// ──────────────────────────────────────────────

export const ProductCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  category: z.string(),
  skinTypes: z.array(z.string()),
  concerns: z.array(z.string()),
  priceTier: z.enum(["BUDGET", "MID", "PREMIUM"]),
  imageUrl: z.string().url().nullable(),
  purchaseUrl: z.string().url().nullable(),
});

export type ProductCard = z.infer<typeof ProductCardSchema>;

// ──────────────────────────────────────────────
// UserProfile — user's skin profile for display
// ──────────────────────────────────────────────

export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  skinType: z.enum(["OILY", "DRY", "COMBINATION", "NORMAL", "SENSITIVE"]).nullable(),
  fitzpatrick: z.number().int().min(1).max(6).nullable(),
  birthYear: z.number().int().min(1920).max(2015).nullable(),
  allergies: z.array(z.string()),
  isPregnant: z.boolean(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// ──────────────────────────────────────────────
// PresignedUploadResponse — response from POST /upload/presign
// ──────────────────────────────────────────────

export const PresignedUploadResponseSchema = z.object({
  url: z.string().url(),
  key: z.string(),
  expiresAt: z.string().datetime(),
});

export type PresignedUploadResponse = z.infer<typeof PresignedUploadResponseSchema>;

// ──────────────────────────────────────────────
// API error envelope
// ──────────────────────────────────────────────

export const ApiErrorSchema = z.object({
  statusCode: z.number().int(),
  message: z.string(),
  details: z.unknown().optional(),
  timestamp: z.string().datetime(),
  path: z.string(),
  requestId: z.string().uuid(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
```

### 5.4 Barrel Export (`packages/types/src/index.ts`)

```ts
// packages/types/src/index.ts
export * from "./enums";
export * from "./schemas";
```

---

## 6. Auth (Supabase)

### 6.1 Supabase Project Setup

1. Create a new Supabase project at https://supabase.com/dashboard.
2. Note the **Project URL** and **Service Role Key** (for the API server).
3. Note the **Anon Key** (for the mobile client).
4. Enable the following auth providers in the Supabase dashboard under Authentication > Providers:
   - **Email/Password** -- enabled by default.
   - **Google** -- requires a Google Cloud OAuth 2.0 client ID and secret.
   - **Apple** -- requires an Apple Services ID and key (needed for iOS App Store).

### 6.2 Supabase Client on Mobile

```ts
// apps/mobile/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  {
    auth: {
      storage: Platform.OS !== "web" ? ExpoSecureStoreAdapter : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
```

### 6.3 JWT Validation on the Backend

The `SupabaseAuthGuard` (section 3.9) validates tokens by calling `supabase.auth.getUser(token)` using the service role key. This is the simplest approach for Phase 0.

**Token flow:**

1. Mobile calls `supabase.auth.signInWithPassword(...)` or `supabase.auth.signInWithOAuth(...)`.
2. Supabase returns `{ access_token, refresh_token }`.
3. Mobile stores both in SecureStore via the Zustand auth store (section 2.6).
4. Every API request includes `Authorization: Bearer <access_token>`.
5. NestJS guard calls Supabase to verify the token and extract the user ID.

### 6.4 Refresh Token Rotation

Supabase handles refresh token rotation automatically when `autoRefreshToken: true` is set in the client config. The Supabase JS client will:

- Automatically refresh the access token before it expires.
- Rotate the refresh token on each refresh (one-time use).
- Emit `TOKEN_REFRESHED` events that the app can listen to for updating the Zustand store.

```ts
// apps/mobile/lib/auth-listener.ts
import { supabase } from "./supabase";
import { useAuthStore } from "../stores/auth";

export function setupAuthListener() {
  supabase.auth.onAuthStateChange(async (event, session) => {
    const store = useAuthStore.getState();

    if (session) {
      await store.setTokens(session.access_token, session.refresh_token);
    } else {
      await store.clearTokens();
    }
  });
}
```

Call `setupAuthListener()` once in the root layout's `useEffect`.

---

## 7. S3 & Upload

### 7.1 S3 Bucket Configuration

Create an S3 bucket (or Cloudflare R2 bucket) with the following settings:

| Setting | Value |
|---------|-------|
| Bucket name | `skinsense-uploads` |
| Region | `us-east-1` (or closest to your users) |
| Block public access | **All blocked** |
| Server-side encryption | AES-256 (SSE-S3) |
| Versioning | Disabled (not needed for Phase 0) |
| Lifecycle rules | Delete objects older than 90 days (review in Phase 4) |

### 7.2 CORS Configuration

Apply this CORS policy to the bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

In production, replace `"*"` in `AllowedOrigins` with the actual mobile app origin. Since React Native does not send an `Origin` header by default, `"*"` is acceptable for mobile-only uploads.

### 7.3 IAM Policy

Create an IAM user (or role) with the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::skinsense-uploads/*"
    }
  ]
}
```

### 7.4 Presigned URL Service

```ts
// apps/api/src/upload/upload.service.ts
import { Injectable, BadRequestException } from "@nestjs/common";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/heic", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const PRESIGN_EXPIRES_IN = 900;         // 15 minutes in seconds

@Injectable()
export class UploadService {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION ?? "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
      },
    });
  }

  async generatePresignedUrl(contentType: string, fileExtension: string) {
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      throw new BadRequestException(
        `Invalid content type. Allowed: ${ALLOWED_CONTENT_TYPES.join(", ")}`,
      );
    }

    const ext = fileExtension.startsWith(".") ? fileExtension : `.${fileExtension}`;
    const key = `scans/${uuidv4()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME ?? "skinsense-uploads",
      Key: key,
      ContentType: contentType,
      ContentLength: MAX_FILE_SIZE, // Enforced maximum
      ServerSideEncryption: "AES256",
    });

    const url = await getSignedUrl(this.s3, command, {
      expiresIn: PRESIGN_EXPIRES_IN,
    });

    const expiresAt = new Date(Date.now() + PRESIGN_EXPIRES_IN * 1000).toISOString();

    return { url, key, expiresAt };
  }
}
```

### 7.5 Mobile Upload Helper

```ts
// apps/mobile/lib/upload.ts
import type { PresignedUploadResponse } from "@skinsense/types";

export async function uploadImageToS3(
  presigned: PresignedUploadResponse,
  fileUri: string,
  contentType: string,
): Promise<void> {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const uploadResponse = await fetch(presigned.url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed with status ${uploadResponse.status}`);
  }
}
```

---

## 8. CI/CD Pipeline

### 8.1 GitHub Actions Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}

jobs:
  # ──────────────────────────────────────────────
  # Lint, typecheck, and test all workspaces
  # ──────────────────────────────────────────────
  check:
    name: Lint / Typecheck / Test
    runs-on: ubuntu-latest
    timeout-minutes: 15

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: skinsense_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma client
        run: pnpm --filter @skinsense/api prisma:generate

      - name: Run database migrations
        run: pnpm --filter @skinsense/api prisma:migrate:deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/skinsense_test

      - name: Build packages
        run: pnpm turbo run build --filter=@skinsense/types --filter=@skinsense/config

      - name: Lint
        run: pnpm turbo run lint

      - name: Typecheck
        run: pnpm turbo run typecheck

      - name: Test
        run: pnpm turbo run test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/skinsense_test
          REDIS_HOST: localhost
          REDIS_PORT: 6379

  # ──────────────────────────────────────────────
  # Deploy API on merge to main
  # ──────────────────────────────────────────────
  deploy-api:
    name: Deploy API
    runs-on: ubuntu-latest
    needs: check
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    timeout-minutes: 10

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm turbo run build

      - name: Run production migrations
        run: pnpm --filter @skinsense/api prisma:migrate:deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      # Deploy step depends on hosting provider.
      # For Railway:
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: skinsense-api

      # For Fly.io (alternative):
      # - name: Deploy to Fly.io
      #   uses: superfly/flyctl-actions/setup-flyctl@master
      # - run: flyctl deploy --remote-only
      #   env:
      #     FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

  # ──────────────────────────────────────────────
  # Trigger EAS Build on merge to main
  # ──────────────────────────────────────────────
  eas-build:
    name: EAS Build (Preview)
    runs-on: ubuntu-latest
    needs: check
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    timeout-minutes: 5

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Trigger EAS Build
        working-directory: apps/mobile
        run: eas build --platform all --profile preview --non-interactive

  # ──────────────────────────────────────────────
  # EAS Update on merge to main (OTA update)
  # ──────────────────────────────────────────────
  eas-update:
    name: EAS Update (Preview)
    runs-on: ubuntu-latest
    needs: check
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    timeout-minutes: 10

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Publish update
        working-directory: apps/mobile
        run: eas update --channel preview --message "${{ github.event.head_commit.message }}"
```

### 8.2 Required GitHub Secrets

| Secret | Source |
|--------|--------|
| `TURBO_TOKEN` | Vercel dashboard (Turborepo Remote Cache) |
| `DATABASE_URL` | Production PostgreSQL connection string |
| `RAILWAY_TOKEN` | Railway dashboard (or `FLY_API_TOKEN` for Fly.io) |
| `EXPO_TOKEN` | `expo.dev` > Access Tokens |
| `SENTRY_AUTH_TOKEN` | Sentry dashboard > Auth Tokens |

### 8.3 Required GitHub Variables

| Variable | Value |
|----------|-------|
| `TURBO_TEAM` | Your Vercel team slug |

---

## 9. Deployment

### 9.1 Infrastructure Choices (Phase 0)

| Component | Service | Why |
|-----------|---------|-----|
| **API hosting** | Railway (or Fly.io) | Cheapest path to a running NestJS server. Railway auto-deploys from GitHub. Fly.io if you need multi-region later. |
| **PostgreSQL** | Supabase managed (included with Supabase project) or Neon | Free tier is sufficient for Phase 0--1. Supabase bundles auth + db in one project. |
| **Redis** | Upstash | Serverless Redis. Free tier: 10k commands/day. Sufficient for Phase 0--1 BullMQ and caching. |
| **S3 / Object Storage** | AWS S3 or Cloudflare R2 | R2 has no egress fees. S3 has broader SDK support. Either works. |
| **Inference** | **Not deployed.** | Phase 0 uses the mock processor (section 3.13). The FastAPI inference service is built in Phase 3. |

### 9.2 Railway Setup

1. Create a new Railway project.
2. Add a service from the GitHub repo, pointing at `apps/api`.
3. Set the build command: `pnpm install && pnpm turbo run build --filter=@skinsense/api`.
4. Set the start command: `node apps/api/dist/main.js`.
5. Add all environment variables from section 3.15.
6. Enable auto-deploy on push to `main`.

### 9.3 Upstash Redis Setup

1. Create a new Redis database at https://console.upstash.com.
2. Copy the `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD` into the Railway environment variables.
3. Upstash provides a REST API, but we use the standard Redis protocol via `ioredis` for BullMQ compatibility. Ensure "Standard Redis" mode is enabled.

### 9.4 DNS & Domains (Optional for Phase 0)

Not strictly required for Phase 0. When ready:

- `api.skinsense.app` -- points to Railway/Fly.io.
- `api-preview.skinsense.app` -- points to the preview environment.

---

## 10. Sentry Setup

### 10.1 Create Sentry Projects

Create two projects in Sentry:

1. **skinsense-mobile** -- Platform: React Native.
2. **skinsense-api** -- Platform: Node.js (Express).

### 10.2 Mobile Sentry Configuration

Already initialized in section 2.4 (`_layout.tsx`). Additional configuration:

```ts
// In apps/mobile/app/_layout.tsx, expand Sentry.init:
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? "",
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  environment: __DEV__ ? "development" : "production",
  enableAutoSessionTracking: true,
  attachScreenshot: true,
  enableNativeFramesTracking: true,
});
```

### 10.3 Source Map Upload (EAS Build)

Add the Sentry Expo plugin to `apps/mobile/app.json`:

```jsonc
{
  "expo": {
    "plugins": [
      [
        "@sentry/react-native/expo",
        {
          "organization": "YOUR_SENTRY_ORG",
          "project": "skinsense-mobile"
        }
      ]
    ]
  }
}
```

Set `SENTRY_AUTH_TOKEN` as an EAS secret:

```bash
eas secret:create --name SENTRY_AUTH_TOKEN --value "your-sentry-auth-token" --scope project
```

Source maps are automatically uploaded during EAS Build when this plugin is configured.

### 10.4 API Sentry Configuration

Already initialized in section 3.4 (`main.ts`). The `GlobalExceptionFilter` (section 3.8) calls `Sentry.captureException()` for all unhandled errors.

### 10.5 Error Boundaries on Mobile

Wrap each tab screen with an error boundary. Create a reusable component:

```tsx
// apps/mobile/components/ScreenErrorBoundary.tsx
import * as Sentry from "@sentry/react-native";
import { View, Text, Pressable } from "react-native";

interface FallbackProps {
  resetError: () => void;
}

function ErrorFallback({ resetError }: FallbackProps) {
  return (
    <View className="flex-1 items-center justify-center bg-surface px-6">
      <Text className="text-lg font-semibold text-gray-800">Something went wrong</Text>
      <Text className="mt-2 text-center text-sm text-gray-500">
        An unexpected error occurred. Please try again.
      </Text>
      <Pressable
        className="mt-6 rounded-lg bg-primary-600 px-6 py-3"
        onPress={resetError}
      >
        <Text className="font-medium text-white">Try Again</Text>
      </Pressable>
    </View>
  );
}

export const ScreenErrorBoundary = Sentry.withErrorBoundary(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  { fallback: (props) => <ErrorFallback resetError={props.resetError} /> },
);
```

Then wrap each screen:

```tsx
// Example: apps/mobile/app/(tabs)/home.tsx
import { View, Text } from "react-native";
import { ScreenErrorBoundary } from "../../components/ScreenErrorBoundary";

function HomeScreenContent() {
  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <Text className="text-lg font-semibold text-gray-800">Home</Text>
      <Text className="mt-2 text-sm text-gray-500">Phase 0 placeholder</Text>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ScreenErrorBoundary>
      <HomeScreenContent />
    </ScreenErrorBoundary>
  );
}
```

---

## 11. Deliverable Checklist

Every item below must be verifiable before Phase 0 is considered complete. Each item includes the verification command or check.

### Monorepo & Tooling

- [ ] **1. Monorepo initializes and installs cleanly.**
  ```bash
  git clone <repo> && cd skinsense && pnpm install
  # Exit code 0. No errors. pnpm-lock.yaml is committed.
  ```

- [ ] **2. `pnpm turbo run build` succeeds across all workspaces.**
  ```bash
  pnpm turbo run build
  # All tasks complete with exit code 0.
  ```

- [ ] **3. `pnpm turbo run lint` passes with zero errors.**
  ```bash
  pnpm turbo run lint
  # Exit code 0. No lint errors (warnings are acceptable in Phase 0).
  ```

- [ ] **4. `pnpm turbo run typecheck` passes with zero errors.**
  ```bash
  pnpm turbo run typecheck
  # Exit code 0. No type errors.
  ```

- [ ] **5. Prettier formats all files consistently.**
  ```bash
  pnpm format:check
  # Exit code 0. No unformatted files.
  ```

### Mobile App

- [ ] **6. Expo dev server starts without errors.**
  ```bash
  cd apps/mobile && npx expo start
  # Dev server starts. QR code displayed. No red errors in terminal.
  ```

- [ ] **7. App renders on iOS Simulator or Android Emulator.**
  ```bash
  # Press 'i' for iOS or 'a' for Android in the Expo dev server.
  # The tab bar with 5 tabs (Home, Scan, Routine, Progress, Settings) is visible.
  ```

- [ ] **8. Auth gate redirects unauthenticated users to login screen.**
  ```
  # On app launch (no stored tokens), the login screen is displayed.
  ```

- [ ] **9. NativeWind styles render correctly.**
  ```
  # Placeholder screens show centered text with correct colors from the Tailwind config.
  ```

- [ ] **10. EAS Build completes for the development profile.**
  ```bash
  cd apps/mobile && eas build --platform ios --profile development
  # Build succeeds. Artifact URL is printed.
  ```

### Backend API

- [ ] **11. NestJS server starts and responds to health check.**
  ```bash
  cd apps/api && pnpm dev
  # In another terminal:
  curl http://localhost:3000/health
  # Returns: { "status": "ok", "info": { "database": { "status": "up" } } }
  ```

- [ ] **12. Prisma migrations apply cleanly to a fresh database.**
  ```bash
  cd apps/api && npx prisma migrate deploy
  # Exit code 0. All migrations applied.
  ```

- [ ] **13. Prisma seed script populates test data.**
  ```bash
  cd apps/api && npx prisma db seed
  # "Seed complete." logged. No errors.
  # Verify:
  npx prisma studio
  # Opens browser. User, Product, Scan, and ScanResult tables contain data.
  ```

- [ ] **14. BullMQ mock processor processes a job end-to-end.**
  ```bash
  # Create a scan via the API (with a valid auth token):
  curl -X POST http://localhost:3000/scans \
    -H "Authorization: Bearer <valid_token>" \
    -H "Content-Type: application/json" \
    -d '{"imageKeys": ["test/image.jpg"], "questionnaire": {"concern": "acne"}}'
  # Returns scan with status "PENDING".
  # Wait a few seconds, then:
  curl http://localhost:3000/scans/<scan_id>/result
  # Returns the mock ScanResult with skinHealthScore: 72.
  ```

- [ ] **15. Request ID is generated and returned in every response.**
  ```bash
  curl -v http://localhost:3000/health 2>&1 | grep x-request-id
  # Prints: x-request-id: <uuid>
  ```

- [ ] **16. Global exception filter returns structured JSON for errors.**
  ```bash
  curl http://localhost:3000/nonexistent-route
  # Returns JSON: { "statusCode": 404, "message": "Cannot GET /nonexistent-route", "timestamp": "...", "path": "/nonexistent-route", "requestId": "..." }
  ```

- [ ] **17. Presigned URL endpoint returns a valid S3 upload URL.**
  ```bash
  curl -X POST http://localhost:3000/upload/presign \
    -H "Authorization: Bearer <valid_token>" \
    -H "Content-Type: application/json" \
    -d '{"contentType": "image/jpeg", "fileExtension": ".jpg"}'
  # Returns: { "url": "https://skinsense-uploads.s3...", "key": "scans/...", "expiresAt": "..." }
  ```

### Shared Types

- [ ] **18. `@skinsense/types` builds and exports all schemas.**
  ```bash
  cd packages/types && pnpm build
  # dist/ folder created with .js and .d.ts files.
  # Verify exports:
  node -e "const t = require('./dist'); console.log(Object.keys(t))"
  # Prints all exported schema and type names.
  ```

- [ ] **19. Both `apps/mobile` and `apps/api` can import from `@skinsense/types`.**
  ```bash
  pnpm turbo run typecheck
  # No errors related to @skinsense/types imports.
  ```

### Auth

- [ ] **20. Supabase project is created with email + Google + Apple providers enabled.**
  ```
  # Verify in Supabase dashboard: Authentication > Providers.
  # Email, Google, and Apple are listed and enabled.
  ```

- [ ] **21. Supabase auth guard rejects requests without a valid token.**
  ```bash
  curl http://localhost:3000/scans -H "Authorization: Bearer invalid-token"
  # Returns 401: { "statusCode": 401, "message": "Invalid or expired token" }
  ```

### S3

- [ ] **22. S3 bucket exists with server-side encryption enabled.**
  ```bash
  aws s3api get-bucket-encryption --bucket skinsense-uploads
  # Returns: SSEAlgorithm: AES256
  ```

- [ ] **23. CORS is configured on the S3 bucket.**
  ```bash
  aws s3api get-bucket-cors --bucket skinsense-uploads
  # Returns the CORS rules from section 7.2.
  ```

### CI/CD

- [ ] **24. GitHub Actions CI passes on a PR.**
  ```
  # Open a PR with any change. The CI workflow runs lint, typecheck, and test.
  # All jobs pass (green checkmark).
  ```

- [ ] **25. Merge to main triggers API deployment and EAS Build.**
  ```
  # Merge a PR to main. Verify in GitHub Actions:
  # - "Deploy API" job runs and succeeds.
  # - "EAS Build (Preview)" job triggers a build on expo.dev.
  ```

### Deployment

- [ ] **26. API is accessible at the deployed URL.**
  ```bash
  curl https://api-preview.skinsense.app/health
  # Returns: { "status": "ok", ... }
  ```

- [ ] **27. Redis is reachable from the deployed API.**
  ```
  # The health check passing (item 26) implicitly confirms the DB connection.
  # For Redis, enqueue a test job and verify it processes:
  # (Use the scan creation endpoint from item 14 against the deployed URL.)
  ```

### Observability

- [ ] **28. Sentry receives errors from the mobile app.**
  ```
  # In the mobile app, trigger a test error:
  # Add a temporary `throw new Error("Sentry test")` in a screen.
  # Verify the error appears in Sentry > skinsense-mobile project.
  ```

- [ ] **29. Sentry receives errors from the API.**
  ```
  # Trigger a 500 error on the API (e.g., disconnect the database temporarily).
  # Verify the error appears in Sentry > skinsense-api project.
  ```

- [ ] **30. API logs are structured JSON.**
  ```bash
  # Check Railway/Fly.io logs after a few requests.
  # Every log line is valid JSON with: timestamp, level, context, message.
  ```

---

## Appendix A: Environment Variables Summary

### `apps/mobile` (set via `eas.json` env or `.env`)

| Variable | Example |
|----------|---------|
| `EXPO_PUBLIC_API_URL` | `https://api.skinsense.app` |
| `EXPO_PUBLIC_SUPABASE_URL` | `https://xyz.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` |
| `EXPO_PUBLIC_SENTRY_DSN` | `https://abc@sentry.io/123` |

### `apps/api` (set via Railway env or `.env`)

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/skinsense` |
| `REDIS_HOST` | `us1-xyz.upstash.io` |
| `REDIS_PORT` | `6379` |
| `REDIS_PASSWORD` | `abc123` |
| `SUPABASE_URL` | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` |
| `AWS_REGION` | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | `wJalr...` |
| `S3_BUCKET_NAME` | `skinsense-uploads` |
| `SENTRY_DSN` | `https://abc@sentry.io/456` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `CORS_ORIGIN` | `*` |

---

## Appendix B: Useful Commands Quick Reference

```bash
# Start everything in dev mode
pnpm dev

# Run only the API
pnpm --filter @skinsense/api dev

# Run only the mobile app
pnpm --filter @skinsense/mobile dev

# Run all checks (what CI does)
pnpm turbo run lint typecheck test

# Prisma commands
pnpm --filter @skinsense/api prisma:migrate:dev    # Create + apply migration
pnpm --filter @skinsense/api prisma:migrate:deploy  # Apply pending migrations
pnpm --filter @skinsense/api prisma:seed            # Seed the database
npx --filter @skinsense/api prisma studio           # Visual database browser

# EAS commands (run from apps/mobile)
eas build --platform ios --profile development      # Dev client build
eas build --platform all --profile preview          # Preview build
eas update --channel preview --message "description" # OTA update

# Format all files
pnpm format
```

---

*This spec is self-contained. A developer or LLM reading only `00-Master-Overview.md` and this file has everything needed to build Phase 0 from scratch.*

*Last updated: 2026-09-30*
