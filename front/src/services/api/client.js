import axios from 'axios'

const client = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true
})

client.interceptors.request.use(cfg => cfg, err => Promise.reject(err))
client.interceptors.response.use(res => res, err => Promise.reject(err))

export default client
