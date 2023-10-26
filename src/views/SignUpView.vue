<script setup>

import {ref} from "vue";

const apiBaseURL = import.meta.env.VITE_API_BASE_URL;
import axios from "@/utils/axios.config";

const companyName = ref('')
const email = ref('')
const password = ref('')
const passwordRepeat = ref('')

const signUpError = ref(false)
const signUpSuccess = ref(false)
const isSigningIn = ref(false)

const signUp = () => {

  signUpError.value = false
  signUpSuccess.value = false
  isSigningIn.value = true


  const data = {
    email: email.value,
    companyName: companyName.value,
    password: password.value
  }

  console.log(data)

  axios.post(apiBaseURL + '/auth/register', data)
      .then(resp => {
        console.log(resp)
        signUpSuccess.value = true
        isSigningIn.value = false
      })
      .catch(err => {
        console.log(err)
        signUpError.value = true
        isSigningIn.value = false


      })

}

</script>

<template>
  <div class="flex flex-col md:flex-row-reverse md:pt-32 mb-8">
    <div class="flex-1 flex justify-start">
      <img src="@/assets/img/login-banner.png" alt="" class="hidden md:block object-cover rounded-3xl">
      <img src="@/assets/img/login-banner-mob.png" alt="" class="block md:hidden w-full mb-4">
    </div>
    <div class="flex-1  items-end flex flex-col  md:pr-6  pl-4">
      <div class=" w-full md:w-[512px] flex flex-col">
        <span class="font-bold text-xl text-center">Create an account to get started</span>
        <span class=" text-md text-center py-2">Already created an account? <a href="/login" class="text-blue-600">Sign in</a> </span>
        <button
            class="bg-white flex flex-row justify-center py-4 mt-4 rounded-lg hover:bg-gray-200  shadow-xl  mx-12 md:mx-0">
          <img src="../assets/img/google-logo.png" class="h-[22px] mr-2.5" alt="">
          <span style="color: #757575; font-family: 'Roboto'; font-weight: 500">
              Sign in with Google
              </span>
        </button>
        <span class="font-light py-8 text-center">Or sign-up with manually</span>
        <div class="flex flex-col bg-white p-8  rounded-md md:w-[512px] shadow-xl">
          <span class="font-semibold text-gray-800 mb-2">Company name</span>
          <input type="text" v-model="companyName">
          <span class="font-semibold text-gray-800 mb-2">Email</span>
          <input type="text" v-model="email">
          <span class="font-semibold text-gray-800 mb-2">Password</span>
          <input type="password" v-model="password">
          <span class="font-semibold text-gray-800 mb-2">Password again</span>
          <input type="password" v-model="passwordRepeat">
          <button class="bg-blue-500 text-white hover:bg-blue-400 py-4 rounded-lg mt-6 relative" @click="signUp">

            <span :class="isSigningIn ? 'opacity-0' : ''">Sign-up</span>

            <svg v-if="isSigningIn" class="absolute top-1/2 left-1/2 -mt-2 -ml-2 w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>

          </button>


            <!-- Your button text or content here -->

            <!-- Spinning circle SVG/icon -->




          <span class="text-red-600 text-lg text-center pt-4" v-if="signUpError">Error on sign up! Try another credentials.</span>
          <span class="text-green-600 text-lg text-center pt-4" v-if="signUpSuccess">Account successfully created! <a
              href="/login" class="text-blue-600 underline">Click to sign in</a></span>
        </div>


      </div>
    </div>
  </div>
</template>

<style scoped>

</style>