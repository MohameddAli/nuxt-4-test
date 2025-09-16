//// filepath: c:\projects\nuxt\nuxt4\app\components\ReusableTable.vue //
...existing code...
<template>
  <v-card class="app-data-table-card" elevation="2">
    <!-- Title + Actions -->
    <v-card-title class="d-flex align-center justify-space-between pa-6">
      <div class="d-flex align-center">
        <slot name="title">
          <span v-if="title" class="text-h6 font-weight-bold">{{ title }}</span>
        </slot>
      </div>
      <div class="d-flex align-center">
        <slot name="actions">
          <v-btn
            v-if="actionLabel"
            variant="text"
            size="small"
            color="primary"
            @click="$emit('action:click')"
          >
            {{ actionLabel }}
          </v-btn>
        </slot>
      </div>
    </v-card-title>

    <v-divider />

    <!-- Data Table -->
    <v-data-table
      class="app-data-table"
      :headers="columns"
      :items="items"
      :items-per-page="pageSize"
      :page="page"
      :density="dense ? 'compact' : 'default'"
      hide-default-footer
      @click:row="(row) => $emit('row:click', row)"
    >
      <!-- Custom cell slots -->
      <template v-for="col in columns" #[`item.${col.key}`]="{ item }">
        <slot :name="`cell-${col.key}`" :item="item" :value="item[col.key]">
          <span class="text-body-2">{{ item[col.key] }}</span>
        </slot>
      </template>
    </v-data-table>

    <!-- الباجينيشن -->
    <div v-if="showPagination" class="table-pagination pa-4">
      <AppPagination
        :page="page"
        :page-size="pageSize"
        :total-items="totalItems"
        v-bind="paginationOptions"
        @update:page="$emit('update:page', $event)"
        @update:page-size="$emit('update:pageSize', $event)"
        @change="$emit('change', $event)"
      />
    </div>
  </v-card>
</template>

<script setup>
import AppPagination from "~/components/pagination/AppPagination.vue";

const props = defineProps({
  title: String,
  items: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  dense: { type: Boolean, default: false },
  actionLabel: { type: String, default: "" },

  // Pagination essentials
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  totalItems: { type: Number, default: 0 },
  showPagination: { type: Boolean, default: true },
  paginationOptions: {
    type: Object,
    default: () => ({
      length: undefined,
      totalVisible: 5,
      pageSizes: [5, 10, 20, 50, 100],
      showPageSize: true,
      showRange: true,
      showFirstLast: true,
      size: "small",
      variant: "outlined",
      disabled: false,
      align: "center",
    }),
  },
});

defineEmits([
  "update:page",
  "update:pageSize",
  "change",
  "row:click",
  "action:click",
]);
</script>

<style scoped>
.app-data-table-card {
  border-radius: 16px;
  border: 1px solid rgba(var(--v-border-color), 0.08);
}

/* Table headers */
:deep(.v-data-table thead th) {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  font-weight: 600;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}

/* Table rows */
:deep(.v-data-table tbody tr) {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.06);
  transition: background-color 0.2s ease;
}

/* الهوفر الأصفر باستخدام متغيرك المخصص مع fallback */
:deep(.v-data-table tbody tr:hover) {
  background-color: var(
    --yellow-hover,
    rgba(var(--yellow-primary-dark), 0.1)
  ) !important;
}

:deep(.v-data-table tbody tr:last-child) {
  border-bottom: none;
}

/* Pagination */
.table-pagination {
  border-top: 1px solid rgba(var(--v-border-color), 0.06);
}
</style>
