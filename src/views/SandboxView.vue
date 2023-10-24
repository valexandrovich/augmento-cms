<script setup>

import scene from "three/addons/offscreen/scene";

const gltfUrl = ref(null);

import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';

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
    const loader = new GLTFLoader();

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


  const cornerFbx = await loadFbx('/frames/Mesh/corner2.fbx')
  const edgeFbx = await loadFbx('/frames/Mesh/edge.fbx')


  const center = new THREE.Vector3();


  const artWorkX = 60
  const artWorkY = 40
  const artWorkZ = 0.5
  const frameThin = 3

  const artWorkXm = artWorkX / 100
  const artWorkYm = artWorkY / 100
  const artWorkZm = artWorkZ / 100
  const frameThinM = frameThin / 100


  // const frameThin = 4

  const artWorkTexture = await loadTexture('/artwork.png')
  const geometry = new THREE.BoxGeometry(
      artWorkXm,
      artWorkYm,
      artWorkZm
  );

  const artWorkMaterial = new THREE.MeshPhysicalMaterial({
    envMapIntensity: 0.4,
    map: artWorkTexture,
    metalness: 0.3,
    transparent: true,
    opacity: 1,
    clearcoatRoughness: 0,
    clearcoat: 1
  });
  const mesh = new THREE.Mesh(geometry, artWorkMaterial);
  scene.add(mesh)


  // const frameTexture = await  loadTexture('/frames/Textures/Wood_1_normal.png')
  // const frameTexture = await loadTexture('/frames/Textures/Wood_1_Specualr.png')


  const texture_basecolor = await loadTexture('/frames/Textures/Wood_Complex_basecolor2.png');
  const texture_metallic = await loadTexture('/frames/Textures/Wood_1_metallic.png');
  const texture_normal = await loadTexture('/frames/Textures/Wood_1_normal.png');
  const texture_Specular = await loadTexture('/frames/Textures/Wood_1_Specualr.png');


  // const texture_basecolor = await loadTexture('/frames/Textures/Aluminium_basecolor2.png');
  // const texture_metallic = await loadTexture('/frames/Textures/Aluminium_metallic.png');
  // const texture_normal = await loadTexture('/frames/Textures/Aluminium_normal.png');
  // const texture_Specular = await loadTexture('/frames/Textures/Aluminium_specular.png');

  const frameMaterial = new THREE.MeshStandardMaterial({
    map: texture_basecolor,
    metalnessMap: texture_metallic,
    normalMap: texture_normal,
    normalScale: new THREE.Vector2(1, -1),
    aoMapIntensity: 0.5,
    aoMap: texture_Specular,
    side: THREE.DoubleSide
  });



  const TLC = cornerFbx.clone();

  let boxTLC = new THREE.Box3().setFromObject(TLC);
  const TLCsize = new THREE.Vector3();
  boxTLC.getSize(TLCsize);
  boxTLC.getCenter(center);
  TLC.position.sub(center);
  const desiredWidthTLC = frameThinM; // 5 centimeters
  const currentWidthTLC = TLCsize.x;
  const scaleFactorTLC = desiredWidthTLC / currentWidthTLC;
  TLC.scale.set(scaleFactorTLC, scaleFactorTLC, scaleFactorTLC);
  boxTLC = new THREE.Box3().setFromObject(TLC);
  boxTLC.getSize(TLCsize);
  boxTLC.getCenter(center);
  TLC.position.sub(center);
  TLC.position.x -= artWorkXm / 2 + TLCsize.x / 2
  TLC.position.y += artWorkYm / 2 + TLCsize.y / 2
  scene.add(TLC)





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
  TRC.position.x += artWorkXm / 2 + TRCsize.x / 2
  TRC.position.y += artWorkYm / 2 + TRCsize.y / 2
  scene.add(TRC);

  const BRC = cornerFbx.clone();
  BRC.rotation.z = Math.PI
  let boxBRC = new THREE.Box3().setFromObject(BRC);
  const BRCsize = new THREE.Vector3();
  boxBRC.getSize(BRCsize);
  boxBRC.getCenter(center);
  BRC.position.sub(center);
  const desiredWidthBRC = frameThinM; // 5 centimeters
  const currentWidthBRC = BRCsize.x;
  const scaleFactorBRC = desiredWidthBRC / currentWidthBRC;
  BRC.scale.set(scaleFactorBRC, scaleFactorBRC, scaleFactorBRC);
  boxBRC = new THREE.Box3().setFromObject(BRC);
  boxBRC.getSize(BRCsize);
  boxBRC.getCenter(center);
  BRC.position.sub(center);
  BRC.position.x += artWorkXm / 2 + BRCsize.x / 2
  BRC.position.y -= artWorkYm / 2 + BRCsize.y / 2
  scene.add(BRC);

  const BLC = cornerFbx.clone();
  BLC.rotation.z = Math.PI / 2
  let boxBLC = new THREE.Box3().setFromObject(BLC);
  const BLCsize = new THREE.Vector3();
  boxBLC.getSize(BLCsize);
  boxBLC.getCenter(center);
  BLC.position.sub(center);
  const desiredWidthBLC = frameThinM; // 5 centimeters
  const currentWidthBLC = BLCsize.x;
  const scaleFactorBLC = desiredWidthBLC / currentWidthBLC;
  BLC.scale.set(scaleFactorBLC, scaleFactorBLC, scaleFactorBLC);
  boxBLC = new THREE.Box3().setFromObject(BLC);
  boxBLC.getSize(BLCsize);
  boxBLC.getCenter(center);
  BLC.position.sub(center);
  BLC.position.x -= artWorkXm / 2 + BLCsize.x / 2
  BLC.position.y -= artWorkYm / 2 + BLCsize.y / 2
  scene.add(BLC);


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
  const desiredWidthTE = artWorkXm;
  const scaleFactorXTE = desiredWidthTE / currentWidthTE;
  TE.scale.set(scaleFactorXTE,scaleFactorYTE, scaleFactorYTE);
  boxTE =  new THREE.Box3().setFromObject(TE);
  boxTE.getCenter(center);
  boxTE.getSize(TESize)
  TE.position.sub(center)
  TE.position.y += artWorkYm / 2 + TLCsize.y / 2
  scene.add(TE)

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
  const desiredWidthBE = artWorkXm;
  const scaleFactorXBE = desiredWidthBE / currentWidthBE;
  BE.scale.set(scaleFactorXBE,scaleFactorYBE, scaleFactorYBE);
  boxBE =  new THREE.Box3().setFromObject(BE);
  boxBE.getCenter(center);
  boxBE.getSize(BESize)
  BE.position.sub(center)
  BE.position.y -= artWorkYm / 2 + BLCsize.y / 2
  scene.add(BE)

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
  const desiredHeightLE = artWorkYm;
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
  LE.position.x -= artWorkXm / 2 + BLCsize.x / 2
  scene.add(LE)

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
  const desiredHeightRE = artWorkYm;
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
  RE.position.x += artWorkXm / 2 + BLCsize.x / 2
  scene.add(RE)


  // const rightEdge = edgeFbx.clone()
  // rightEdge.rotation.z = Math.PI / 2
  // let boundingBoxRightEdge = new THREE.Box3().setFromObject(rightEdge);
  // boundingBoxRightEdge.getCenter(center);
  // const rightEdgeSize = new THREE.Vector3();
  // boundingBoxRightEdge.getSize(rightEdgeSize)
  // const currentHeightRightEdge = boundingBoxRightEdge.max.y - boundingBoxRightEdge.min.y;
  // const desiredHeightRightEdge = artWorkY;
  // const scaleFactorRightEdge = desiredHeightRightEdge / currentHeightRightEdge;
  // rightEdge.scale.set(scaleFactorRightEdge, -1, 1);
  // rightEdge.position.sub(center);
  // boundingBoxRightEdge = new THREE.Box3().setFromObject(rightEdge);
  // boundingBoxRightEdge.getCenter(center)
  // rightEdge.position.sub(center);
  // rightEdge.position.x += artWorkX / 2 + rightEdgeSize.x / 2
  // scene.add(rightEdge)



  TRC.traverse((child) => {
    if (child.isMesh) {
      child.material = frameMaterial;
      // child.material.side = THREE.DoubleSide
      child.material.needsUpdate = true;  // Important!
    }
  });

  TLC.traverse((child) => {
    if (child.isMesh) {
      child.material = frameMaterial;
      // child.material.side = THREE.DoubleSide
      child.material.needsUpdate = true;  // Important!
    }
  });

  BRC.traverse((child) => {
    if (child.isMesh) {
      child.material = frameMaterial;
      // child.material.side = THREE.DoubleSide
      child.material.needsUpdate = true;  // Important!
    }
  });

  BLC.traverse((child) => {
    if (child.isMesh) {
      child.material = frameMaterial;
      // child.material.side = THREE.DoubleSide
      child.material.needsUpdate = true;  // Important!
    }
  });

  TE.traverse((child) => {
    if (child.isMesh) {
      child.material = frameMaterial;
      // child.material.side = THREE.DoubleSide
      child.material.needsUpdate = true;  // Important!
    }
  });

  BE.traverse((child) => {
    if (child.isMesh) {
      child.material = frameMaterial;
      // child.material.side = THREE.DoubleSide
      child.material.needsUpdate = true;  // Important!
    }
  });

  RE.traverse((child) => {
    if (child.isMesh) {
      child.material = frameMaterial;
      // child.material.side = THREE.DoubleSide
      child.material.needsUpdate = true;  // Important!
    }
  });


  LE.traverse((child) => {
    if (child.isMesh) {
      child.material = frameMaterial;
      // child.material.side = THREE.DoubleSide
      child.material.needsUpdate = true;  // Important!
    }
  });




  //
  // topRightCorner.traverse((child) => {
  //   if (child.isMesh) {
  //     child.material = material2;
  //     child.material.needsUpdate = true;  // Important!
  //   }
  // });
  //
  // bottomLeftCorner.traverse((child) => {
  //   if (child.isMesh) {
  //     child.material = material2;
  //     child.material.needsUpdate = true;  // Important!
  //   }
  // });
  //
  // bottomRightCorner.traverse((child) => {
  //   if (child.isMesh) {
  //     child.material = material2;
  //     child.material.needsUpdate = true;  // Important!
  //   }
  // });
  //
  // topEdge.traverse((child) => {
  //   if (child.isMesh) {
  //     child.material = material2;
  //     child.material.needsUpdate = true;  // Important!
  //   }
  // });
  //
  // bottomEdge.traverse((child) => {
  //   if (child.isMesh) {
  //     child.material = material2;
  //     child.material.needsUpdate = true;  // Important!
  //   }
  // });
  //
  // leftEdge.traverse((child) => {
  //   if (child.isMesh) {
  //     child.material = material2;
  //     child.material.needsUpdate = true;  // Important!
  //   }
  // });
  //
  // rightEdge.traverse((child) => {
  //   if (child.isMesh) {
  //     child.material = material2;
  //     child.material.needsUpdate = true;  // Important!
  //   }
  // });


  // const texture = await loadTexture('/frames/Textures/Wood_1_Specualr.png');
  // // const texture = await loadTexture('/frames/Textures/Aluminium_specular.png');
  // // const texture = await loadTexture('/frames/Textures/Wood_1_normal.png');
  // const texturedMaterial = new THREE.MeshBasicMaterial({ map: texture });
  // console.log('TMTMTM' + texturedMaterial)


