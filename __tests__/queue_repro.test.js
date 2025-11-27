
describe('addToQueue Logic Reproduction', () => {
  let generateQueue = Promise.resolve();

  function addToQueue(task) {
    generateQueue = generateQueue
      .then(() => task())
      .catch((err) => {
        console.error('Error di queue:', err);
      });
    return generateQueue;
  }

  it('should swallow errors and return a resolved promise', async () => {
    const errorTask = async () => {
      throw new Error('Task Failed');
    };

    // This simulates the behavior in src/pages/index.js
    // We expect this NOT to throw, even though the task failed
    await expect(addToQueue(errorTask)).resolves.not.toThrow();
  });

  it('should execute subsequent code even if task failed', async () => {
    let subsequentCodeExecuted = false;
    const errorTask = async () => {
      throw new Error('Task Failed');
    };

    await addToQueue(errorTask);
    
    // This represents setIsGenerating(false) running after failure
    subsequentCodeExecuted = true;

    expect(subsequentCodeExecuted).toBe(true);
  });
});

describe('Proposed Fix for addToQueue', () => {
  let generateQueue = Promise.resolve();

  function addToQueueFixed(task) {
    // Create a promise for this specific task
    const taskPromise = generateQueue.then(() => task());
    
    // Update the queue to wait for this task, but catch errors so the queue doesn't break
    generateQueue = taskPromise.catch(() => {});
    
    // Return the task promise so the caller can await IT specifically
    return taskPromise;
  }

  it('should propagate errors to the caller', async () => {
    const errorTask = async () => {
      throw new Error('Task Failed');
    };

    await expect(addToQueueFixed(errorTask)).rejects.toThrow('Task Failed');
  });

  it('should NOT break the queue for subsequent tasks', async () => {
    const errorTask = async () => {
      throw new Error('Task Failed');
    };
    const successTask = async () => {
      return 'Success';
    };

    // First task fails
    try {
      await addToQueueFixed(errorTask);
    } catch (e) {}

    // Second task should succeed
    await expect(addToQueueFixed(successTask)).resolves.toBe('Success');
  });
});
