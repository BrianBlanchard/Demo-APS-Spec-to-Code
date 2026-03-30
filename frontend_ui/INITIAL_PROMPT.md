You need to implement all the user stories mentioned in ./user-stories folder by following the instructions below.

For each user story, run ./extract_component_code.py using the .json file in the same folder to get the initial react code in the application. Do this for all the stories in the user-stories folder. Once this step is done refer the ./best-practices folder to refactor the code following all the conventions specified. Once this is done focus on integrating with the API's mentioned in each of the stories using the openapi spec one at a time, for each story once api integration is complete,

Run "nohup npm run dev > dev.log 2>&1 &" and use playwright mcp to test all the usecases once all the stories are all implemented

Use Tailwind v4 for styling. follow all the below mentioned guidelines while implementing the user stories.

## CRITICAL: Project Structure

**ALWAYS create the React application in a separate folder to avoid conflicts with backend files and configuration:**

```
project-root/
├── client/                 # React application goes here
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── index.html
├── server.cjs             # Backend server (use .cjs extension for CommonJS)
├── db.json                # Backend database
├── openapi.yml            # API specification
├── user-stories/          # User story files
├── best-practices/        # Best practice documents
└── extract_component_code.py
```

**Important Notes:**
- Never create the React app in the root directory if there's already a package.json with backend dependencies
- Use `server.cjs` extension for the backend server file to avoid ES module conflicts
- Keep frontend and backend dependencies separate

## Setup

1. **Create project structure:**
   ```bash
   mkdir -p client
   cd client
   ```

2. **Create new Vite + React + TypeScript application:**
  Always use this command to initialise new repository
   ```bash
   npm create vite@latest . -- --template react-ts
   npm install
   ```

3. **Install dependencies:**
   ```bash
   npm install @tanstack/react-query axios react-router-dom zod
   npm install -D @tailwindcss/postcss tailwindcss
   ```

4. **Configure PostCSS inline in vite.config.ts:**
   ```ts
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import tailwind from '@tailwindcss/postcss'
   import path from 'path'

   export default defineConfig({
     plugins: [react()],
     css: {
       postcss: {
         plugins: [tailwind()]
       }
     },
     server: {
       port: 5173,
       // DO NOT proxy client-side routes - only use proxy for API endpoints if needed
       // Since we're using absolute URLs in axios, no proxy is required
     },
     resolve: {
       alias: {
         '@/components': path.resolve(__dirname, './src/components'),
         '@/types': path.resolve(__dirname, './src/types'),
         '@/services': path.resolve(__dirname, './src/services'),
         '@/utils': path.resolve(__dirname, './src/utils'),
         '@/views': path.resolve(__dirname, './src/views'),
         '@/hooks': path.resolve(__dirname, './src/hooks'),
         '@/constants': path.resolve(__dirname, './src/constants'),
       }
     }
   })
   ```

5. **Update index.css:** `@import "tailwindcss";` (remove all other styles except basic body resets)

6. **Update App.css:** `#root { width: 100%; height: 100vh; }`

7. **CRITICAL: Configure API Base URL correctly in services:**
   ```ts
   // src/services/auth.ts (or any API service file)
   const API_BASE_URL = 'http://localhost:8000'; // Always set to backend URL, never empty string
   ```

8. **Backend Server Setup:**
   - Ensure the backend server file uses `.cjs` extension if the main project has `"type": "module"` in package.json
   - Start backend server: `node server.cjs` or add to package.json scripts
   - Verify backend is running on port 8000 before starting frontend

## Import Strategy Configuration & Usage

### Path Alias Configuration

Configure path aliases to enable clean, maintainable imports across your application.

#### 1. TypeScript Configuration (tsconfig.app.json)

Add the following to your `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/components/*": ["src/components/*"],
      "@/types/*": ["src/types/*"],
      "@/services/*": ["src/services/*"],
      "@/utils/*": ["src/utils/*"],
      "@/views/*": ["src/views/*"]
    }
  }
}
```

#### 2. Vite Configuration (vite.config.ts)

Add the following to your `vite.config.ts`:

```ts
import path from 'path'

export default defineConfig({
  // ... other config
  resolve: {
    alias: {
      '@/components': path.resolve(__dirname, './src/components'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/views': path.resolve(__dirname, './src/views'),
    }
  }
})
```

### Import Strategy Rules

Follow these rules to maintain consistency and clarity across your codebase:

#### Absolute Imports (`@/...`)

**Use for:** Cross-folder dependencies (different feature groups)

