let dotenv = require('dotenv');
let express = require('express');

dotenv.config();

let { PORT, DEFAUL_COIN, URL_CALLBACK_SERVICE_C } = process.env;

let serviceA = require('./repositories/serviceA');
let serviceB = require('./repositories/serviceB');
let serviceC = require('./repositories/serviceC');

let app = express();

app.use(express.json());

/**
 * curl \
 *  --request POST \
 *  --header 'Content-Type:application/json' \
 *  --data '{"tipo":"USD","callback":"http://host.docker.internal:4000/webhook/service-c"}' \
 *  http://localhost:8080/servico-c/cotacao
 */
app.post('/webhook/service-c', (req, res) => {
  serviceC.events.emit(`serviceC.events.${req.body.cid}`, req.body);
  res.json({ ok: true });
});

/**
 * curl http://localhost:4000/cotacoes/usd
 */
app.get('/cotacoes/:coin', (req, res) => {
  let reqCoinSlug = req.params.coin.toUpperCase();
  Promise.allSettled([
    serviceA.getCoinPrice({ coin: reqCoinSlug }),
    serviceB.getCoinPrice({ coin: reqCoinSlug }),
    serviceC.getCoinPrice({ coin: reqCoinSlug, callback: URL_CALLBACK_SERVICE_C }),
  ])
    .then((coinPrices) => {
      console.log('[HEXCHANGE] ********** Services Results:');
      console.log(JSON.stringify(coinPrices, null, 2));
      console.log('[HEXCHANGE] ****************************');
      let payload = coinPrices.reduce(
        (acc, curr) => {
          if (curr.status === 'fulfilled') {
            let { payload } = curr.value;
            if (acc.cotacao === null || acc.cotacao > payload.value) {
              acc.cotacao = payload.value;
              acc.tag = payload.tag;
            }
          }
          return acc;
        },
        {
          cotacao: null,
          moeda: reqCoinSlug,
          comparativo: DEFAUL_COIN,
          tag: null,
        }
      );
      res.json({ ok: true, payload });
    })
    .catch((error) => {
      res.json({ ok: false, error });
    });
});

app.listen(Number(PORT), () => {
  console.log(`Running at [::]//${PORT}`);
});
