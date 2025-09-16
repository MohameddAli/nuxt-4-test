# Export System Documentation

## Overview

The export system provides comprehensive PDF and Excel export functionality for your Nuxt 3 application. All exports are performed **client-side** using modern browser APIs, ensuring fast performance and no server load.

## Features

### ✅ Client-Side Processing
- **PDF Generation**: Uses `jsPDF` with `jspdf-autotable` for professional PDF creation
- **Excel Generation**: Uses `SheetJS (xlsx)` for Excel file creation
- **No Server Load**: All processing happens in the user's browser
- **Immediate Download**: Files are generated and downloaded instantly
- **Dynamic Imports**: Libraries are loaded on-demand to reduce bundle size

### ✅ Flexible Data Export
- **Column Selection**: Choose which columns to include in exports
- **Data Filtering**: Export all data, current page, or selected rows
- **Format Options**: Customize headers, styling, and layout
- **File Naming**: Automatic filename generation with timestamps

### ✅ User Experience
- **Progress Tracking**: Real-time progress indicators during export
- **Error Handling**: Comprehensive error messages and recovery
- **Internationalization**: Full Arabic and English support
- **Accessibility**: Keyboard navigation and screen reader support

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   ExportButton  │───▶│   useExport      │───▶│  Browser APIs   │
│   Component     │    │   Composable     │    │  (jsPDF/xlsx)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  ExportDialog   │    │  ExportOptions   │    │  File Download  │
│  (Configuration)│    │  (Validation)    │    │  (Blob/URL)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Components

### 1. ExportButton.vue
Main export button component that can be integrated into any data table.

```vue
<template>
  <ExportButton
    :data="myData"
    :columns="myColumns"
    filename="My_Export"
    :formats="['pdf', 'excel']"
    @export-complete="handleComplete"
  />
</template>
```

**Props:**
- `data`: Array of data objects to export
- `columns`: Array of column definitions
- `filename`: Optional custom filename
- `formats`: Array of export formats (`'pdf'` | `'excel'`)
- `disabled`: Disable export functionality
- `showAsMenu`: Show as dropdown menu or direct buttons
- `autoExport`: Skip dialog and export immediately

### 2. ExportDialog.vue
Comprehensive configuration dialog for export options.

**Features:**
- Format selection (PDF/Excel)
- Column selection with checkboxes
- Data selection (All/Current/Selected)
- Format-specific options
- File size estimation
- Real-time preview

### 3. ExportOptionsForm.vue
Compact form for use within dropdown menus.

## Data Models

### ExportColumn
```typescript
interface ExportColumn {
  key: string           // Data property name
  title: string         // Display name
  type: 'string' | 'number' | 'date' | 'boolean'
  format?: string       // Optional formatting
  width?: number        // Column width
}
```

### ExportOptions
```typescript
interface ExportOptions {
  format: 'pdf' | 'excel'
  filename: string
  selectedColumns: string[]
  dataSelection: 'all' | 'current' | 'selected'
  includeHeaders: boolean
  pageOrientation?: 'portrait' | 'landscape'
  pageSize?: 'A4' | 'A3' | 'Letter'
  title?: string
  subtitle?: string
}
```

## Usage Examples

### Basic Integration
```vue
<template>
  <v-data-table :headers="headers" :items="items">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>My Data</v-toolbar-title>
        <v-spacer />
        
        <ExportButton
          :data="items"
          :columns="exportColumns"
          filename="Data_Export"
          :formats="['pdf', 'excel']"
          @export-complete="handleExportComplete"
        />
      </template>
    </v-data-table>
  </v-data-table>
</template>

<script setup>
const items = ref([
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' }
])

const exportColumns = [
  { key: 'id', title: 'ID', type: 'number' },
  { key: 'name', title: 'Name', type: 'string' },
  { key: 'email', title: 'Email', type: 'string' }
]

const handleExportComplete = (format, filename) => {
  console.log(`${format} export completed: ${filename}`)
}
</script>
```

### Advanced Configuration
```vue
<template>
  <!-- Separate buttons for each format -->
  <ExportButton
    :data="salesData"
    :columns="salesColumns"
    filename="Sales_Report"
    :formats="['pdf']"
    :show-as-menu="false"
    :auto-export="true"
    button-text="Quick PDF"
    color="error"
    variant="tonal"
  />
  
  <ExportButton
    :data="salesData"
    :columns="salesColumns"
    filename="Sales_Data"
    :formats="['excel']"
    :show-as-menu="false"
    :auto-export="true"
    button-text="Quick Excel"
    color="success"
    variant="tonal"
  />
</template>
```

