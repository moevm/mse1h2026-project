# Copilot Instructions — MSE Project

## Project Overview

A monorepo for a student distribution application (assigning students to groups and projects).
Package manager — **pnpm** (workspace). Packages: `backend`, `frontend`, `database`, `infrastructure`, `docs`.

Root script aliases (`pnpm b`, `pnpm f`, `pnpm d`) proxy commands to the corresponding package.
Shared scripts: `dev`, `build`, `preview`, `lint`, `format`, `typecheck`.
When using aliases, if the target script name matches the package manager's system command (example, `remove`), use `run` (e.g., `pnpm b run remove`).

---

## General Rules

### Language and Types

- Write **TypeScript only**. Use ESM modules (`"type": "module"`) everywhere except the backend (CommonJS, `"module": "nodenext"`).
- **Forbidden** to use `any`. Use `unknown`, type assertions (`as`), generics, overloads, or safe wrappers instead.
- Always define `interface` or `type` for data structures, props, DTOs, API responses, and function parameters.
- Prefer `interface` for object types and `type` for union/intersection/utility types.

### Code Style — Prettier

Configuration (`/.prettierrc.yaml`):

All generated code **must** comply with these rules:
- Single quotes, semicolons, trailing commas, 2-space indentation, line length ≤ 120 characters.

### Linting — ESLint 10

- A single root config `eslint.config.ts` in **Flat Config** format.
- Frontend: `vue-eslint-parser` + `typescript-eslint` parser, `browser` globals.
- Backend: `typescript-eslint` parser, `node` + `jest` globals.
- Prettier integration via `eslint-config-prettier` (conflicts disabled).
- Verify code does not violate ESLint and Prettier rules before finalizing.

### Infrastructure

- **Docker Compose** to spin up services (DB and app).
- Store secrets **only** in `.env` files (do not commit to the repository).
- Node.js: `^20.19.0 || >=22.12.0`.

---

## Frontend (`@mse/frontend`)

### Stack

| Technology | Purpose |
|---|---|
| **Vue 3** | UI framework (SFC, Composition API) |
| **Vite** | Build tool |
| **TypeScript** | Type safety |
| **Pinia** | State management |
| **VueUse** | Utility composables |
| **Naive UI** | UI component library |
| **Axios** | HTTP client |
| **vue-router** | Routing |
| **chart.js + vue-chartjs** | Charts |
| **@vicons/material** | Icons (Material Design) |
| **SCSS** | Styles |
| **Vitest** | Testing |

### Component Rules

- Use **only** `<script setup lang="ts">`. Options API is **forbidden**.
- Styles — `<style scoped lang="scss">` by default.
- Custom components use **PascalCase**: `UserCard.vue`, `<UserCard />`.
- Naive UI components use **kebab-case**: `<n-button>`, `<n-config-provider>`.
- vue-router tags use **kebab-case**: `<router-view />`, `<router-link>`.
- Alias `@` points to `frontend/src/`.

### Typing

Always type the following:

```vue
<script setup lang="ts">
// props — via defineProps with generic
const props = defineProps<{
  title: string;
  count: number;
}>();

// emits — via defineEmits with generic
const emit = defineEmits<{
  (e: 'update', value: number): void;
  (e: 'close'): void;
}>();
</script>
```

- Composables: type arguments and return values.
- Do not use `any` in `ref()`, `reactive()`, `computed()` — specify a generic or infer from type.

### State Management (Pinia)

- Use **Pinia only** for global state.
- Stores must be **strictly typed**.
- Store naming: `use<SomethingPascalCase>Store` (e.g., `useAuthStore`).
- Do **not** store component-specific data in a store — use composables for that.
- Prefer composables when global state is not needed.

### Routing (vue-router)

- Use **lazy loading** for routes:

```ts
const routes: RouterOptions['routes'] = [
  {
    path: '/dashboard',
    component: () => import('@/pages/DashboardPage.vue'),
  },
];
```

### Utilities and Composables

- **Prefer VueUse** over custom solutions when the task is already covered by the library (e.g., `useLocalStorage`, `useDark`, `useMediaQuery`, `useFetch`).
- Name composables with the `use` prefix: `useAuth`, `useStudents`.

### HTTP Client

- Use **Axios**. Create a typed API instance.
- Type requests and responses via Axios generics.

### Icons

- Use `@vicons/material` (`@vicons/utils` package for helpers).
- Import specific icons, not the entire package.

### Charts

- Use `chart.js` with the `vue-chartjs` wrapper.
- Type chart data and options.

---

## Backend (`@mse/backend`)

### Stack

| Technology | Purpose |
|---|---|
| **NestJS** | Framework |
| **TypeScript** | Type safety (CommonJS, `"module": "nodenext"`) |
| **Prisma** | ORM (via `@mse/database`) |
| **class-validator** + **class-transformer** | DTO validation |
| **Jest** | Testing |

### Architecture

Follow the NestJS modular structure:

```
src/
  feature/
    feature.module.ts
    feature.controller.ts
    feature.service.ts
    dto/
      create-feature.dto.ts
      update-feature.dto.ts
```

- **Modules** — dependency organization.
- **Controllers** — HTTP request handling and routing.
- **Services** — business logic.
- **Providers** — any injectable dependencies.
- Use NestJS **Dependency Injection** throughout.

### Typing

- `any` is **forbidden** in controllers and services.
- Always type: request parameters, body, responses.
- Use types generated by Prisma (`@mse/database`).

### DTOs and Validation

- Use `class-validator` and `class-transformer` for input validation.
- DTOs are **strictly typed** — every property has validation decorators.
- Enable the **global** `ValidationPipe`:

```ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
```

### Error Handling

- Handle errors **centrally** (exception filters).
- **Do not expose** internal error details to the client (stack traces, SQL queries).
- Handle Prisma errors **explicitly** (`PrismaClientKnownRequestError`, etc.).

---

## Database (`@mse/database`)

### Stack

| Technology | Purpose |
|---|---|
| **Prisma ORM** | Database access |
| **MariaDB (MySQL)** | DBMS |

### Rules

- **Migrations are required** (`prisma migrate dev`). Do not modify the DB schema manually.
- Use types **generated by Prisma** (from `database/generated/prisma/`).
- **Do not write raw SQL** unless absolutely necessary.
- Use **transactions** when modifying multiple entities:

```ts
await prisma.$transaction([
  prisma.user.update({ ... }),
  prisma.project.create({ ... }),
]);
```

- Handle Prisma errors explicitly.
- Seed data is located in `database/src/seed.ts`.

---

## Security

- **Do not store** secrets (passwords, API keys, tokens) in the repository.
- Use `.env` for configuration, `.env.example` as a template.
- **Validate** all input (DTOs on the backend, forms on the frontend).
- Handle errors centrally — do not expose internal details to the client.

---

## Testing

| Part | Framework | Configuration |
|---|---|---|
| Frontend | **Vitest** | `vitest` in devDependencies |
| Backend | **Jest** | `jest` + `ts-jest`, config in `package.json` |

- Backend tests: `*.spec.ts` in `src/`, E2E — in `test/`.
- Frontend tests: place alongside components or in `__tests__/`.

---

## Forbidden — Quick Reference

| Forbidden | Alternative |
|---|---|
| `any` | `unknown`, generics, type assertions, interfaces |
| Options API (Vue) | `<script setup lang="ts">` + Composition API |
| Raw SQL | Prisma ORM |
| Secrets in code | `.env` |
| Manual DB schema changes | Prisma migrations |
| Custom solutions when VueUse covers it | `@vueuse/core` |
| Untyped props/emits/DTOs | Strict typing via generics and decorators |