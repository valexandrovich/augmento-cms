<script setup>

import {useRoute} from "vue-router";
import {onMounted, reactive, ref, watch} from "vue";

import * as THREE from "three";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter";

import {loadFbx, loadGltf, loadTexture} from "@/utils/3d-loaders";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader";

const route = useRoute();

const isSaving = ref(false)


const fileInput = ref(null);

import {framesMesh} from "@/stores/frames";
import {framesTexture} from "@/stores/frames";
import {getProjects} from "@/services/backend.api";
import axios from "@/utils/axios.config";

const state = reactive({

  projects: [],

  productId: null,

  title: '',
  status: 'online',
  projectId: '',


  artworkFile: null,
  artworkFileUrl: null,
  artworkImage: null,

  artworkFileCompressed: null,
  artworkImageCompressed: null,
  artworkFileCompressedUrl: null,

  modelUrl: null,
  modelCompressedUrl: null,



  isGlass: true,
  placement: 'wall',
  frameThin: '10',
  frameDepth: '1',
  artWorkMaxSize: '100',

  selectedFrameMesh: null,
  selectedFrameTexture: null,

  artworkMeshXm: 0,
  artworkMeshYm: 0,
  artworkMeshZm: 0,

  artWorkMesh: null


})

onMounted(() => {
  state.selectedFrameMesh = framesMesh.value[0]
  state.selectedFrameTexture = framesTexture.value[0]

  getProjects().then(
      resp => {
        state.projects = resp
        state.projectId = state.projects[0]._id
      }
  )

  if (route.name == 'product-edit') {
    state.productId = route.params.id;
  } else if (route.name == 'product-create') {
    // console.log('new')
  }

})

watch(() => state.frameThin, (newValue, oldValue) => {
  console.log(oldValue, newValue)
  refreshModel()
});

watch(() => state.artWorkMaxSize, () => {
  refreshModel()
});

watch(() => state.frameDepth, () => {
  refreshModel()
});

watch(() => state.isGlass, () => {
  refreshModel()
});


const openFileDialog = () => {
  fileInput.value?.click();
};

const handleThumbnail = async (event) => {
  const inputElement = event.target;
  if (inputElement.files && inputElement.files.length > 0) {

    state.artworkFile = (event.target).files?.[0]
    state.artworkFileUrl = URL.createObjectURL(state.artworkFile);
    state.artworkImage = await loadImage(state.artworkFileUrl)

    state.artworkFileCompressed = await compressImage(state.artworkFile, 0.1)
    state.artworkFileCompressedUrl = URL.createObjectURL(state.artworkFileCompressed)
    state.artworkImageCompressed = await loadImage(state.artworkFileCompressedUrl)

    await refreshModel()
    // state.thumbnailFileType = state.thumbnailFile.name.match(/\.[0-9a-z]+$/i)[0];
    // const reader = new FileReader();
    // reader.onload = async (e) => {
    //   state.thumbnailFileData = e.target.result
    //   await loadThumbnailImage()
    //   await refreshModel()
    // }
    // reader.readAsDataURL(state.thumbnailFile);
  }
}

const compressImage = (file, qualityCof) => {
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
      }, 'image/jpeg', qualityCof); // Adjust the quality (0.75) as needed
    };
    img.onerror = reject;
  });
};

const loadImage = async (imageFileUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageFileUrl;
    img.onload = () => {
      resolve(img)
    };
    img.onerror = reject;
  });
}

const buildArtWorkMesh = async () => {
  return new Promise((resolve) => {
    const texture = new THREE.Texture(state.artworkImage);
    const longerSide = state.artworkImage.height > state.artworkImage.width ? 'height' : 'width'
    const hCof = state.artworkImage.height / state.artworkImage.width
    const wCof = state.artworkImage.width / state.artworkImage.height

    if (longerSide === 'height') {
      state.artworkMeshYm = state.artWorkMaxSize / 100
      state.artworkMeshXm = wCof * state.artworkMeshYm
    } else {
      state.artworkMeshXm = state.artWorkMaxSize / 100
      state.artworkMeshYm = hCof * state.artworkMeshXm
    }
    const geometry = new THREE.BoxGeometry(
        state.artworkMeshXm,
        state.artworkMeshYm,
        0.01
    );
    const material = new THREE.MeshPhysicalMaterial({
      envMapIntensity: 0.4,
      map: texture,
      metalness: 0.3,
      clearcoatRoughness: state.isGlass ? 0 : 1,
      clearcoat: state.isGlass ? 1 : 0,
    });
    const mesh = new THREE.Mesh(geometry, material);
    resolve(mesh)
  })
}

