<script setup>

import {reactive, ref} from "vue";

const artworkInputRef = ref(null);

import * as THREE from "three";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter";
import {loadTexture} from "@/utils/3d-loaders";


const state = reactive({
  artworkFile: null,
  artworkFileUrl: null,
  artworkFileCompressed: null,
  artworkFileCompressedUrl: null,
  modelUrl: null,

  startTime: '',
  endTime: '',
  elapsedTime: ''
})

const selectArtworkFile = () => {
  artworkInputRef.value?.click();
}

const onChangeInputImage = async (event) => {
  const startTime = performance.now();
  state.modelUrl = null;

  if (event.target.files && event.target.files[0]) {
    state.artworkFile = event.target.files[0];
    state.artworkFileUrl = URL.createObjectURL(state.artworkFile);
    state.artworkFileCompressed = await compressImage(state.artworkFile)
    state.artworkFileCompressedUrl = URL.createObjectURL(state.artworkFileCompressed)


    // const texture = await loadTexture(state.artworkFileCompressedUrl);
    const texture = await loadTexture(state.artworkFileUrl);
    const geometry = new THREE.BoxGeometry(
        3,
        2,
        0.01
    );
    const material = new THREE.MeshBasicMaterial({map: texture});
    const cube = new THREE.Mesh(geometry, material);

    const exporter = new GLTFExporter();
    exporter.parse(cube, function (gltf) {
      console.log(gltf);


      const gltfUrl = URL.createObjectURL(
          new Blob([JSON.stringify(gltf)], {type: "model/gltf+json"})
      );
      state.modelUrl = gltfUrl
      // You can save this JSON as a .gltf file
      // or convert it to a Blob and save it as a .glb file
    });


    // console.log(state.artworkFile)
    // console.log(state.artworkFileCompressed)

    const endTime = performance.now();
    const timeDifference = endTime - startTime;
    alert(timeDifference)

  }
}

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          reject(new Error("Compression failed."));
        }
      }, 'image/jpeg', 0.1); // Adjust the quality (0.75) as needed
    };
    img.onerror = reject;
  });
};


</script>

<template>
  <div>
    <div class="flex flex-row gap-10" style="width: 500px; height: 400px">
      <img v-if="state.artworkFileUrl" :src="state.artworkFileUrl" alt="">
      <img v-if="state.artworkFileCompressedUrl" :src="state.artworkFileCompressedUrl" alt="">
    </div>

    <div v-if="state.modelUrl" class="bg-amber-300" style="height: 200px; width: 400px">
      <model-viewer :src="state.modelUrl"
                    ar
                    camera-controls
      >

      </model-viewer>
    </div>

    <input ref="artworkInputRef" type="file" accept="image/*" @change="onChangeInputImage" class="hidden">
    <button @click="selectArtworkFile">Select artwork</button>

    <div>
      {{ state }}
    </div>

  </div>
</template>

<style scoped>

</style>