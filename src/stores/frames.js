import {ref} from "vue";

export const framesMesh = ref([
    {
        id: 0,
        name: "No frame",
        preview: null,
        corner: null,
        edge: null,
    },
    {
        id: 1,
        name: "Wood Complex",
        preview: 'frames/Mesh/Wood/preview.png',
        corner: 'frames/Mesh/Wood/corner.fbx',
        edge: 'frames/Mesh/Wood/edge.fbx',
    },
    {
        id: 2,
        name: "Aluminium",
        preview: 'frames/Mesh/Aluminium/preview.png',
        corner: 'frames/Mesh/Aluminium/corner.fbx',
        edge: 'frames/Mesh/Aluminium/edge.fbx',
    }
])

export const framesTexture = ref([
    {
        id: 0,
        name: "No texture",
        preview: null
    },
    {
        id: 1,
        name: "Wood",
        preview: 'frames/Textures/Wood/basecolor.png',
        basecolor: 'frames/Textures/Wood/basecolor.png',
        metallic: 'frames/Textures/Wood/metallic.png',
        normal: 'frames/Textures/Wood/normal.png',
        specular: 'frames/Textures/Wood/specular.png'
    },
    {
        id: 2,
        name: "Aluminium",
        preview: 'frames/Textures/Aluminium/basecolor.png',
        basecolor: 'frames/Textures/Aluminium/basecolor.png',
        metallic: 'frames/Textures/Aluminium/metallic.png',
        normal: 'frames/Textures/Aluminium/normal.png',
        specular: 'frames/Textures/Aluminium/specular.png'
    }

])
