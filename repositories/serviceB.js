let nodefetch = require('node-fetch');

let { timeout, TimeoutError } = require('../utils/timeout');

let URL = 'http://localhost:8080/servico-b';

async function getCoinPrice({ coin }) {
  try {
    let req = await Promise.race([timeout(5), nodefetch(`${URL}/cotacao?curr=${coin.toUpperCase()}`)]);
    let json = await req.json();
    let payload = {
      value: json.cotacao.valor / json.cotacao.fator,
      tag: 'serviceB',
    };
    return { ok: true, payload };
  } catch (err) {
    let error;
    if (err instanceof TimeoutError) {
      error = new TimeoutError('ServiceB Timeout');
    } else {
      error = new Error('Something wrong happened');
    }
    throw error;
  }
}

module.exports = { getCoinPrice };
