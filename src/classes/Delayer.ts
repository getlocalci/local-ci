// Entire file forked from https://github.com/microsoft/vscode/blob/0eee604f0151a6726e9a31b0b695e28fa988eeca/src/vs/base/common/async.ts#L235
interface ITask<T> {
  (): T;
}

export default class Delayer<T> {
  private timeout: null | NodeJS.Timeout;
  private completionPromise: Promise<T | undefined | null> | null;
  private doResolve:
    | ((value?: Promise<T | undefined | null> | null) => void)
    | null;
  private task: ITask<T | Promise<T>> | null;

  constructor(public defaultDelay: number) {
    this.timeout = null;
    this.completionPromise = null;
    this.doResolve = null;
    this.task = null;
  }

  trigger(
    task: ITask<T | Promise<T>>,
    delay: number = this.defaultDelay
  ): Promise<T | undefined | null> {
    this.task = task;
    this.cancelTimeout();

    if (!this.completionPromise) {
      this.completionPromise = new Promise((resolve) => {
        this.doResolve = resolve;
      }).then(() => {
        this.completionPromise = null;
        this.doResolve = null;
        if (this.task) {
          const task = this.task;
          this.task = null;
          return task();
        }
        return undefined;
      });
    }

    this.timeout = setTimeout(() => {
      this.timeout = null;
      if (this.doResolve) {
        this.doResolve(null);
      }
    }, delay);

    return this.completionPromise;
  }

  private cancelTimeout(): void {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}
