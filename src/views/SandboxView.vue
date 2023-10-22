<script setup>

import scene from "three/addons/offscreen/scene";

const gltfUrl = ref(null);

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter";
// import * as THREE from 'three'
import {ref} from "vue";

let parallelepiped, cubeForCorners, cubeForEdges;

const loadModel = (path) => {
  return new Promise((resolve, reject) => {
    // const loader = new GLTFLoader();
    const loader =  new GLTFLoader();

    loader.load(path, (gltf) => {
      resolve(gltf.scene);
      const model = gltf.scene;
      const boundingBox = new THREE.Box3().setFromObject(model);
      const offset = boundingBox.min;

      // boundingBox.getCorner(new THREE.Vector3(0, 0, 0), offset);
      model.position.sub(offset);
      resolve(model)
      // scene.add(model)
      resolve(gltf.scene);
    }, undefined, (error) => {
      reject(error);
    });
  });
};

const loadTexture = async (path) => {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(
        path,
        (texture) => {
          resolve(texture); // Resolve the promise with the loaded texture
        },
        undefined, // Optional: You can define a progress function here
        (error) => {
          reject(error); // Reject the promise with the error
        }
    );
  });
}


const loadModels = async () => {
  try {
    [parallelepiped, cubeForCorners, cubeForEdges] = await Promise.all([
      loadModel('/artwork.glb'),
      loadModel('/purple_cube.glb'),
      loadModel('/blue_cube.glb')
    ]);


  } catch (error) {
    console.error('Error loading models:', error);
  }
}

const loadImage = async (imageData) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageData;
    img.onload = () => {
      resolve(img)
    };
    img.onerror = reject;

  });
}

import artwork from '@/assets/img/frames/black.jpg'
const tst = async () => {

  await loadModels()

  const texture =  await loadTexture('/artwork.JPG')


  const geometry1 = new THREE.BoxGeometry(
      10,
      10,
      0.01
  );

  const corner_t_l = new THREE.BoxGeometry(
      1,
      1,
      0.1
  );

  const corner_t_r = new THREE.BoxGeometry(
      1,
      1,
      0.1
  );

  const corner_b_l = new THREE.BoxGeometry(
      1,
      1,
      0.1
  );

  const corner_b_r = new THREE.BoxGeometry(
      1,
      1,
      0.1
  );



  const material = new THREE.MeshPhysicalMaterial({
    envMapIntensity: 0.4,
    metalness: 0.3,
    map: texture,
    clearcoatRoughness: 0,
    clearcoat: 1,
  });

  const mesh1= new THREE.Mesh(geometry1, material);
  const mesh2 = new THREE.Mesh(corner_t_l, material);
  const mesh3 = new THREE.Mesh(corner_t_r, material);
  const mesh4 = new THREE.Mesh(corner_b_l, material);
  const mesh5 = new THREE.Mesh(corner_b_r, material);


  mesh2.position.set(-5, 5, 0)
  mesh3.position.set(5, 5, 0)
  mesh4.position.set(-5, -5, 0)
  mesh5.position.set(5, -5, 0)

  const sc = new THREE.Scene()
  sc.add(mesh1)
  sc.add(mesh2)
  sc.add(mesh3)
  sc.add(mesh4)
  sc.add(mesh5)

//
//   const scene = new THREE.Scene();
//   const paintingWidth = 4;  // Replace with your painting's width
//   const paintingHeight = 6; // Replace with your painting's height
//   // const painting = new THREE.Mesh(
//   //     new THREE.PlaneGeometry(paintingWidth, paintingHeight),
//   //     new THREE.MeshBasicMaterial({ color: 0xFFFFFF }) // Replace with your painting's material or texture
//   // );
//
//
// cubeForEdges.position.set(0, 0, 0)
//   cubeForEdges.position.set(0, 0, 0)
//   parallelepiped.position.set(0, 0, 0)
//
//   // scene.add(parallelepiped);
//   scene.add(cubeForEdges);
//   scene.add(cubeForCorners);
//   scene.add(parallelepiped);



  // parallelepiped.position.set(0, 0, 0);
  // cubeForCorners.position.set(0, 0, 0)
  //
  // const scene = new THREE.Scene();
  // scene.add(parallelepiped);
  // scene.add(cubeForCorners);
  // // scene.add(cubeForEdges);
  //
  //
  const gltfExporter = new GLTFExporter();
    gltfExporter.parse(
        sc,
        (gltf) => {
          const tmpGltfUrl = URL.createObjectURL(
              new Blob([JSON.stringify(gltf)], {type: "model/gltf+json"})
          );

          console.log(gltfUrl)
          // gltfToBlob(gltfUrl);
          gltfUrl.value = tmpGltfUrl
        },
        {binary: true}
    );






//   const scene = new THREE.Scene();
//   const renderer = new THREE.WebGLRenderer();
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   document.body.appendChild(renderer.domElement);
//
//
//
//
//
// // Load parallelepiped
//
//
//     const gltfExporter = new GLTFExporter();
//     gltfExporter.parse(
//         scene,
//         (gltf) => {
//           const tmpGltfUrl = URL.createObjectURL(
//               new Blob([JSON.stringify(gltf)], {type: "model/gltf+json"})
//           );
//
//           console.log(gltfUrl)
//           // gltfToBlob(gltfUrl);
//           gltfUrl.value = tmpGltfUrl
//         },
//         {binary: true}
//     );
//
//
//   })



}

  // const scene = new THREE.Scene();
  // const loader = new THREE.GLTFLoader();
  //
  //
  //
  // const artX = 70;
  // const artY = 100;
  // const artZ = 20;
  //
  // const geometry = new THREE.BoxGeometry(
  //     artX / 100,
  //     artY / 100,
  //      artZ / 100
  // );
  // const material = new THREE.MeshPhysicalMaterial({
  //   envMapIntensity: 0.4,
  //   metalness: 0.3,
  //   clearcoatRoughness:  0 ,
  //   clearcoat: 1
  // });
  //
  // const mesh = new THREE.Mesh(geometry, material);
  //
  // const gltfExporter = new GLTFExporter();
  // gltfExporter.parse(
  //     mesh,
  //     (gltf) => {
  //       const tmpGltfUrl = URL.createObjectURL(
  //           new Blob([JSON.stringify(gltf)], {type: "model/gltf+json"})
  //       );
  //
  //       console.log(gltfUrl)
  //       // gltfToBlob(gltfUrl);
  //       gltfUrl.value = tmpGltfUrl
  //     },
  //     {binary: true}
  // );




// const gltfToBlob = (model) => {
//   fetch(model)
//       .then((response) => response.arrayBuffer())
//       .then((buffer) => {
//         const blobModel = new Blob([buffer], {type: "model/gltf-binary"});
//       })
//       .catch((error) => console.error(error));
// }


</script>

<template>
  <div class="bg-gray-900">
    <div>Sandbox</div>

    <button @click="tst" class="bg-amber-300 p-5 text-black font-semibold">TST</button>

    <model-viewer
        v-if="gltfUrl"
        :src="gltfUrl"
        ar
        style="width: 1000px; height: 700px"
        shadow-intensity="3"
        shadow-softness="1"
        camera-controls
        auto-rotate
        autoplay
    >

      <button slot="ar-button" class="bg-blue-600 text-white absolute bottom-0 right-0">Show in AR</button>

    </model-viewer>


    <button @click="tst">TST</button>
  </div>

</template>

<style scoped>

</style>