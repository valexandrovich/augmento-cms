<script setup>

import scene from "three/addons/offscreen/scene";

const gltfUrl = ref(null);

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter";
// import * as THREE from 'three'
import {ref} from "vue";

let parallelepiped, cubeForCorners, cubeForEdges;
// import artwork from '@/assets/artwork.jpg'
import corner from '@/assets/corner.jpg'
import edge from '@/assets/edge.jpg'
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

// const loadTexture = async (path) => {
//   return new Promise((resolve, reject) => {
//     const textureLoader = new THREE.TextureLoader();
//     loader.load(
//         path,
//         (texture) => {
//           resolve(texture);
//
//           // resolve(fbx); // Resolve the promise with the loaded texture
//         },
//         undefined, // Optional: You can define a progress function here
//         (error) => {
//           reject(error); // Reject the promise with the error
//         })
//         })
// }

const loadFbx = async (path) => {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();
    loader.load(
        path,
        (fbx) => {

          // const box = new THREE.Box3().setFromObject(fbx);
          //
          // // Compute the center of the bounding box
          // const center = new THREE.Vector3();
          // box.getCenter(center);
          //
          // // Offset the object's position by the negative value of the bounding box's center
          // // This moves the center of the bounding box to the origin
          // fbx.position.sub(center);
          // const box = new THREE.Box3().setFromObject(fbx);

          // Offset the object's position by the negative value of the bounding box's minimum values
          // This moves the minimum corner of the bounding box to the origin
          // fbx.position.sub(box.min);
          resolve(fbx);

          // resolve(fbx); // Resolve the promise with the loaded texture
        },
        undefined, // Optional: You can define a progress function here
        (error) => {
          reject(error); // Reject the promise with the error
        }
    );
  });


  //
  // loader.load('path', (fbx) => {
  //   // Add the model to the scene
  //   scene.add(fbx);
  //
  //   // Optionally scale, position or rotate the model here
  //   // fbx.scale.set(0.1, 0.1, 0.1);
  // }, undefined, (error) => {
  //   console.error(error);
  // });


}





const tst = async () => {


  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

// Instantiate the loader

  // const frameEdgeFbx = await loadFbx('/frames/Mesh/Aluminium_S_3cm.fbx')
  // const frameEdgeFbx = await loadFbx('/frames/Mesh/Aluminium_S_3cm.fbx')

  const glassMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.4
  });


  const cornerFbx = await loadFbx('/frames/Mesh/corner.fbx')
  const edgeFbx = await loadFbx('/frames/Mesh/edge.fbx')

  const frameWidth = 10;  // Replace with your desired width
  const frameHeight = 5;


  const texture = await loadTexture('/frames/Textures/Wood_1_Specualr.png');
  // const texture = await loadTexture('/frames/Textures/Aluminium_specular.png');
  // const texture = await loadTexture('/frames/Textures/Wood_1_normal.png');
  const texturedMaterial = new THREE.MeshBasicMaterial({ map: texture });
  console.log('TMTMTM' + texturedMaterial)

  const topLeftCorner = cornerFbx.clone()
// topLeftCorner.material = texturedMaterial
//   topLeftCorner.traverse((child) => {
//     if (child.isMesh) {
//       console.log(child)
//       child.material = texturedMaterial;
//     }
//   });


  const boundingBox = new THREE.Box3().setFromObject(topLeftCorner);
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);
  topLeftCorner.position.sub(center);
  const boxGeometry = new THREE.BoxGeometry(size.x , size.y , size.z );
  const glassBox = new THREE.Mesh(boxGeometry, glassMaterial);
  // scene.add(glassBox);

  const frameGroup = new THREE.Group();
  frameGroup.add(topLeftCorner);
  // frameGroup.add(glassBox);
  frameGroup.position.set(0, 0, 0)

  scene.add(frameGroup);


  const topEdge = edgeFbx.clone()
  const boundingBox3 = new THREE.Box3().setFromObject(topEdge);
  const size3 = new THREE.Vector3();
  boundingBox3.getSize(size3);
  const center3 = new THREE.Vector3();
  boundingBox3.getCenter(center3);
  topEdge.position.sub(center3);
  const boxGeometry3 = new THREE.BoxGeometry(size3.x, size3.y, size3.z);
  const glassBox3 = new THREE.Mesh(boxGeometry3, glassMaterial);
  const frameGroup3 = new THREE.Group();
  // frameGroup3.add(topEdge);
  frameGroup3.add(glassBox3);
  console.log(size)
  frameGroup3.position.set(0 , 0, 0)
  // scene.add(frameGroup3);




  const topRightCorner = cornerFbx.clone()
  topRightCorner.rotation.z = 1.5 * Math.PI
  const boundingBox2 = new THREE.Box3().setFromObject(topRightCorner);
  const size2 = new THREE.Vector3();
  boundingBox2.getSize(size2);
  const center2 = new THREE.Vector3();
  boundingBox2.getCenter(center2);
  topRightCorner.position.sub(center2);
  const padding2 = 0; // This can be adjusted as needed
  const boxGeometry2 = new THREE.BoxGeometry(size.x + padding2, size.y + padding2, size.z + padding2);
  const glassBox2 = new THREE.Mesh(boxGeometry2, glassMaterial);
  // scene.add(glassBox);

  const frameGroup2 = new THREE.Group();
  frameGroup2.add(topRightCorner);
  frameGroup2.add(glassBox2);