// topLeftCorner.material = texturedMaterial
//   topLeftCorner.traverse((child) => {
//     if (child.isMesh) {
//       console.log(child)
//       child.material = texturedMaterial;
//     }
//   });


//   const topEdge = edgeFbx.clone()
//   const boundingBox3 = new THREE.Box3().setFromObject(topEdge);
//   const size3 = new THREE.Vector3();
//   boundingBox3.getSize(size3);
//   const center3 = new THREE.Vector3();
//   boundingBox3.getCenter(center3);
//   topEdge.position.sub(center3);
//   const boxGeometry3 = new THREE.BoxGeometry(size3.x, size3.y, size3.z);
//   const glassBox3 = new THREE.Mesh(boxGeometry3, glassMaterial);
//   const frameGroup3 = new THREE.Group();
//   // frameGroup3.add(topEdge);
//   frameGroup3.add(glassBox3);
//   console.log(size)
//   frameGroup3.position.set(0 , 0, 0)
//   // scene.add(frameGroup3);
//
//
//
//
//   const topRightCorner = cornerFbx.clone()
//   topRightCorner.rotation.z = 1.5 * Math.PI
//   const boundingBox2 = new THREE.Box3().setFromObject(topRightCorner);
//   const size2 = new THREE.Vector3();
//   boundingBox2.getSize(size2);
//   const center2 = new THREE.Vector3();
//   boundingBox2.getCenter(center2);
//   topRightCorner.position.sub(center2);
//   const padding2 = 0; // This can be adjusted as needed
//   const boxGeometry2 = new THREE.BoxGeometry(size.x + padding2, size.y + padding2, size.z + padding2);
//   const glassBox2 = new THREE.Mesh(boxGeometry2, glassMaterial);
//   // scene.add(glassBox);
//
//   const frameGroup2 = new THREE.Group();
//   frameGroup2.add(topRightCorner);
//   frameGroup2.add(glassBox2);
// frameGroup2.position.set(size.x, 0, 0)
//
//   // scene.add(frameGroup2);
//
//
//   // const combinedGroup = new THREE.Group();
//   // combinedGroup.add(topLeftCorner);
//   // combinedGroup.add(glassBox);
//
//   // topLeftCorner.rotation.z = 1.5 * Math.PI
//   // topLeftCorner.position.sub(center);


  //
  const box = new THREE.BoxGeometry(
      1/100,
      1/100,
      3/100
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

  // scene.scale.set(0.1, 0.1, 0.1)


  // const geometry2 = new THREE.BoxGeometry(
  //     50 / 100,
  //     30 / 100,
  //     1 /100
  // );
  //
  // const material2 = new THREE.MeshPhysicalMaterial({
  //   envMapIntensity: 0.4,
  //   color: 0xffff000,
  //   metalness: 0.3,
  //   clearcoatRoughness: 0,
  //   clearcoat: 1,
  // });
  //
  // const mesh2 = new THREE.Mesh(geometry2, material2);


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
        ar-placement="wall"
        ar
        style="height: 500px; width: 1000px"
        shadow-intensity="3"
        shadow-softness="1"
        camera-controls
        auto-rotate
        autoplay
    >

      <button slot="ar-button" class="bg-blue-600 text-white absolute top-0 left-0 px-6 py-2">Show in AR</button>

    </model-viewer>


    <button @click="tst">TST</button>
  </div>

</template>

<style scoped>

</style>