const buildFrame = async () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {

    if (state.selectedFrameMesh.preview == null) {
      resolve(null)
      return
    }

    const cornerFbx = await loadFbx(state.selectedFrameMesh.corner)
    const edgeFbx = await loadFbx(state.selectedFrameMesh.edge)

    const frameMesh = new THREE.Group()
    const center = new THREE.Vector3();

    if (state.frameThin === '' || state.frameThin === '0') {
      resolve(null)
    }

    const frameThinM = state.frameThin / 100
    const TLC = cornerFbx.clone();
    let boxTLC = new THREE.Box3().setFromObject(TLC);
    const TLCsize = new THREE.Vector3();
    boxTLC.getSize(TLCsize);
    boxTLC.getCenter(center);
    TLC.position.sub(center);
    const desiredWidthTLC = frameThinM;
    const currentWidthTLC = TLCsize.x;
    const scaleFactorTLC = desiredWidthTLC / currentWidthTLC;
    TLC.scale.set(scaleFactorTLC, scaleFactorTLC, scaleFactorTLC);
    // TLC.scale.set(0.01, 0.01, 0.01);
    boxTLC = new THREE.Box3().setFromObject(TLC);
    boxTLC.getSize(TLCsize);
    boxTLC.getCenter(center);
    TLC.position.sub(center);
    TLC.position.x -= state.artworkMeshXm / 2 + TLCsize.x / 2
    TLC.position.y += state.artworkMeshYm / 2 + TLCsize.y / 2
    frameMesh.add(TLC)

    const TRC = cornerFbx.clone();
    TRC.rotation.z = 1.5 * Math.PI
    let boxTRC = new THREE.Box3().setFromObject(TRC);
    const TRCsize = new THREE.Vector3();
    boxTRC.getSize(TRCsize);
    boxTRC.getCenter(center);
    TRC.position.sub(center);
    const desiredWidthTRC = frameThinM; // 5 centimeters
    const currentWidthTRC = TRCsize.x;
    const scaleFactorTRC = desiredWidthTRC / currentWidthTRC;
    TRC.scale.set(scaleFactorTRC, scaleFactorTRC, scaleFactorTRC);
    boxTRC = new THREE.Box3().setFromObject(TRC);
    boxTRC.getSize(TRCsize);
    boxTRC.getCenter(center);
    TRC.position.sub(center);
    TRC.position.x += state.artworkMeshXm / 2 + TRCsize.x / 2
    TRC.position.y += state.artworkMeshYm / 2 + TRCsize.y / 2
    frameMesh.add(TRC)


    const BRC = cornerFbx.clone();
    BRC.rotation.z = Math.PI
    let boxBRC = new THREE.Box3().setFromObject(BRC);
    const BRCsize = new THREE.Vector3();
    boxBRC.getSize(BRCsize);
    boxBRC.getCenter(center);
    BRC.position.sub(center);
    const desiredWidthBRC = frameThinM;
    const currentWidthBRC = BRCsize.x;
    const scaleFactorBRC = desiredWidthBRC / currentWidthBRC;
    BRC.scale.set(scaleFactorBRC, scaleFactorBRC, scaleFactorBRC);
    boxBRC = new THREE.Box3().setFromObject(BRC);
    boxBRC.getSize(BRCsize);
    boxBRC.getCenter(center);
    BRC.position.sub(center);
    BRC.position.x += state.artworkMeshXm / 2 + BRCsize.x / 2
    BRC.position.y -= state.artworkMeshYm / 2 + BRCsize.y / 2
    frameMesh.add(BRC)

    const BLC = cornerFbx.clone();
    BLC.rotation.z = Math.PI / 2
    let boxBLC = new THREE.Box3().setFromObject(BLC);
    const BLCsize = new THREE.Vector3();
    boxBLC.getSize(BLCsize);
    boxBLC.getCenter(center);
    BLC.position.sub(center);
    const desiredWidthBLC = frameThinM;
    const currentWidthBLC = BLCsize.x;
    const scaleFactorBLC = desiredWidthBLC / currentWidthBLC;
    BLC.scale.set(scaleFactorBLC, scaleFactorBLC, scaleFactorBLC);
    boxBLC = new THREE.Box3().setFromObject(BLC);
    boxBLC.getSize(BLCsize);
    boxBLC.getCenter(center);
    BLC.position.sub(center);
    BLC.position.x -= state.artworkMeshXm / 2 + BLCsize.x / 2
    BLC.position.y -= state.artworkMeshYm / 2 + BLCsize.y / 2
    frameMesh.add(BLC);

    const TE = edgeFbx.clone()
    let boxTE = new THREE.Box3().setFromObject(TE);
    const TESize = new THREE.Vector3()
    boxTE.getCenter(center);
    boxTE.getSize(TESize)
    TE.position.sub(center)
    const desiredHeightTE = frameThinM;
    const currentHeightTE = TESize.y;
    const scaleFactorYTE = desiredHeightTE / currentHeightTE;
    const currentWidthTE = boxTE.max.x - boxTE.min.x;
    const desiredWidthTE = state.artworkMeshXm;
    const scaleFactorXTE = desiredWidthTE / currentWidthTE;
    TE.scale.set(scaleFactorXTE, scaleFactorYTE, scaleFactorYTE);
    boxTE = new THREE.Box3().setFromObject(TE);
    boxTE.getCenter(center);
    boxTE.getSize(TESize)
    TE.position.sub(center)
    TE.position.y += state.artworkMeshYm / 2 + TLCsize.y / 2
    frameMesh.add(TE)

    const BE = edgeFbx.clone()
    BE.rotation.z = Math.PI
    let boxBE = new THREE.Box3().setFromObject(BE);
    const BESize = new THREE.Vector3()
    boxBE.getCenter(center);
    boxBE.getSize(BESize)
    BE.position.sub(center)
    const desiredHeightBE = frameThinM;
    const currentHeightBE = BESize.y;
    const scaleFactorYBE = desiredHeightBE / currentHeightBE;
    const currentWidthBE = boxBE.max.x - boxBE.min.x;
    const desiredWidthBE = state.artworkMeshXm;
    const scaleFactorXBE = desiredWidthBE / currentWidthBE;
    BE.scale.set(scaleFactorXBE, scaleFactorYBE, scaleFactorYBE);
    boxBE = new THREE.Box3().setFromObject(BE);
    boxBE.getCenter(center);
    boxBE.getSize(BESize)
    BE.position.sub(center)
    BE.position.y -= state.artworkMeshYm / 2 + BLCsize.y / 2
    frameMesh.add(BE)

    const LE = edgeFbx.clone()
    LE.rotation.z = Math.PI / 2
    let boxLE = new THREE.Box3().setFromObject(LE);
    const LEsize = new THREE.Vector3();
    boxLE.getCenter(center);
    boxLE.getSize(LEsize)
    LE.position.sub(center)
    const desiredWidthLE = frameThinM;
    const currentWidthLE = LEsize.x;
    const scaleFactorXLE = desiredWidthLE / currentWidthLE;
    const desiredHeightLE = state.artworkMeshYm;
    const currentHeightLE = LEsize.y;
    const scaleFactorYLE = desiredHeightLE / currentHeightLE;
    LE.scale.set(scaleFactorYLE, scaleFactorXLE, scaleFactorXLE)
    boxLE = new THREE.Box3().setFromObject(LE);
    boxLE.getCenter(center);
    LE.position.sub(center)
    boxLE = new THREE.Box3().setFromObject(LE);
    boxLE.getCenter(center)
    boxLE.getSize(LEsize)
    LE.position.sub(center);
    LE.position.x -= state.artworkMeshXm / 2 + BLCsize.x / 2
    frameMesh.add(LE)

    const RE = edgeFbx.clone()
    RE.rotation.z = 1.5 * Math.PI
    let boxRE = new THREE.Box3().setFromObject(RE);
    const REsize = new THREE.Vector3();
    boxRE.getCenter(center);
    boxRE.getSize(REsize)
    RE.position.sub(center)
    const desiredWidthRE = frameThinM;
    const currentWidthRE = REsize.x;
    const scaleFactorXRE = desiredWidthRE / currentWidthRE;
    const desiredHeightRE = state.artworkMeshYm;
    const currentHeightRE = REsize.y;
    const scaleFactorYRE = desiredHeightRE / currentHeightRE;
    RE.scale.set(scaleFactorYRE, scaleFactorXRE, scaleFactorXRE)
    boxRE = new THREE.Box3().setFromObject(RE);
    boxRE.getCenter(center);
    RE.position.sub(center)
    boxRE = new THREE.Box3().setFromObject(RE);
    boxRE.getCenter(center)
    boxRE.getSize(REsize)
    RE.position.sub(center);
    RE.position.x += state.artworkMeshXm / 2 + BLCsize.x / 2
    frameMesh.add(RE)


    const back = new THREE.BoxGeometry(
        state.artworkMeshXm,
        state.artworkMeshYm,
        0.01)

    const backMaterial = new THREE.MeshPhysicalMaterial({
      envMapIntensity: 0.4,
      metalness: 0.3,
      clearcoatRoughness: 1,
      clearcoat: 0,
    });


    const backMesh = new THREE.Mesh(back, backMaterial);
    backMesh.position.set(0, 0, -0.01)

    frameMesh.add(backMesh)


    const frameTexture = state.selectedFrameTexture

    let frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x959595,
      normalScale: new THREE.Vector2(1, -1),
      aoMapIntensity: 0.5,
      side: THREE.DoubleSide
    });

    if (frameTexture.preview != null) {
      const basecolor = await loadTexture(frameTexture.basecolor)
      const metallic = await loadTexture(frameTexture.metallic)
      const normal = await loadTexture(frameTexture.normal)
      const specular = await loadTexture(frameTexture.specular)

      frameMaterial = new THREE.MeshStandardMaterial({
        map: basecolor,
        metalnessMap: metallic,
        normalMap: normal,
        normalScale: new THREE.Vector2(1, -1),
        aoMapIntensity: 0.5,
        aoMap: specular,
        side: THREE.DoubleSide
      });
    }


    TLC.traverse((child) => {
      if (child.isMesh) {
        child.material = frameMaterial;
        child.material.needsUpdate = true;
      }
    });
    TRC.traverse((child) => {
      if (child.isMesh) {
        child.material = frameMaterial;
        child.material.needsUpdate = true;
      }
    });
    BLC.traverse((child) => {
      if (child.isMesh) {
        child.material = frameMaterial;
        child.material.needsUpdate = true;
      }
    });
    BRC.traverse((child) => {
      if (child.isMesh) {
        child.material = frameMaterial;
        child.material.needsUpdate = true;
      }
    });
    TE.traverse((child) => {
      if (child.isMesh) {
        child.material = frameMaterial;
        child.material.needsUpdate = true;
      }
    });
    BE.traverse((child) => {
      if (child.isMesh) {
        child.material = frameMaterial;
        child.material.needsUpdate = true;
      }
    });
    LE.traverse((child) => {
      if (child.isMesh) {
        child.material = frameMaterial;
        child.material.needsUpdate = true;
      }
    });
    RE.traverse((child) => {
      if (child.isMesh) {
        child.material = frameMaterial;
        child.material.needsUpdate = true;
      }
    });
    backMesh.traverse((child) => {
      if (child.isMesh) {
        child.material = frameMaterial;
        child.material.needsUpdate = true;
      }
    });

    resolve(frameMesh)

  })


}