frameGroup2.position.set(size.x, 0, 0)

  // scene.add(frameGroup2);


  // const combinedGroup = new THREE.Group();
  // combinedGroup.add(topLeftCorner);
  // combinedGroup.add(glassBox);

  // topLeftCorner.rotation.z = 1.5 * Math.PI
  // topLeftCorner.position.sub(center);


  //
  const box = new THREE.BoxGeometry(
      1,
      1,
      1
  );
  const material = new THREE.MeshPhysicalMaterial({
    envMapIntensity: 0.4,
    color: 0xff0000,
    metalness: 0.3,
    clearcoatRoughness: 1,
    clearcoat: 0,
  });

  const boxMesh = new THREE.Mesh(box, material);
  // const boxMesh = new THREE.Mesh(box, texturedMaterial);
  boxMesh.position.set(0, 0, 0)
  scene.add(boxMesh)
  //
  // const corner = cornerFbx.clone()
  // // corner.position.set(4, -8, 0)
  // scene.add(corner)

  // const corner2 = cornerFbx.clone()
  // corner2.rotation.z = 1.5 * Math.PI
  // corner2.position.set(68, 4, 0)
  // scene.add(corner2)

  // const corner2 = cornerFbx.clone()
  // cornerFbx
  // cornerFbx.position.set(0, 0, 0)
  // scene.add(corner)

  // const edge = edgeFbx.clone()
  // edge.scale.x = 2
  // edge.position.set(0, 0, 0)
  // scene.add(edge)

  // const leftTopEdge =  frameEdgeFbx.clone();
  // scene.add(leftTopEdge);
  //
  //
  // const rightTopEdge =  frameEdgeFbx.clone();
  // // rightTopEdge.rotation.y = Math.PI
  // rightTopEdge.scale.x = -1;
  // rightTopEdge.position.set(60, 0, 0)
  // scene.add(rightTopEdge);
  //
  // const topLeftEdge =  frameEdgeFbx.clone();
  // topLeftEdge.rotation.z = 1.5 * Math.PI
  // // topLeftEdge.scale.x = -1;
  // topLeftEdge.position.set(56, 4, 0)
  // scene.add(topLeftEdge);

  // const topEdge = frameEdgeFbx.clone();
  // topEdge.position.set(0, 0, 0);
  // // topEdge.rotation.z = Math.PI / 2
  // // topEdge.scale.set(1, 1, 1);  // Stretch the top edge to the desired width
  // scene.add(topEdge);
  //
  // // Clone and position the bottom edge
  // const rightEdge = frameEdgeFbx.clone();
  // rightEdge.position.set(-2.5, 34, 0)
  // rightEdge.rotation.z = 1.5 * Math.PI
  // // bottomEdge.scale.set(1, 1, 1);  // Stretch the bottom edge to the desired width
  // scene.add(rightEdge);