### Row Selection Export
```vue
<template>
  <v-data-table
    v-model="selected"
    :headers="headers"
    :items="items"
    show-select
    return-object
  >
    <template v-slot:top>
      <div class="d-flex align-center gap-4">
        <span>{{ selected.length }} of {{ items.length }} selected</span>
        
        <ExportButton
          :data="selected"
          :columns="columns"
          filename="Selected_Items"
          :has-selected-data="selected.length > 0"
          :disabled="selected.length === 0"
        />
      </div>
    </template>
  </v-data-table>
</template>
```

## Performance Considerations

### Client-Side Limits
- **PDF Export**: Up to 10,000 rows recommended
- **Excel Export**: Up to 100,000 rows recommended
- **Memory Usage**: Large datasets may impact browser performance
- **File Size**: Generated files are limited by browser memory

### Optimization Tips
1. **Filter Data**: Export only necessary data
2. **Select Columns**: Include only required columns
3. **Chunk Large Data**: Split large datasets into smaller exports
4. **Progress Feedback**: Show progress for large exports

## Error Handling

### Common Errors
- **No Data**: "No data available for export"
- **No Columns**: "Please select at least one column"
- **Invalid Filename**: "Filename contains invalid characters"
- **Memory Error**: "Dataset too large for client-side export"

### Error Recovery
- Automatic validation before export
- Clear error messages with suggestions
- Graceful fallback options
- User-friendly notifications

## Internationalization

### English Translations
```json
{
  "export": {
    "title": "Export Data",
    "pdf": "PDF",
    "excel": "Excel",
    "exporting": "Exporting",
    "exportSuccess": "Export completed successfully"
  }
}
```

### Arabic Translations
```json
{
  "export": {
    "title": "تصدير البيانات",
    "pdf": "PDF",
    "excel": "Excel",
    "exporting": "جاري التصدير",
    "exportSuccess": "تم التصدير بنجاح"
  }
}
```

## Browser Compatibility

### Supported Browsers
- **Chrome**: 80+ (Full support)
- **Firefox**: 75+ (Full support)
- **Safari**: 13+ (Full support)
- **Edge**: 80+ (Full support)

### Required Features
- **Blob API**: For file generation
- **File API**: For file download
- **ES6 Modules**: For dynamic imports
- **Canvas API**: For PDF generation

## Security Considerations

### Client-Side Security
- **No Server Processing**: Data never leaves the browser
- **Local Generation**: Files created locally
- **No Network Transfer**: No upload/download of sensitive data
- **User Control**: Users control their own data

### Best Practices
1. **Validate Data**: Ensure data is safe for export
2. **Sanitize Filenames**: Prevent malicious filenames
3. **Limit File Size**: Prevent memory issues
4. **User Permissions**: Check export permissions

## Troubleshooting

### Common Issues

**Export Fails Silently**
- Check browser console for errors
- Verify data structure matches column definitions
- Ensure all required libraries are loaded

**Large Files Don't Download**
- Check browser memory limits
- Try smaller datasets
- Verify browser supports Blob API

**Progress Not Showing**
- Ensure `showProgress` prop is enabled
- Check for CSS conflicts
- Verify overlay positioning

**Column Selection Issues**
- Verify column keys match data properties
- Check column type definitions
- Ensure data is reactive

### Debug Mode
Enable debug logging in development:
```typescript
// In useExport composable
const debug = process.env.NODE_ENV === 'development'
if (debug) {
  console.log('Export data:', data)
  console.log('Export options:', options)
}
```

## Migration from Server-Side

If you previously used server-side export:

1. **Remove Server Dependencies**
   ```bash
   npm uninstall puppeteer exceljs
   ```

2. **Update Export Calls**
   ```typescript
   // Old (server-side)
   await exportData(data, columns, options, true)
   
   // New (client-side)
   await exportData(data, columns, options)
   ```

3. **Update Component Props**
   ```vue
   <!-- Remove server-side prop -->
   <ExportButton
     :data="data"
     :columns="columns"
     <!-- Remove :server-side="true" -->
   />
   ```

## Future Enhancements

### Planned Features
- **CSV Export**: Add CSV format support
- **Template System**: Predefined export templates
- **Batch Export**: Export multiple formats simultaneously
- **Cloud Storage**: Direct upload to cloud storage
- **Advanced Formatting**: More styling options

### Performance Improvements
- **Web Workers**: Background processing for large files
- **Streaming**: Progressive file generation
- **Caching**: Cache generated files
- **Compression**: Optimize file sizes

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify data structure and column definitions
4. Test with smaller datasets first

The export system is designed to be robust and user-friendly while maintaining high performance through client-side processing. 