const refreshModel = async () => {

  const scene = new THREE.Scene();
  // const renderer = new THREE.WebGLRenderer();
  // renderer.setSize(window.innerWidth, window.innerHeight);
  // document.body.appendChild(renderer.domElement);

  const artWorkMesh = await buildArtWorkMesh()
  scene.add(artWorkMesh)

  const frame = await buildFrame();

  if (frame) {
    scene.add(frame)
  }

  const gltfExporter = new GLTFExporter();
  gltfExporter.parse(
      scene,
      (gltf) => {
        const gltfUrl = URL.createObjectURL(
            new Blob([JSON.stringify(gltf)], {type: "model/gltf+json"})
        );
        // gltfToBlob(gltfUrl);
        state.modelCompressedUrl = gltfUrl;
      },
      {binary: true}
  );

}

const selectFrameMesh = (frameMesh) => {
  state.selectedFrameMesh = frameMesh
  refreshModel()
}

const selectFrameTexture = (frameTexture) => {
  state.selectedFrameTexture = frameTexture
  refreshModel()
}

const fetchBlob = async (blobUrl) => {
  return new Promise((resolve, reject) => {
    fetch(blobUrl)
        .then(resp => {
          resolve(resp.blob())
        })
        .catch(err => reject(err))
  })
}


