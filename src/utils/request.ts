import axios from 'axios';

const BASE_URL = process.env.BEST_CLI_BASE_URL ? process.env.BEST_CLI_BASE_URL : 'http://112.74.201.142:7002';

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

request.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response.data;
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default request;