**Examples:**
- Views importing shared components: `import { Button } from '@/components/button'`
- Views importing services: `import { fetchUser } from '@/services/user'`
- Services importing types: `import type { ApiRequest } from '@/types/api'`
- Components importing other shared components: `import { Alert } from '@/components/alert'`
- Hooks importing services: `import { loginUser } from '@/services/auth'`

**Benefits:**
- Clear intent: Immediately signals cross-folder dependency
- Easier refactoring: Moving files doesn't break imports
- Better navigation: IDEs can jump to definitions reliably
- No relative path chains: Avoid `../../../` complexity

#### Relative Imports (`./...`)

**Use for:** Same-feature dependencies (within same folder group)

**Examples:**
- View importing its UI component: `import { FeatureUI } from './feature.ui'`
- View importing feature-specific hook: `import { useFeatureMutation } from './hooks/use-feature-mutation'`
- Component importing sibling component: `import { SubComponent } from './sub-component'`
- Hook importing feature utility: `import { validateForm } from '../utils/validation'`

**Benefits:**
- Feature cohesion: Keeps related code together
- Easier to move: Can move entire feature folders without breaking internal imports
- Clear scope: Signals that this is feature-specific code

### Practical Application

```tsx
// ✅ GOOD: View file (src/views/login/login.view.tsx)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Absolute imports for shared code
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import type { AuthRequest } from '@/types/auth';
import { loginUser } from '@/services/auth';
// Relative imports for feature-specific code
import { LoginUI } from './login.ui';
import { useLoginMutation } from './hooks/use-login-mutation';

// ❌ BAD: Mixing import styles inconsistently
import { Button } from '../../../components/button';  // Should be absolute
import { LoginUI } from '@/views/login/login.ui';    // Should be relative
```

## File Refactoring Best Practice

When refactoring extracted components, follow this workflow to avoid file duplication:

1. **Extract Initial Component**: Run `extract_component_code.py` to create the initial file (e.g., `login.ui.tsx`)
2. **Refactor In-Place**: Apply transformations and refactoring directly to the extracted file
3. **Verify Before Committing**: Ensure all functionality works correctly with the refactored version
4. **Never Create Parallel Versions**: Avoid creating files like `login-new.ui.tsx` or `login-refactored.ui.tsx`

**Example Workflow:**
- ✅ Extract → `login.ui.tsx`
- ✅ Refactor → Update `login.ui.tsx` in place
- ❌ Extract → `login.ui.tsx`, Create → `login-new.ui.tsx` (creates duplication)

This keeps the codebase clean and avoids confusion about which file is the "correct" version.

---

## Component Extraction & Fixes

Extract componentCode from JSON and apply these transformations:

### 1. Fonts

- Identify all custom fonts in className patterns
- Add Google Fonts links to index.html with all necessary weights
- Replace: `font-['FontName:Weight',sans-serif]` → `font-['FontName']` + appropriate Tailwind weight class
- Pattern: `font-['FontName:Bold',...]` → `font-['FontName'] font-bold`
- Pattern: `font-['FontName:Regular',...]` → `font-['FontName']`

### 2. CSS Variables (Colors, Spacing, etc.)

Replace ALL CSS variable references with their fallback values:

- `text-[color:var(--any/path,#hex)]` → `text-[#hex]`
- `bg-[var(--any/path,#hex)]` → `bg-[#hex]`
- `border-[var(--any/path,#hex)]` → `border-[#hex]`
- `gap-[var(--any/path,Npx)]` → `gap-[Npx]`
- `p-[var(--any/path,Npx)]` → `p-[Npx]`
- `px-[var(--any/path,Npx)]` → `px-[Npx]`
- `rounded-[var(--any/path,Npx)]` → `rounded-[Npx]`

Apply to ALL properties: padding, margin, gap, width, height, colors, borders, etc.

### 3. Responsive Layout Transformation

The exported Figma code will have fixed dimensions. Make it full-screen responsive:

#### a. Root component wrapper
- Change: `className="... size-full"` → `className="... w-screen h-screen overflow-hidden"`

#### b. Main content container (typically the first child)
- Change: `h-[1024px] w-[1440px]` (or any fixed px values) → `h-full w-full`
- Change: `items-center` → `items-stretch` (for equal-height panels)

#### c. Two-panel layouts (left/right or similar flex children)
- Replace verbose flex classes: `flex-[1_0_0] h-[Npx] min-h-px min-w-px ... shrink-0`
- With simple: `flex-1` (automatically splits space equally)
- Ensure both panels have: relative positioning for absolute children

