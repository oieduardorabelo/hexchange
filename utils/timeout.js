class TimeoutError extends Error {
  constructor(message) {
    super(message);
  }
}

function timeout(seconds) {
  let time = seconds * 1000;
  return new Promise((_, rej) => {
    setTimeout(() => {
      let error = new TimeoutError(`Timeout after ${time}`);
      rej(error);
    }, time);
  });
}

module.exports = { timeout, TimeoutError };
