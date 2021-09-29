const fs = require('fs')
const WebSocket = require('ws')
const cron = require("node-schedule")
const bodyParser = require("body-parser");
const express = require("express");
const redis = require("redis");
const cors = require("cors");
const app = express();

const port = 3006;
const redisPort = 6379;
const client = redis.createClient(redisPort, { host: "redis-server" });

const onRestartServer = () => {
  fs.appendFile('index.js', '//', (err) => {
    if(err) throw err;
    else console.log('reloaded')
  })
}

app.use(cors());
app.use(bodyParser.json());

client.on("error", (err) => {
  console.log("REDIS ERROR ".repeat(5));
  console.log(err);
  console.log("REDIS ERROR ".repeat(5));
});

const ipwebsocket = '192.168.18.176'
const wsURL = `ws://${ipwebsocket}:81`

const ws = new WebSocket(wsURL)
ws.on('open', function open() {
  console.log('ws server connected');
  ws.send(Date.now());
});

const createWebSocketConnection = (endpoint) => {
  console.log(endpoint)
  // ws = new WebSocket(endpoint)
  // ws.on('open', function open() {
  //   console.log('ws server connected');
  //   ws.send(Date.now());
  // });
  // return ws
}

app.post("/set-ip-websocket", (req, res) => {
  if(Object.keys(req.body).length) {
    createWebSocketConnection(req?.body?.ipws)
    for(let [key, value] of Object.entries(req.body)) {
      console.log(key, ':', value)
      client.set(key, value, redis.print)
    }
    res.status(200).send({
      message: "Success setting ip websocket"
    })
  } 
  else {
    res.status(200).send({
      message: "Ip websocket undefined"
    })
  onRestartServer()
  }
})

app.post("/setting", (req, res) => {
  if(Object.keys(req.body).length) {
    for(let [key, value] of Object.entries(req.body)) {
      console.log(key, ':', value)
      client.set(key, value, redis.print)
    }
    res.status(200).send({
      message: "Success set automatic time"
    })
  } 
  else {
    client.flushdb((err, resKey) => {
      console.log(resKey); // will be true if successfull
      res.status(200).send({
        message: "Success disabled automatic time"
      })
    });
  }
  onRestartServer()
});

app.get("/get-setting", async (req, res) => {
  client.keys('*', (err, keys) => {
    if(err) return console.log(err);
    if(keys) {
      let datas = {};
      keys.map(key => {
        return client.get(key, (err, resKey) => {
          if(err) return console.log(err);
          datas = {
            ...datas,
            [key]: resKey
          }
          if(Object.keys(datas).length === keys.length) {
            res.status(200).send(datas);
          }
        })
      })
    }
  });

})

app.listen(port, () => {
  console.log(`Node server started on port: ${port}`);
});

const logFunc = (val, key) => {
  const h = val?.split(":")[0]
  const m = val?.split(":")[1]

  setCronJob({h: h, m: m, key: key})
}

const getRedisValue = (key) => {
  client.get(key, (err, res) => {
    if(err) throw err
    logFunc(res, key)
  })
}

getRedisValue('eatMorningTime')
getRedisValue('eatAfternoonTime')
getRedisValue('drinkMorningTime')
getRedisValue('drinkAfternoonTime')

const sendWsHandler = (data) => { ws.send(data) }

const onSetDrinkHandler = () => {
  if(ws && ws.send && ws.readyState === 1) {
    console.log("=> sending ws data water")
    sendWsHandler(`water:on`)
    setTimeout(() => {
      sendWsHandler(`water:off`)
    }, 2000)
  }
  else {
    console.log("=> ws not connected")
  }
}

const onSetEatHandler = () => {
  if(ws && ws.send && ws.readyState === 1) {
    console.log("=> sending ws data eat")
    sendWsHandler(`eat:on`)
    setTimeout(() => {
      sendWsHandler(`eat:off`)
    }, 5000)
  }
  else {
    console.log("=> ws not connected")
  }
}

const automaticWsSendHandler = key => {
  switch(key) {
    case 'drinkMorningTime':
      return onSetDrinkHandler()
    case 'drinkAfternoonTime':
      return onSetDrinkHandler()
    case 'eatMorningTime':
      return onSetEatHandler()
    case 'eatAfternoonTime':
      return onSetEatHandler()

    default:
      return
  }
}

const setCronJob = ({ m="*", h="*", key }) => {
  const job = {hour: h, minute: m, tz: 'Asia/Kuala_Lumpur'}

  cron.scheduleJob(job, () => {
    console.log(new Date(), key);
    console.log("")
    automaticWsSendHandler(key)
  });
}
////////////////////
