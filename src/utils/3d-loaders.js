import {GLTFLoader} from "three/addons/loaders/GLTFLoader";
import {TextureLoader} from "three";
import {FBXLoader} from "three/addons/loaders/FBXLoader";

export const loadGltf = (path) => {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(path, (gltf) => {
            resolve (gltf.scene)
        }, undefined, (error) => {
            reject(error);
        });
    });
};

export const loadFbx = async (path) => {
    return new Promise((resolve, reject) => {
        const loader = new FBXLoader();
        loader.load(
            path,
            (fbx) => {
                resolve(fbx);
            },
            undefined,
            (error) => {
                reject(error);
            }
        );
    })
}

export const loadTexture = async (path) => {
    return new Promise((resolve, reject) => {
        const loader = new TextureLoader();
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