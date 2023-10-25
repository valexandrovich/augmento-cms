<script setup>

import {computed, onMounted, reactive} from "vue";
import {useRoute} from "vue-router";
import {getProducts, getProjects} from "@/services/backend.api";
import StatusLabelComponent from "@/components/StatusLabelComponent.vue";
import router from "@/router";

const route = useRoute();


const state = reactive({
  project: null,
  products: []
})

onMounted(async () => {

  if (!isNewProject.value) {
    state.products = await getProducts(route.params.id)
    await getProjects()
        .then(projects => {
          const matchedProject = projects.filter(p => p._id === route.params.id)
          state.project = matchedProject.length > 0 ? matchedProject[0] : null;
        })

  }


})

const isNewProject = computed(() => {
  return route.params.id === undefined
})

</script>

<template>
  <div v-if="!isNewProject" class="flex flex-col p-12">
    <div v-if="state.project" class="flex flex-row justify-between mb-4 items-center">
      <span class="text-xl font-semibold">{{ state.project.title }} > Products</span>
      <button class="text-sm" @click="router.push('/product')">Add product</button>
    </div>
    <div class="flex">
      <table class="flex-1">
        <thead class="text-left">
        <th class="pb-4">Product name</th>
        <th class="pb-4">Status</th>
        <th class="pb-4">Action</th>
        </thead>
        <tbody>
        <tr v-for="(product, index) in state.products" :key="product._id" class="bg-white  border-4 border-gray-100">
          <td class="flex flex-row   items-center gap-5   border-r-2 py-2">
            <div class="w-5 flex flex-col ">
              <span class="text-right ">{{ index + 1 }}</span>
            </div>
            <img class="h-20 rounded-lg" :src="product.previewUrl" alt="">
            <div class="flex flex-col">
              <span class="font-light">{{ product.title }}</span>
              <a href="" class="font-semibold text-sm">View product</a>
            </div>
          </td>
          <td class=" border-r-2 ">
            <div class="flex  justify-center">
              <StatusLabelComponent :status="product.status"/>
            </div>

          </td>
          <td>
            <div class="flex flex-row justify-center gap-2">
              <button>Edit product</button>
              <button>Request 3D service</button>
              <button>Upload</button>
            </div>

          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>


  <div v-else class="flex flex-col p-12">
    New project
  </div>
</template>

<style scoped>

</style>