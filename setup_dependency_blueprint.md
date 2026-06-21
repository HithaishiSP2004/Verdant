# Project Setup & Dependency Blueprint

This blueprint outlines the exact package configurations, installation procedures, and execution routines required to stand up the **Verdant** digital ecosystem.

---

## 1. Dependency Manifesto

The dependencies are tuned for Next.js 16 (Turbopack) and React 19.

### Production Dependencies (`dependencies`)

| Package Name | Version | Purpose |
| :--- | :--- | :--- |
| `next` | `16.2.9` | Core App Router framework |
| `react` | `19.2.4` | Component tree rendering |
| `react-dom` | `19.2.4` | DOM bindings for React |
| `@google/generative-ai` | `^0.24.1` | Gemini API client for action logs and projections |
| `@supabase/supabase-js` | `^2.108.2` | Database connections, auth, and state persistence |
| `@supabase/ssr` | `0.12.0` | Supabase auth cookie integration in server components / middleware |
| `three` | `^0.184.0` | Underlying WebGL engine |
| `@react-three/fiber` | `^9.6.1` | React components for Three.js rendering |
| `@react-three/drei` | `^10.7.7` | Collection of helpers for R3F (cameras, loaders) |
| `framer-motion` | `^12.40.0` | CSS and component transition animations |
| `zustand` | `^5.0.14` | Client-side ecosystem state management |
| `zod` | `^4.4.3` | Schema validation for user-submitted habits |
| `lucide-react` | `^1.21.0` | UI icon pack |

### Development Dependencies (`devDependencies`)

| Package Name | Version | Purpose |
| :--- | :--- | :--- |
| `typescript` | `^5` | Strict static typing compilation |
| `vitest` | `^4.1.9` | Unit test execution |
| `tailwindcss` | `^4` | Styling framework (PostCSS integrated) |
| `@tailwindcss/postcss` | `^4` | PostCSS connector for styling compilation |
| `@types/node` | `^20` | Types for Node.js environments |
| `@types/react` | `^19` | Types for React framework |
| `@types/three` | `^0.184.1` | Typings for R3F integration |
| `eslint` | `^9` | Code linting |

---

## 2. Setting Up the Environment

### Prerequisites
- Node.js `20.x` or higher
- npm `10.x` or higher

### Step 1: Install Dependencies
From the project root directory, run:
```bash
npm install
```

### Step 2: Environment Variables
Create a `.env.local` file in the root directory:
```ini
# Supabase Local Sandbox / Remote Settings
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# Gemini API Key (Server-Side Only)
GEMINI_API_KEY=your-google-gemini-api-key
```

> [!NOTE]
> When the project runs in `development` or if the Supabase URL includes `local-sandbox`, the authentication middleware and API gates will bypass direct validation and default to a **local high-fidelity sandbox mode** for offline presentation and fast review.

---

## 3. Core Commands and Scripts

| Command | Action | Environment |
| :--- | :--- | :--- |
| `npm run dev` | Spins up the development server on `http://localhost:3000` | Development |
| `npm run build` | Compiles the Next.js App Router project into an optimized bundle | Production |
| `npm run start` | Boots the compiled production server | Production |
| `npm run test` | Executes unit tests via Vitest in single-run mode | Test |
| `npm run lint` | Runs ESLint scans across the codebase | Quality Assurance |

---

## 4. Supabase DB Schema Template (Optional Integration)

For full integration with Supabase, run the following SQL schema migrations in your Supabase SQL editor:

```sql
-- Create Ecosystem State table
create table public.ecosystems (
  user_id uuid references auth.users not null primary key,
  vitality_score numeric(3,2) default 0.65 check (vitality_score >= 0.00 and vitality_score <= 1.00),
  guardian_archetype text default 'Forest Guardian',
  ecosystem_personality text,
  growth_story text,
  tree_count integer default 5,
  flower_count integer default 3,
  weather_condition text default 'sunny',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.ecosystems enable row level security;

-- Create policy allowing users to select/update their own state
create policy "Users can modify their own ecosystem" 
  on public.ecosystems 
  for all 
  using (auth.uid() = user_id);
```
