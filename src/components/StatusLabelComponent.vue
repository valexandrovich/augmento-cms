<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true
  }
});
const statusClasses = {
  online: {
    'bg-green-100': true,
    'text-green-700': true,
  },
  '3dServiceRequested': {
    'bg-amber-100': true,
    'text-amber-700': true,
  },
  'inProgress': {
    'bg-blue-100': true,
    'text-blue-700': true,
  },
  'uploadFile': {
    'bg-gray-100': true,
    'text-gray-700': true,
  }

};
</script>

<template>
  <div>
  <span class="px-4 py-2 capitalize rounded-xl" :class="{...statusClasses[props.status]}">
  {{ props.status }}
    </span>
  </div>
</template>

<style scoped>

</style>