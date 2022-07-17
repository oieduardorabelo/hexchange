let nodefetch = require('node-fetch');

let { timeout, TimeoutError } = require('../utils/timeout');

let URL = 'http://localhost:8080/servico-a';

async function getCoinPrice({ coin }) {
  try {
    let req = await Promise.race([timeout(5), nodefetch(`${URL}/cotacao?moeda=${coin.toUpperCase()}`)]);
    let json = await req.json();
    let payload = {
      value: json.cotacao,
      tag: 'serviceA',
    };
    return { ok: true, payload };
  } catch (err) {
    let error;
    if (err instanceof TimeoutError) {
      error = new TimeoutError('ServiceA Timeout');
    } else {
      error = new Error('Something wrong happened');
    }
    throw error;
  }
}

module.exports = { getCoinPrice };
