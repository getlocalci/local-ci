import Delayer from './Delayer';

export default class Retryer {
  delayer?: Delayer<void>;
  delayLength = 5000;
  retryCount = 0;
  maxRetries = 10;
  callback?: () => void;

  init(callback: () => void) {
    this.delayer = new Delayer(this.delayLength);
    this.callback = callback;
  }

  run() {
    if (this.retryCount > this.maxRetries) {
      return;
    }

    if (!this.callback || !this.delayer) {
      throw new Error(
        'Retryer called .run() without having set the callback in .init()'
      );
    }

    this.retryCount++;
    this.delayer.trigger(this.callback);
  }
}
