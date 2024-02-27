import { inject, injectable } from 'inversify';
import axios from 'axios';
import Types from 'common/Types';
import Cache from 'gateway/Cache';

@injectable()
export default class HttpGateway {
  @inject(Types.ICache)
  cache!: Cache;

  async get(url: string, config: Record<string, unknown>) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    const result = await axios.get(url, config);
    this.cache = this.cache.set(url, result);

    return result;
  }

  async post(url: string, config: Record<string, unknown>) {
    return await axios.post(url, config);
  }
}