//
// // Clone and position the left edge
//   const leftEdge = frameEdgeFbx.clone();
//   leftEdge.position.set(-frameWidth / 2, 0, 0);
//   leftEdge.scale.set(1, frameHeight, 1);  // Stretch the left edge to the desired height
//   scene.add(leftEdge);
//
// // Clone and position the right edge
//   const rightEdge = frameEdgeFbx.clone();
//   rightEdge.position.set(frameWidth / 2, 0, 0);
//   rightEdge.scale.set(1, frameHeight, 1);  // Stretch the right edge to the desired height
//   scene.add(rightEdge);

  // frameEdgeFbx.position.set(1, 2, 3)

  // scene.add(frameEdgeFbx)
  // scene.add(frameEdgeFbx2)




  // await loadModels()
  //
  // const artworkTexture =  await loadTexture(corner)
  // const cornerTexture =  await loadTexture(corner)
  // const edgeTexture =  await loadTexture(edge)
  //
  //
  // const geometry1 = new THREE.BoxGeometry(
  //     10,
  //     10,
  //     0.1
  // );
  //
  // const corner_t_l = new THREE.BoxGeometry(
  //     1,
  //     1,
  //     0.1
  // );
  //
  //
  //
  // const corner_t_r = new THREE.BoxGeometry(
  //     1,
  //     1,
  //     0.1
  // );
  //
  // const corner_b_l = new THREE.BoxGeometry(
  //     1,
  //     1,
  //     0.1
  // );
  //
  // const corner_b_r = new THREE.BoxGeometry(
  //     1,
  //     1,
  //     0.1
  // );
  //
  //
  //
  // const materialCorner = new THREE.MeshPhysicalMaterial({
  //   envMapIntensity: 0.4,
  //   metalness: 0.3,
  //   map: cornerTexture,
  //   clearcoatRoughness: 0,
  //   clearcoat: 1,
  // });
  //
  //
  // const edge_t = new THREE.BoxGeometry(
  //     10, 1, 0.1
  // )
  //
  // edgeTexture.wrapS = THREE.RepeatWrapping;  // Enable horizontal wrapping
  // edgeTexture.wrapT = THREE.RepeatWrapping;  // Enable vertical wrapping
  // edgeTexture.repeat.set(10, 1);
  //
  // const materialEdge = new THREE.MeshPhysicalMaterial({
  //   envMapIntensity: 0.4,
  //   metalness: 0.3,
  //   map: edgeTexture,
  //   clearcoatRoughness: 0,
  //   clearcoat: 1,
  // });
  //
  // const mesh6 = new THREE.Mesh(edge_t, materialEdge);
  //
  // const mesh7 = new THREE.Mesh(edge_t, materialEdge);
  // const mesh8 = new THREE.Mesh(edge_t, materialEdge);
  // const mesh9 = new THREE.Mesh(edge_t, materialEdge);

  //
  // const materialArtwork = new THREE.MeshPhysicalMaterial({
  //   envMapIntensity: 0.4,
  //   metalness: 0.3,
  //   map: artworkTexture,
  //   clearcoatRoughness: 0,
  //   clearcoat: 1,
  // });
  //
  // const mesh1= new THREE.Mesh(geometry1, materialArtwork);
  // const mesh2 = new THREE.Mesh(corner_t_l, materialCorner);
  // const mesh3 = new THREE.Mesh(corner_t_r, materialCorner);
  // const mesh4 = new THREE.Mesh(corner_b_l, materialCorner);
  // const mesh5 = new THREE.Mesh(corner_b_r, materialCorner);
  //
  //
  //
  //
  // mesh3.rotation.z = 1.5 * Math.PI;
  // mesh4.rotation.z = Math.PI / 2;
  // mesh5.rotation.z = Math.PI;
  //
  // mesh7.rotation.z = Math.PI
  // mesh8.rotation.z = 1.5 * Math.PI
  // mesh9.rotation.z = Math.PI / 2
  //
  //
  //
  // mesh2.position.set(-5, 5, 0.02)
  // mesh3.position.set(5, 5, 0.02)
  // mesh4.position.set(-5, -5, 0.02)
  // mesh5.position.set(5, -5, 0.02)
  //
  // mesh6.position.set(0, 5, 0.01)
  // mesh7.position.set(0, -5, 0.01)
  // mesh8.position.set(5, 0, 0.01)
  // mesh9.position.set(-5, 0, 0.01)
  //
  // const sc = new THREE.Scene()
  // sc.add(mesh1)
  // sc.add(mesh2)
  // sc.add(mesh3)
  // sc.add(mesh4)
  // sc.add(mesh5)
  // sc.add(mesh6)
  // sc.add(mesh7)
  // sc.add(mesh8)
  // sc.add(mesh9)

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
        scene,
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