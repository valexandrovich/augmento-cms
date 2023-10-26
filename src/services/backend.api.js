import axios from "@/utils/axios.config";

const apiBaseURL = import.meta.env.VITE_API_BASE_URL;

export const getProjects = async () => {
    return new Promise((resolve, reject) => {
        axios.get(apiBaseURL + '/v1/project')
            .then(resp => {
                resolve(resp.data)
            })
            .catch(err => {
                reject(err)
            })
    })
}

export const getProducts = async (projectId) => {
    return new Promise((resolve, reject) => {
        axios.get(apiBaseURL + '/v1/product/project/' + projectId)
            .then(resp => {
                resolve(resp.data)
            })
            .catch(err => {
                reject(err)
            })
    })
}