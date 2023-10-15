import axios from 'axios';

export default class HttpGateway {
  async get(url: string, config: Record<string, unknown>) {
    return await axios.get(url, config);
  }

  async post(url: string, config: Record<string, unknown>) {
    return await axios.post(url, config);
  }
}
