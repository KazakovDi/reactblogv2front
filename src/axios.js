import axios from "axios"

const instance = axios.create({
    baseURL: "https://blogged.onrender.com"
})
// "http://localhost:5000"
//https://nervous-school-uniform-duck.cyclic.app
instance.interceptors.request.use(config => {
    config.headers.Authorization = window.localStorage.getItem("token")
    return config
})
export default instance