<script setup>
import {RouterLink, RouterView} from 'vue-router'
import HeaderComponent from "@/components/HeaderComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";
import {onMounted} from "vue";
import axios from "@/utils/axios.config";
import router from "@/router";

onMounted(() => {
  const jwtToken = localStorage.getItem('jwt')
  if (jwtToken){
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + jwtToken
  } else {
    router.push('/login')
  }


  //
})

</script>

<template>
  <div class="h-screen flex flex-col">
    <HeaderComponent/>
    <div class=" flex-grow" style="background-color: #F6F6F6">
      <RouterView/>
    </div>
    <FooterComponent/>
  </div>
</template>

<style scoped>

</style>
