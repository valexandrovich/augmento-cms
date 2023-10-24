<script setup>

import {useRoute} from "vue-router";
import {onMounted, reactive, ref, watch} from "vue";

import * as THREE from "three";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter";

import {loadFbx, loadGltf, loadTexture} from "@/utils/3d-loaders";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader";

const route = useRoute();

const fileInput = ref(null);

const framesMesh = ref([
  {
    name: "No frame",
    preview: null,
    corner: null,
    edge: null,
  },
  {
    name: "Wood Complex",
    preview: 'frames/Mesh/Wood/preview.png',
    corner: 'frames/Mesh/Wood/corner.fbx',
    edge: 'frames/Mesh/Wood/edge.fbx',
  },
  {
    name: "Aluminium",
    preview: 'frames/Mesh/Aluminium/preview.png',
    corner: 'frames/Mesh/Aluminium/corner.fbx',
    edge: 'frames/Mesh/Aluminium/edge.fbx',
  }
])

const framesTexture = ref([
  {
    name: "No texture",
    preview: null
  },
  {
    name: "Wood",
    preview: 'frames/Textures/Wood/basecolor.png',
    basecolor: 'frames/Textures/Wood/basecolor.png',
    metallic: 'frames/Textures/Wood/metallic.png',
    normal: 'frames/Textures/Wood/normal.png',
    specular: 'frames/Textures/Wood/specular.png'
  },
  {
    name: "Aluminium",
    preview: 'frames/Textures/Aluminium/basecolor.png',
    basecolor: 'frames/Textures/Aluminium/basecolor.png',
    metallic: 'frames/Textures/Aluminium/metallic.png',
    normal: 'frames/Textures/Aluminium/normal.png',
    specular: 'frames/Textures/Aluminium/specular.png'
  }

])


const state = reactive({
  productId: null,
  thumbnailFile: null,
  thumbnailFileType: null,
  thumbnailFileData: null,
  thumbnailImage: null,

  gtlfUrl: null,


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

onMounted(()=>{
  state.selectedFrameMesh = framesMesh.value[0]
  state.selectedFrameTexture = framesTexture.value[0]
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
    state.thumbnailFile = (event.target).files?.[0]
    state.thumbnailFileType = state.thumbnailFile.name.match(/\.[0-9a-z]+$/i)[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      state.thumbnailFileData = e.target.result
      await loadThumbnailImage()
      await refreshModel()
    }
    reader.readAsDataURL(state.thumbnailFile);
  }
}

const loadThumbnailImage = async () => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = state.thumbnailFileData;
    img.onload = () => {
      state.thumbnailImage = img
      resolve()
    };
    img.onerror = reject;
  });
}

const buildArtWorkMesh = async () => {
  return new Promise((resolve) => {
    const texture = new THREE.Texture(state.thumbnailImage);
    const longerSide = state.thumbnailImage.height > state.thumbnailImage.width ? 'height' : 'width'
    const hCof = state.thumbnailImage.height / state.thumbnailImage.width
    const wCof = state.thumbnailImage.width / state.thumbnailImage.height
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

    if (state.selectedFrameMesh.preview == null){
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

    if (frameTexture.preview != null){
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


  console.log()


  const gltfExporter = new GLTFExporter();
  gltfExporter.parse(
      scene,
      (gltf) => {
        const gltfUrl = URL.createObjectURL(
            new Blob([JSON.stringify(gltf)], {type: "model/gltf+json"})
        );
        // gltfToBlob(gltfUrl);
        state.gltfUrl = gltfUrl;
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


</script>

<template>

  <div class="flex flex-col p-12">


    <div class="flex flex-row">

      <h1 class="text-2xl font-semibold ">Add / Edit product</h1>
    </div>
    <div class="flex flex-col md:flex-row   mb-12 ">
      <div class="flex flex-1 flex-col mt-4 md:mr-12">
        <h3>Title</h3>
        <input type="text">
      </div>
      <div class="flex flex-1  flex-col  mt-4">
        <h3>Status</h3>
        <div class="flex flex-row flex-1 flex-wrap gap-5">
          <select>
            <option>Online</option>
            <option>Offline</option>
          </select>
          <button>Preview</button>
          <button>Request model service</button>
          <button class="bg-red-100 text-red-600 hover:bg-red-200">Delete product</button>
        </div>
      </div>
    </div>

    <div class="flex flex-col md:flex-row">
      <div class="flex flex-1 flex-col">
        <h3>Thumbnail</h3>
        <div class="flex flex-col md:flex-row">
          <div class="flex flex-col flex-1 py-2">
            <div class="mb-2">
              <input type="file" accept="image/*" class="hidden" ref="fileInput" @change="handleThumbnail">

              <img v-if="state.thumbnailFileData" :src="state.thumbnailFileData" alt="" class="w-full h-full">
              <div v-else
                   class=" p-12 outline outline-2 outline-gray-300 outline-dashed text-center text-gray-500 font-semibold capitalize cursor-pointer hover:bg-gray-200"
                   @click="openFileDialog"> Pick up file
              </div>
            </div>
            <button @click="openFileDialog" v-if="state.thumbnailFileData">Replace thumbnail</button>
          </div>
          <div class="flex flex-col flex-1 p-4" v-if="state.thumbnailFile">
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
      <div class="flex flex-1 flex-col " v-if="state.thumbnailFileData">
        <h3>Preview of 3D model</h3>
        <div class="flex bg-white rounded-lg p-2  justify-center items-center align-middle  relative ">


          <model-viewer
              v-if="state.gltfUrl"
              :src="state.gltfUrl"
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


    <div class="flex flex-col mt-2" v-if="state.thumbnailFile">
      <span class="font-semibold"> Select frame model</span>
      <div class="flex flex-row   flex-nowrap overflow-x-scroll">
        <div v-for="f in framesMesh" :key="f.name" class="frame-container" @click="selectFrameMesh(f)"
             :class="state.selectedFrameMesh?.name === f.name ? 'bg-blue-200' : ''"
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


    <div class="flex flex-col mt-2" v-if="state.thumbnailFile">
      <span class="font-semibold"> Select frame texture</span>
      <div class="flex flex-row   flex-nowrap overflow-x-scroll">
        <div v-for="t in framesTexture" :key="t.name" class="frame-container   " @click="selectFrameTexture(t)"
             :class="state.selectedFrameTexture?.name === t.name ? 'bg-blue-200' : ''"

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


    <div class="flex flex-row">
      <button class="save-button">Save</button>
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
</style>