#### d. Absolutely positioned backgrounds
- Pattern: `absolute h-[Npx] left-0 top-0 w-[Npx]` → `absolute inset-0`
- Add: `object-cover` to background images for proper scaling

#### e. Absolutely positioned content layers
- Change: `absolute ... left-0 top-0 w-[Npx] h-[Npx]` → `relative ... w-full h-full`
- Add: `z-10` (or higher) to ensure content appears above backgrounds
- Remove explicit left/top positioning when no longer needed

#### f. Overflow handling
- Change: `overflow-clip` → `overflow-hidden` for better compatibility

### 4. App Integration

- Update App.tsx to render component directly: `return <ExtractedComponent />`
- Ensure no wrapper divs with restrictive dimensions

## Code Analysis Before Abstraction

**Critical: Always perform full code analysis before creating shared components or abstractions.**

One of the most common and costly mistakes in component refactoring is premature abstraction based on superficial similarity. When components *appear* similar at first glance, there's a strong temptation to immediately create a shared abstraction. However, this often leads to missing important variations that serve specific design or psychological purposes.

### The Problem: Premature Abstraction

**Real-World Example:**

When implementing login and signup pages, both may have:
- Same dark blue background color (`bg-[#0f2847]`)
- Same "Modern Bank" branding
- Same circular logo
- Same layout structure (left panel + right form)

**The Trap:** Your brain pattern-matches these similarities and concludes "they're identical, let's create one shared LeftPanel component!"

**The Reality:** The background decorative elements are completely different:
- **Login**: Simple black decorative circles with opacity (professional, calm, familiar feel for returning users)
- **Signup**: Blue gradient blurs, white geometric shapes, decorative dots, wave patterns (vibrant, welcoming, exciting feel to encourage conversion)

These differences aren't arbitrary - they serve distinct psychological purposes for different user contexts.

### Step-by-Step Analysis Process

Follow this workflow before creating ANY shared component:

#### 1. Read Complete Extracted Files

**DO:**
```bash
# ✅ Read entire files without line limits
Read login.ui.tsx (full file)
Read signup.ui.tsx (full file)
# Read all similar component files completely
```

**DON'T:**
```bash
# ❌ Read only partial files
Read login.ui.tsx (limit: 50 lines)  # DANGER: Misses decorative elements
Read signup.ui.tsx (offset: 0, limit: 100)  # DANGER: Incomplete picture
```

**Why:** Decorative elements, background patterns, and visual treatments often appear deeper in the component structure (lines 100-200+). Reading only the first 50-100 lines will show you form structure but miss critical design variations.

#### 2. Document ALL Differences

Before abstracting, create a differences checklist:

```markdown
## Login vs Signup Left Panel Comparison

### Identical:
- [ ] Background color: #0f2847 ✓
- [ ] Logo: Same SVG ✓
- [ ] Typography: Same fonts and sizes ✓
- [ ] Layout: Centered vertical stack ✓

### Different:
- [x] Background decorations:
  - Login: 3 black circles with opacity
  - Signup: Blue gradient blurs + white shapes + dots + waves
- [x] Visual mood:
  - Login: Professional, calm
  - Signup: Vibrant, welcoming
```

#### 3. Determine Abstraction Strategy

Based on differences found, choose one approach:

**Option A: Separate Components** (when differences are substantial)
```tsx
// login/components/login-left-panel.tsx
// signup/components/signup-left-panel.tsx
```

**Option B: Variant-Aware Component** (when differences are variations of same pattern)
```tsx
// components/auth-layout/left-panel.tsx
type LeftPanelProps = {
  variant: 'login' | 'signup';
  // other props...
}
```

**Option C: Composition with Slots** (when structure identical but content differs)
```tsx
<AuthLayout leftPanel={<LoginDecorations />}>
```

**For our example:** Option B is best because the structure is identical, only decorative elements differ.

### Visual Comparison Checklist

Before creating shared components, verify these aspects are identical (or document as variants):

#### Background & Decorations
- [ ] Background colors (solid, gradients, overlays)
- [ ] Decorative shapes (circles, rectangles, patterns)
- [ ] Blur effects and filters
- [ ] Opacity variations
- [ ] Background images or SVG patterns
- [ ] Layering and z-index structure

#### Layout & Structure
- [ ] Container dimensions and positioning
- [ ] Flex/grid layouts and direction
- [ ] Spacing (padding, margin, gap)
- [ ] Alignment and justification
- [ ] Overflow behavior

