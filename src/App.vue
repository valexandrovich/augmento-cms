<script setup>
import {RouterLink, RouterView} from 'vue-router'
import HeaderComponent from "@/components/HeaderComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";
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
