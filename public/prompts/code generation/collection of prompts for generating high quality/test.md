Design a user interface using Nuxt 3 and Vuetify 3 that closely resembles the UI depicted in the provided images. The layout should feature a fixed header at the top, which includes the company logo on one side and a non-functional language toggle button alongside a dark mode/light mode switch on the opposite side. Additionally, implement a sidebar that remains fixed in position, ensuring it is always visible even when scrolling down to view more content. The sidebar should have two display modes: a standard mode that shows both icons and labels, and a compact mode that displays only icons. In the compact mode, incorporate tooltips that appear on hover, providing the corresponding labels with a professional and smooth transition effect. Furthermore, ensure that each component—header, sidebar, and main content area—is implemented on separate pages to adhere to best practices and maintain clean, organized code. Design a modern, responsive user interface using Nuxt 3 and Vuetify 3 following industry best practices and clean code principles. The application should implement:

Header Component (/components/layout/AppHeader.vue):

- Fixed position header with responsive design
- Company logo optimized for different screen sizes
- Language selector with proper i18n integration
- Animated dark/light mode toggle using Vuetify's theme system
- Proper accessibility attributes and keyboard navigation

Sidebar Component (/components/layout/AppSidebar.vue):

- Responsive fixed sidebar with smooth transitions
- Two display modes using Vuetify's navigation drawer:
  - Full mode: Icons with labels
  - Mini mode: Icons only with elegant tooltips
- Proper state management using Pinia for sidebar state
- Nested navigation structure with proper routing
- Custom transitions and animations for smooth mode switching
- Touch-friendly for mobile devices

Main Layout (/layouts/default.vue):

- Responsive grid system using Vuetify's v-container and v-row
- Proper content organization with semantic HTML
- Dynamic viewport adjustments
- Smooth scrolling behavior
- Loading states and transitions

Additional Features:

- TypeScript integration for better type safety
- Component composition using Vue 3's Composition
- Lazy loading for optimal performance
- CSS variables for consistent theming
- Performance optimization using Nuxt's built-in features
- Responsive breakpoints for all screen sizes
- Proper ARIA labels and accessibility features
