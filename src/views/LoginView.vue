<script setup>

import {useAuthStore} from "@/stores/auth";
import {useRouter, useRoute} from 'vue-router';
import {onMounted, ref} from "vue";




import {
  GoogleSignInButton,

} from "vue3-google-signin";

const signInError = ref(false)


const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const email = ref('beloenko23@gmail.com');
// const email = ref('');
const password = ref('Javascript!233');
// const password = ref('');

const signIn = async () => {

  // await auth.login({email: email.value, password: password.value})
  //     .then(resp => console.log(resp))


  signInError.value = false
  try {
    await auth.login({email: email.value, password: password.value});
    if (route.query.redirect) {
      router.push(route.query.redirect);
    } else {
      router.push('/');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    signInError.value = true
  }
};


</script>

<template>
<!--  <GoogleSignInButton-->
<!--      text="signup_with"-->
<!--      @success="handleLoginSuccess"-->
<!--      @error="handleLoginError"-->
<!--  >-->
<!--  </GoogleSignInButton>-->
  <div class="flex flex-col md:flex-row-reverse md:pt-32 mb-8">
    <div class="flex-1 flex justify-start">
      <img src="@/assets/img/login-banner.png" alt="" class="hidden md:block object-cover rounded-3xl">
      <img src="@/assets/img/login-banner-mob.png" alt="" class="block md:hidden w-full mb-4">
    </div>
    <div class="flex-1  items-end flex flex-col  md:pr-6">
      <div class=" w-full md:w-[512px] flex flex-col">
        <span class="font-bold text-xl text-center mb-4">Sign in to AUGMENTO</span>


        <div class="flex flex-col bg-white p-8  rounded-md md:w-[512px] shadow-xl">
          <span class="font-semibold text-gray-800 mb-2">Email</span>
          <input type="text" v-model="email">
          <span class="font-semibold text-gray-800 mb-2 mt-4">Password</span>
          <input type="password" v-model="password">
          <button class="bg-blue-500 text-white hover:bg-blue-400 py-4 rounded-lg mt-6" @click="signIn">Sign In</button>
          <button
              class="bg-white flex flex-row justify-center py-4 mt-4 rounded-lg hover:bg-gray-200  shadow-xl outline outline-2 outline-gray-300 mx-12 md:mx-0">
            <img src="../assets/img/google-logo.png" class="h-[22px] mr-2.5" alt="">
            <span style="color: #757575; font-family: 'Roboto'; font-weight: 500">
              Sign in with Google
              </span>
          </button>
          <span class=" text-md text-center mt-6 ">Don't have an account? <a @click="router.push('/sign-up')" class="text-blue-600 hover:underline cursor-pointer">Sign up</a> </span>
          <span class="text-red-600 text-lg text-center pt-4" v-if="signInError">Error on sign in! Try another credentials.</span>
        </div>


      </div>
    </div>
  </div>
</template>

<style scoped>

</style>