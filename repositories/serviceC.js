let { once, EventEmitter } = require('node:events');
let nodefetch = require('node-fetch');

let events = new EventEmitter();

let { timeout, TimeoutError } = require('../utils/timeout');

let URL = 'http://localhost:8080/servico-c';

async function getCoinPrice({ coin, callback }) {
  try {
    let reqCallback = await Promise.race([
      timeout(5),
      nodefetch(`${URL}/cotacao`, {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          tipo: coin,
          callback,
        }),
      }),
    ]);
    let jsonCallback = await reqCallback.json();
    let [json] = await Promise.race([timeout(5), once(events, `serviceC.events.${jsonCallback.cid}`)]);
    let payload = {
      value: json.v / json.f,
      tag: 'serviceC',
    };
    return { ok: true, payload };
  } catch (err) {
    let error;
    if (err instanceof TimeoutError) {
      error = new TimeoutError('ServiceC Timeout');
    } else {
      error = new Error('Something wrong happened');
    }
    throw error;
  }
}

module.exports = { events, getCoinPrice };