#### Typography & Content
- [ ] Font families and weights
- [ ] Font sizes and line heights
- [ ] Text colors and opacity
- [ ] Letter spacing and text alignment
- [ ] Content hierarchy

#### Interactive Elements
- [ ] Hover states and transitions
- [ ] Focus states
- [ ] Active/disabled states
- [ ] Cursor types
- [ ] Animation timing and easing

### Code Examples

#### ✅ GOOD: Variant-First Component Design

```tsx
// Created AFTER full analysis revealing differences

type LeftPanelProps = {
  title?: string;
  subtitle?: string;
  description?: string;
  variant: 'login' | 'signup';  // ← Variants identified upfront
};

export function LeftPanel({ variant, ...props }: LeftPanelProps) {
  return (
    <div className="relative flex-1 bg-[#0f2847]">
      {/* Background decorations */}
      {variant === 'login' ? (
        <LoginDecorations />
      ) : (
        <SignupDecorations />
      )}

      {/* Shared content */}
      <SharedContent {...props} />
    </div>
  );
}
```

#### ❌ BAD: Assumed Similarity Without Verification

```tsx
// Created AFTER reading only first 50 lines

type LeftPanelProps = {
  title?: string;
  subtitle?: string;
  description?: string;
  // ← No variant! Assumed all pages identical
};

export function LeftPanel(props: LeftPanelProps) {
  return (
    <div className="relative flex-1 bg-[#0f2847]">
      {/* Only login decorations - signup differences missed */}
      <div className="absolute w-[384px] h-[384px] bg-black opacity-40..." />

      <SharedContent {...props} />
    </div>
  );
}
```

### Anti-Patterns to Avoid

#### ❌ Reading Only Partial Files
```tsx
// Danger: Reading first 50-100 lines only
// Misses: Decorative elements usually appear at lines 100-200+
Read('login.ui.tsx', { limit: 50 })
```

#### ❌ "Close Enough" Fallacy
```tsx
// Mental trap: "They're 80% similar, must be identical"
// Reality: The 20% difference may be critical for UX
if (looksVaguellySimilar) {
  createSharedComponent();  // ← WRONG
}
```

#### ❌ Structure-Only Pattern Matching
```tsx
// Seeing same structure and assuming same styling
// Both have left panel + form → "Must be identical"
// Missing: Background decorations, visual treatments
```

#### ❌ Abstraction-First Approach
```tsx
// Wrong order: Abstract first, discover differences later
1. See two similar pages
2. Immediately create shared component ← WRONG
3. Apply to both pages
4. User reports: "Backgrounds look wrong!"
```

#### ✅ Analysis-First Approach
```tsx
// Correct order: Analyze fully, then abstract
1. Read all similar components completely
2. Document all differences
3. Decide: separate components OR variants
4. Implement with variants from the start
5. Test all variations
```

### Validation Checklist

Before finalizing any shared component or abstraction:

- [ ] **Read all similar component files completely** (no line limits)
- [ ] **Document all identified differences** in a comparison table
- [ ] **Verify decorative elements** (backgrounds, shapes, patterns, overlays)
- [ ] **Check interactive states** (hover, focus, active, disabled)
- [ ] **Confirm layout structure** is truly identical (not just similar)
- [ ] **Validate typography and spacing** across all variations
- [ ] **Test all variants visually** (take screenshots, compare side-by-side)
- [ ] **Consider psychological purpose** of visual differences
- [ ] **Design component API with variants** if differences found
- [ ] **Prefer explicit variants over boolean props** (`variant: 'login' | 'signup'` not `isSignup: boolean`)

### The Golden Rule

> **"Assume differences until proven identical, not identical until proven different."**

**Corollary:** Duplication is acceptable initially. It's easier to abstract duplicate code after understanding all variations than to retrofit variants into a prematurely abstracted component.

**Process:**
1. ✅ Implement both pages fully (duplication OK)
2. ✅ Identify what's TRULY identical through complete analysis
3. ✅ Abstract only the proven-identical parts
4. ❌ Don't immediately abstract on superficial similarity

**Why:** The cost of missing a visual variant (user-facing design regression) is much higher than the cost of temporary code duplication (internal code organization).

## Component Granularity & Refactoring Guidelines

After extracting and transforming components, refactor them into smaller, reusable pieces following these principles:

### Refactoring Principles

