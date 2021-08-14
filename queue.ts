// Prerequisite stuff

interface Queue<T> {
  dequeue(): Promise<T>;
}

class SimpleQueue implements Queue<string> {
  counter = 0;

  constructor(private id: number){};

  dequeue(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.counter++;
        resolve(this.id + ' someString ' + this.counter);
      }, 1000 + Math.random() * 1000);
    });
  }
}

// CompositeQueue which was named UberQueue in challenge

type CompositeDequeueItem<T> = {
  id: number;
  value: T
};

class CompositeQueue<T> implements Queue<T> {
  promises: (Promise<CompositeDequeueItem<T>> | null)[];

  constructor(private _queues: Queue<T>[]) {
    this.promises = _queues.map(el => null);
  }

  async dequeue(): Promise<T> {
    this.promises.forEach(async (el, index) => {
      if (el === null) {
        this.promises[index] = this.getCompositeDequeueItem(
          this._queues[index],
          index
        );
      }
    });
    const promises = this.promises as Promise<CompositeDequeueItem<T>>[];
    const result = await Promise.race(promises);
    this.promises[result.id] = null;
    return result.value;
  }

  async getCompositeDequeueItem(queue: Queue<T>, index: number) {
    return {
      id: index,
      value: await queue.dequeue()
    }
  }
}

// Checking if it works

async function run() {
  // check simple queue
  const simpleQueue1 = new SimpleQueue(1);
  console.log(await simpleQueue1.dequeue());
  console.log(await simpleQueue1.dequeue());

  // check composite queue
  console.log('------------');
  const simpleQueue2 = new SimpleQueue(2);
  const simpleQueue3 = new SimpleQueue(3);
  const compositeQueue = new CompositeQueue([
    simpleQueue1,
    simpleQueue2,
    simpleQueue3,
  ]);
  for (let i = 0; i < 10; i++) {
    console.log(await compositeQueue.dequeue());
  }
}

run();

