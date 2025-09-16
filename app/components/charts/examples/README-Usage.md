# استخدام المخطط المطابق للصورة | Using the Exact Chart Component

## 🎯 **المكون المطابق للصورة | Exact Image Match Component**

المكون `CryptoAnalyticsExact.vue` هو نسخة مطابقة تماماً للصورة المرفقة من المستخدم.

### ✅ **تم إصلاح المشكلة! | Issue Fixed!**

المكون الآن يعمل بشكل صحيح في الصفحة الرئيسية مع:
- أزرار الفترة الزمنية (Weekly, Monthly, Yearly)
- نطاق التاريخ (06/11/2024 - 06/22/2024)
- زر التحميل
- المؤشرات الملونة
- المخطط التفاعلي

## 📊 **كيفية الاستخدام | How to Use**

### الاستخدام الأساسي | Basic Usage

```vue
<template>
  <div>
    <CryptoAnalyticsExact
      :height="350"
      :loading="false"
      @download="handleDownload"
      @period-change="handlePeriodChange"
    />
  </div>
</template>

<script setup>
const handleDownload = (period) => {
  console.log('Downloading for period:', period)
  // منطق التحميل هنا
}

const handlePeriodChange = (period) => {
  console.log('Period changed to:', period)
  // منطق تغيير الفترة هنا
}
</script>
```

### في الصفحة الرئيسية | In Home Page

تم بالفعل دمج المكون في الصفحة الرئيسية `app/pages/index.vue`:

```vue
<template>
  <div>
    <!-- المخطط المطابق للصورة -->
    <CryptoAnalyticsExact
      :height="350"
      :loading="cryptoLoading"
      @download="handleCryptoDownload"
      @period-change="handleCryptoPeriodChange"
    />
  </div>
</template>

<script setup>
const cryptoLoading = ref(false)

const handleCryptoDownload = (period) => {
  console.log('Downloading crypto chart for period:', period)
}

const handleCryptoPeriodChange = (period) => {
  console.log('Crypto period changed to:', period)
  cryptoLoading.value = true
  
  setTimeout(() => {
    cryptoLoading.value = false
  }, 1500)
}
</script>
```

## 🎨 **الميزات | Features**

✅ **مطابق تماماً للصورة** - Exact match to the provided image  
✅ **أزرار الفترة الزمنية** - Period selection buttons (Weekly, Monthly, Yearly)  
✅ **نطاق التاريخ** - Date range display  
✅ **زر التحميل** - Download button  
✅ **المؤشرات الملونة** - Colored legend (Personal Wallet, Corporate Wallet, Investment Wallet)  
✅ **مخطط أعمدة مكدسة** - Stacked bar chart  
✅ **الألوان الدقيقة** - Exact color matching  
✅ **الأحداث التفاعلية** - Interactive events  

## 🎛️ **الخصائص | Properties**

| الخاصية | Property | النوع | Type | الافتراضي | Default | الوصف | Description |
|---------|----------|-------|------|----------|---------|--------|-------------|
| `height` | `height` | `number` | `number` | `300` | `300` | ارتفاع المخطط | Chart height |
| `loading` | `loading` | `boolean` | `boolean` | `false` | `false` | حالة التحميل | Loading state |

## 📡 **الأحداث | Events**

| الحدث | Event | المعطيات | Parameters | الوصف | Description |
|-------|-------|----------|------------|--------|-------------|
| `download` | `download` | `(period: string)` | `(period: string)` | عند الضغط على زر التحميل | When download button is clicked |
| `period-change` | `period-change` | `(period: string)` | `(period: string)` | عند تغيير الفترة الزمنية | When period is changed |

## 🎯 **أمثلة الاستخدام | Usage Examples**

### 1. في صفحة لوحة التحكم | Dashboard Page

```vue
<template>
  <v-container>
    <v-row>
      <v-col cols="12" lg="8">
        <CryptoAnalyticsExact
          :height="400"
          :loading="isLoading"
          @download="exportChart"
          @period-change="updatePeriod"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const isLoading = ref(false)

const exportChart = (period) => {
  // تصدير المخطط
}

const updatePeriod = (period) => {
  // تحديث البيانات حسب الفترة
}
</script>
```

### 2. في صفحة التحليلات | Analytics Page

```vue
<template>
  <div class="analytics-page">
    <h1>تحليلات العملات الرقمية</h1>
    
    <CryptoAnalyticsExact
      :height="500"
      @download="handleExport"
      @period-change="fetchData"
    />
  </div>
</template>

<script setup>
const handleExport = async (period) => {
  try {
    // منطق التصدير
    await exportData(period)
  } catch (error) {
    console.error('Export failed:', error)
  }
}

const fetchData = async (period) => {
  try {
    // جلب البيانات الجديدة
    const data = await fetchChartData(period)
    // تحديث المخطط
  } catch (error) {
    console.error('Data fetch failed:', error)
  }
}
</script>
```

### 3. مع بيانات ديناميكية | With Dynamic Data

```vue
<template>
  <CryptoAnalyticsExact
    :height="350"
    :loading="dataLoading"
    @download="exportChart"
    @period-change="loadPeriodData"
  />
</template>

<script setup>
import { useChartData } from '~/composables/useChartData'

const { chartData, loading: dataLoading, fetchData } = useChartData('/api/crypto')

const exportChart = (period) => {
  // تصدير البيانات
  console.log('Exporting data for:', period)
}

const loadPeriodData = (period) => {
  // تحميل بيانات جديدة
  fetchData({ period })
}

// تحميل البيانات الأولية
onMounted(() => {
  fetchData({ period: 'monthly' })
})
</script>
```

## 🚀 **النصائح | Tips**

1. **الاستجابة** - المكون مصمم ليكون متجاوباً تلقائياً
2. **التحميل** - استخدم خاصية `loading` لإظهار حالة التحميل
3. **الأحداث** - استمع للأحداث لتحديث البيانات أو التصدير
4. **الارتفاع** - يمكن تخصيص ارتفاع المخطط حسب الحاجة

## 🎨 **التخصيص | Customization**

إذا كنت تريد تخصيص المخطط:

1. **نسخ المكون** - انسخ `CryptoAnalyticsExact.vue` وأنشئ نسخة مخصصة
2. **تعديل البيانات** - عدل في `chartData` لتغيير البيانات
3. **تعديل الألوان** - عدل في `colors` لتغيير الألوان
4. **إضافة ميزات** - أضف المزيد من الخصائص والأحداث

---

**✨ هذا المكون مطابق تماماً للصورة المرفقة ويمكن استخدامه في أي مكان في التطبيق!**

**✨ This component is an exact match to the provided image and can be used anywhere in the application!**
