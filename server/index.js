const fs = require('fs')
const cron = require("node-schedule")
const bodyParser = require("body-parser");
const express = require("express");
const redis = require("redis");
const cors = require("cors");
const app = express();

const port = 3006;
const redisPort = 6379;
const client = redis.createClient(redisPort, { host: "redis-server" });

app.use(cors());
app.use(bodyParser.json());

client.on("error", (err) => {
  console.log("REDIS ERROR ".repeat(5));
  console.log(err);
  console.log("REDIS ERROR ".repeat(5));
});

app.post("/setting", (req, res) => {
  console.log()
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
  fs.appendFile('index.js', '//', (err) => {
    if(err) throw err;
    else console.log('reloaded')
  })
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

const setCronJob = ({ m="*", h="*", key }) => {
  const job = {hour: h, minute: m, tz: 'Asia/Kuala_Lumpur'}

  cron.scheduleJob(job, () => {
    console.log(new Date(), key);
    console.log("")
  });
}