const saveProduct = async () => {
  isSaving.value = true

  const modelBlob = await fetchBlob(state.gltfUrl)
  let data = new FormData();

  data.append('title', state.title);
  data.append('placementType', state.placement);
  data.append('status', state.status);
  data.append('artworkProps[arWidth]', state.artworkMeshXm);
  data.append('artworkProps[arHeight]', state.artworkMeshYm);
  data.append('artworkProps[frameWidth]', state.frameThin);
  data.append('artworkProps[frameThickness]', state.frameDepth);
  data.append('artworkProps[typeOfFrame][mesh]', state.selectedFrameMesh.id);
  data.append('artworkProps[typeOfFrame][texture]', state.selectedFrameTexture.id);
  data.append('projectId', state.projectId);

  data.append('model', modelBlob);
  data.append('preview', state.thumbnailFile);
  data.append('artworkImage', state.thumbnailFile);

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://augmento-dev.space/api/development/v1/product',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: data
  };

  axios.request(config)
      .then((response) => {
        isSaving.value = false
        console.log(JSON.stringify(response.data));
      })

      .catch((error) => {
        isSaving.value = false
        console.log(error);
      });


}


</script>

<template>
  <div class="flex flex-col p-12">
    <div class="flex flex-row">
      <h1 class="text-2xl font-semibold ">Add / Edit product</h1>
    </div>

    <div class="flex flex-col md:flex-row   mb-4 ">
      <div class="flex flex-1 flex-col mt-4 md:mr-12">
        <h3>Title</h3>
        <input type="text" v-model="state.title">
      </div>
      <div class="flex flex-1  flex-col  mt-4">
        <h3>Status</h3>
        <div class="flex flex-row flex-1 flex-wrap gap-5">
          <select v-model="state.status">
            <option>online</option>
            <option>inProgress</option>
          </select>
          <button>Preview</button>
          <button>Request model service</button>
          <button class="bg-red-100 text-red-600 hover:bg-red-200" v-if="state.productId">Delete product</button>
        </div>
      </div>
    </div>
    <div class="flex flex-col md:flex-row items-center">
      <span class="font-semibold mr-4">Select project</span>
      <select v-if="state.projects.length > 0" v-model="state.projectId">
        <option v-for="p in state.projects" :key="p._id" :value="p._id">{{ p.title }}</option>
      </select>
    </div>
    <div class="flex flex-col md:flex-row mt-4">
      <div class="flex flex-1 flex-col">
        <h3>Thumbnail</h3>
        <div class="flex flex-col md:flex-row">
          <div class="flex flex-col flex-1 py-2">
            <div class="mb-2">
              <input type="file" accept="image/*" class="hidden" ref="fileInput" @change="handleThumbnail">

              <img v-if="state.artworkFileCompressedUrl" :src="state.artworkFileCompressedUrl" alt="" class="">
              <div v-else
                   class=" p-12 outline outline-2 outline-gray-300 outline-dashed text-center text-gray-500 font-semibold capitalize cursor-pointer hover:bg-gray-200"
                   @click="openFileDialog"> Pick up file
              </div>
            </div>
            <button @click="openFileDialog" v-if="state.artworkFileCompressedUrl">Replace thumbnail</button>
          </div>
          <div class="flex flex-col flex-1 p-4" v-if="state.artworkFile">
            <span class="font-semibold text-sm">Product placement</span>
            <div>
              <label class="text-sm mr-2">
                <input type="radio" name="placement" value="wall" v-model="state.placement"> Wall
              </label>
              <label class="text-sm">
                <input type="radio" name="placement" value="floor" v-model="state.placement"> Floor
              </label>
            </div>
            <div class="mt-2">
              <span class="font-semibold text-sm">Artwork size (longest size)</span>
            </div>
            <div class="flex flex-row items-center">
              <input type="text" v-model="state.artWorkMaxSize"> <span class="ml-3">sm</span>
            </div>
            <div class="flex flex-row mt-2">
              <span class="mr-4 font-semibold text-sm">Add glass</span>
              <input type="checkbox" v-model="state.isGlass">
            </div>

            <div class="mt-2">
              <span class="font-semibold text-sm">Frame wide</span>
            </div>
            <div class="flex flex-row items-center">
              <input type="number" min="0" v-model="state.frameThin"> <span class="ml-3">sm</span>
            </div>


            <div class=" mt-2">
              <span class="font-semibold text-sm">Frame depth</span>
            </div>
            <div class="flex flex-row items-center">
              <input type="text" v-model="state.frameDepth"> <span class="ml-3">sm</span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-1 flex-col " v-if="state.modelCompressedUrl">
        <h3>Preview of 3D model</h3>
        <div class="flex bg-white rounded-lg p-2  justify-center items-center align-middle  relative ">


          <model-viewer
              v-if="state.modelCompressedUrl"
              :src="state.modelCompressedUrl"
              style="min-height: 300px; width: 100%;"
              ar
              shadow-intensity="3"
              shadow-softness="1"
              camera-controls
              :ar-placement="state.placement"
              auto-rotate
              autoplay
          >

            <button slot="ar-button" class="bg-blue-600 text-white absolute bottom-0 right-0">Show in AR</button>

          </model-viewer>
        </div>
      </div>
    </div>


    <div class="flex flex-col mt-2" v-if="state.artworkFileCompressedUrl">
      <span class="font-semibold"> Select frame model</span>
      <div class="flex flex-row   flex-nowrap overflow-x-scroll">
        <div v-for="f in framesMesh" :key="f.id" class="frame-container" @click="selectFrameMesh(f)"
             :class="state.selectedFrameMesh?.id === f.id ? 'bg-blue-200' : ''"
        >
          <div class="p-2">
            <img v-if="f.preview != null" :src="f.preview" alt="" class="h-24 hover:border-4 border-2">


            <div v-else class="bg-gray-300 w-24 h-24  items-center align-middle flex   hover:border-2 ">
              <span class="text-gray-500 w-full text-center text-7xl">x</span>
            </div>
          </div>
          <span class="text-center text-xs font-semibold">{{ f.name }}</span>
        </div>


      </div>
    </div>


    <div class="flex flex-col mt-2" v-if="state.artworkFileCompressedUrl">
      <span class="font-semibold"> Select frame texture</span>
      <div class="flex flex-row   flex-nowrap overflow-x-scroll">
        <div v-for="t in framesTexture" :key="t.id" class="frame-container   " @click="selectFrameTexture(t)"
             :class="state.selectedFrameTexture?.id === t.id ? 'bg-blue-200' : ''"

        >
          <div class="p-2 ">
            <img v-if="t.preview != null" :src="t.preview" alt="" class="h-24  w-24 hover:border-4 border-2">


            <div v-else class="bg-gray-300 w-24 h-24  items-center align-middle flex   hover:border-2 ">
              <span class="text-gray-500 w-full text-center text-7xl">x</span>
            </div>
          </div>
          <span class="text-center text-xs font-semibold">{{ t.name }}</span>
        </div>


      </div>
    </div>


    <div class="flex flex-row mt-4">
      <button class="save-button bg-blue-500 text-white hover:bg-blue-400 px-12" @click="saveProduct">
        <span v-if="!isSaving">Save</span>
        <div v-else class="circle-loader  transform -translate-x-1/2 -translate-y-1/2"></div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.frame-container {
  display: flex;
  flex-direction: column;
  align-items: center;


  width: 100px;
  height: 150px;

  min-width: 100px;
  min-height: 150px;
  cursor: pointer;
}


.circle-loader {
  border: 5px solid #f3f3f3; /* Light gray */
  border-top: 5px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>