1. **Single Responsibility Principle**
   - Each component should have one clear, well-defined purpose
   - If a component does multiple things, split it into separate components
   - Example: Separate layout logic from form logic from navigation logic

2. **DRY (Don't Repeat Yourself)**
   - Identify duplicated markup across files
   - Extract repeated patterns into reusable components
   - Share common UI elements (alerts, buttons, inputs, links)

3. **Composition Over Complexity**
   - Build complex UIs by composing smaller components
   - Each small component is easier to understand, test, and maintain
   - Example: `<PageLayout>` composed of `<Header>`, `<Sidebar>`, `<MainContent>`, `<Footer>`

4. **Logical Grouping**
   - Group related UI elements into named, semantic components
   - Example: Group navigation links into `<NavigationLinks>`, form fields into `<FormGroup>`

### When to Extract Components

Extract a new component when you encounter:

1. **Duplicated Markup**
   - Same UI pattern appears in multiple files
   - Example: Bottom navigation bar, alert boxes, modal structure

2. **Clear Boundaries**
   - Sections with distinct visual or functional boundaries
   - Example: Page headers, sidebars, form containers, card layouts

3. **Reusable Patterns**
   - UI elements that could be used elsewhere
   - Example: Styled links, badges, tags, tooltips, avatars

4. **Large Components**
   - Files exceeding ~150-200 lines of code
   - Components with deeply nested JSX (>3-4 levels)

5. **Multiple Responsibilities**
   - Component handling layout + data fetching + state + styling
   - Split into layout component + container component + presentational components

### Component Hierarchy Pattern

Organize components into these categories:

#### 1. Layout Components
Define page structure and overall composition
- Naming: `*Layout`, `*Panel`, `*Wrapper`, `*Container`
- Examples: `PageLayout`, `TwoColumnLayout`, `AuthPageLayout`, `RightPanel`
- Location: `src/components/layouts/` or feature-specific `components/`

#### 2. Container Components
Group related UI elements with shared context
- Naming: `*Container`, `*Wrapper`, `*Group`, `*Section`
- Examples: `FormContainer`, `CardContainer`, `NavigationGroup`
- Location: `src/components/` or feature-specific `components/`

#### 3. Presentational Components
Specific, reusable UI elements
- Naming: Descriptive noun or action (e.g., `Alert`, `Button`, `TextLink`, `Badge`)
- Examples: `Alert`, `Input`, `Button`, `TextLink`, `Avatar`, `Spinner`
- Location: `src/components/[component-name]/`

#### 4. Compound Components
Components designed to work together
- Pattern: Parent component + child components that share context
- Examples: `NavigationLinks` (parent) + `TextLink` (child), `Tabs` + `Tab`
- Location: Same folder, export together via barrel export

### Refactoring Workflow

Follow this step-by-step process when refactoring:

1. **Identify Patterns**
   - Review extracted component for repeated markup
   - Look for similar structures across multiple features
   - Identify sections with clear boundaries or purposes

2. **Extract to Component**
   - Create new component file with clear, descriptive name
   - Define TypeScript props interface
   - Extract markup and apply proper typing
   - Add default props where appropriate

3. **Add Barrel Exports**
   - Create `index.ts` in component folder
   - Export component: `export { ComponentName } from './component-name'`
   - Enables clean imports: `import { Component } from '@/components/component-name'`

4. **Update Imports**
   - Replace inline markup with component usage
   - Use absolute imports (`@/components/*`) for shared components
   - Pass necessary data and handlers as props

### Naming Conventions

Use consistent, semantic names that describe purpose:

| Category | Pattern | Examples |
|----------|---------|----------|
| Layout | `*Layout`, `*Panel`, `*Container` | `AuthPageLayout`, `RightPanel`, `ContentContainer` |
| Actions | `*Button`, `*Link`, `*Control`, `*Toggle` | `SubmitButton`, `TextLink`, `ThemeToggle` |
| Display | `*Card`, `*Badge`, `*Alert`, `*Label`, `*Avatar` | `UserCard`, `StatusBadge`, `ErrorAlert` |
| Forms | `*Input`, `*Field`, `*Form`, `*Select` | `TextInput`, `FormField`, `LoginForm` |
| Navigation | `*Nav`, `*Menu`, `*Breadcrumb`, `*Tabs` | `BottomNav`, `SideMenu`, `TabNavigation` |
| Compound | `*Group`, `*Set`, `*List`, `*Grid` | `NavigationLinks`, `ButtonGroup`, `CardGrid` |
| Utilities | `*Indicator`, `*Divider`, `*Spacer` | `LoadingIndicator`, `VerticalDivider` |

### Component Organization

Structure your components with this pattern:

```
src/components/
├── button/
│   ├── button.tsx          # Component implementation
│   ├── button.test.tsx     # Unit tests (optional)
│   ├── button.stories.tsx  # Storybook stories (optional)
│   └── index.ts            # Barrel export: export { Button } from './button'
├── input/
│   ├── input.tsx
│   └── index.ts
├── alert/
│   ├── alert.tsx
│   └── index.ts
└── auth-layout/
    ├── auth-page-layout.tsx
    ├── right-panel.tsx
    ├── resize-indicator.tsx
    └── index.ts            # Export all related components

src/views/
└── login/
    ├── components/         # Feature-specific components (not shared)
    │   └── login-header/
    │       ├── login-header.tsx
    │       └── index.ts
    ├── hooks/              # Feature-specific hooks
    │   └── use-login-mutation.ts
    ├── utils/              # Feature-specific utilities (optional)
    ├── login.ui.tsx        # Presentational component
    ├── login.view.tsx      # Container component
    └── index.ts            # Export: export { LoginView as default }
```

### Example Refactoring Scenario

**Before:** Single 300-line UI file with inline markup
```tsx
// login.ui.tsx (300 lines)
export function LoginUI() {
  return (
    <div className="...">
      <div className="left-panel">
        {/* 50 lines of left panel markup */}
      </div>
      <div className="right-panel">
        <div className="form-container">
          {/* 40 lines of form container markup */}
          {generalError && (
            <div className="alert error">
              {/* 10 lines of error alert markup */}
            </div>
          )}
          {/* Form fields... */}
          <div className="navigation-links">
            {/* 30 lines of link markup */}
          </div>
        </div>
        <div className="bottom-nav">
          {/* 40 lines of bottom nav markup */}
        </div>
      </div>
    </div>
  );
}
```

**After:** Refactored into focused, reusable components
```tsx
// Extracted Components:
// - AuthPageLayout (combines LeftPanel + RightPanel)
// - LeftPanel (shared left section)
// - RightPanel (layout structure)
// - FormContainer (form wrapper with styling)
// - Alert (reusable alert/message box)
// - NavigationLinks (link container)
// - TextLink (individual styled link)
// - BottomNav (shared bottom navigation)

// login.ui.tsx (~75 lines)
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Alert } from '@/components/alert';
import { AuthPageLayout } from '@/components/auth-layout';
import { AuthFormContainer, NavigationLinks, TextLink } from '@/components/auth-form';

export function LoginUI({ /* props */ }) {
  return (
    <AuthPageLayout>
      <AuthFormContainer title="Welcome" onSubmit={onSubmit}>
        {generalError && <Alert variant="error">{generalError}</Alert>}
        <Input label="Username" value={username} onChange={onUsernameChange} />
        <Input label="Password" type="password" value={password} onChange={onPasswordChange} />
        <Button type="submit">Login</Button>
        <NavigationLinks>
          <TextLink onClick={onForgotPassword}>Forgot Password?</TextLink>
          <TextLink onClick={onSignup} bold>Sign Up</TextLink>
        </NavigationLinks>
      </AuthFormContainer>
    </AuthPageLayout>
  );
}
```

### Refactoring Checklist

Use this checklist when refactoring extracted components:

- [ ] Identified all duplicated markup patterns
- [ ] Extracted layout components (page structure, panels)
- [ ] Extracted container components (form wrappers, card containers)
- [ ] Extracted presentational components (alerts, links, indicators)
- [ ] Created barrel exports (`index.ts`) for all component folders
- [ ] Updated all imports to use absolute paths for shared components
- [ ] Updated all imports to use relative paths for feature-specific code
- [ ] Defined TypeScript interfaces for all component props
- [ ] Tested all extracted components for visual correctness
- [ ] Verified all interactions (clicks, forms, navigation) work
- [ ] Confirmed no console errors or warnings
- [ ] Main UI files reduced to ~100 lines or less
- [ ] Components follow naming conventions
- [ ] Components follow single responsibility principle

#IMPORTANT
Before finalising and ending the changes you must
- [ ] Make sure all stateful functionality mentioned in the stories are implemented.
- [ ] Ensure end to end flow works using playwright mcp.
- [ ] Provide a value out of A, B, C, D where A means you have followed all the instructions and D means you have not followed any of the instructions at the end. If the score is not an A, make changes untill the score is an A.