# Technology Stack

## Core Framework

- **Nuxt.js 4**: Full-stack Vue.js framework with SSR support
- **Vue.js 3**: Progressive JavaScript framework with Composition API
- **TypeScript**: Strongly typed JavaScript for better development experience
- **Vite**: Fast build tool and development server

## UI & Styling

- **Vuetify 3**: Material Design component library
- **Material Design Icons (@mdi/font)**: Comprehensive icon set
- **CSS**: Global styles with CSS custom properties for theming
- **Color Mode**: Automatic dark/light theme switching

## State Management & Data

- **Pinia**: Modern state management for Vue.js
- **Vee-validate + Zod**: Form validation with schema validation
- **Chart.js + Vue-chartjs**: Data visualization and charting

## Internationalization

- **@nuxtjs/i18n**: Full i18n support with lazy loading
- **Supported Languages**: English (LTR) and Arabic (RTL)
- **Strategy**: No prefix routing with browser language detection

## Development Tools

- **ESLint**: Code linting with Nuxt ESLint configuration
- **pnpm**: Fast, disk space efficient package manager
- **Nuxt DevTools**: Enhanced development experience

## Additional Libraries

- **ExcelJS**: Excel file generation and manipulation
- **jsPDF + jsPDF-AutoTable**: PDF generation and table formatting
- **XLSX**: Excel file reading and writing
- **Toastify.js**: Toast notifications

## Build System & Commands

### Development

```bash
# Start development server (http://localhost:3000)
pnpm dev

# Install dependencies
pnpm install

# Prepare Nuxt (run after dependency changes)
pnpm postinstall
```

### Production

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Generate static site (if needed)
pnpm generate
```

### Code Quality

```bash
# Run ESLint
npx eslint .

# Fix ESLint issues
npx eslint . --fix
```

## Configuration Files

- `nuxt.config.ts`: Main Nuxt configuration
- `tsconfig.json`: TypeScript configuration (references .nuxt configs)
- `eslint.config.mjs`: ESLint configuration
- `i18n.config.ts`: Internationalization configuration
- `package.json`: Dependencies and scripts

## Environment

- **Node.js**: Required for development and build
- **pnpm**: Preferred package manager
- **Development Port**: 3000 (default)
- **SSR**: Enabled by default
