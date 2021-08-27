import { useState, useEffect } from 'react'
import { Row, Col, Form, notification, Switch, TimePicker, Button } from "antd";

import axios from 'axios'
import moment from 'moment'
import isEqual from "validator/lib/equals";
import isEmpty from "validator/lib/isEmpty";
import Container from "react-bootstrap/Container";
import ReconnectingWebSocket from 'reconnecting-websocket'

import Login from "components/Login";
import Header from "components/Header";

import { formLogin, formLoginIsValid } from "formdata/formLogin";

const URL = 'http://192.168.1.59:3006'
const EMAIL = process.env.REACT_APP_EMAIL;
const PASSWORD = process.env.REACT_APP_PASSWORD;

const App = () => {
  const [login, setLogin] = useState(formLogin);
  const [isLogin, setIsLogin] = useState(false)
  const [ws, setWs] = useState({})
  const [water, setWater] = useState(false)
  const [eat, setEat] = useState(false)
  const [eatLeft, setEatLeft] = useState(false)
  const [sandIn, setSandIn] = useState(false)
  const [sandOut, setSandOut] = useState(false)
  const [eatTime, setEatTime] = useState(["", ""])
  const [drinkTime, setDrinkTime] = useState(["", ""])

  const { email, password, ipwebsocket } = login;

  // Fungsi untuk mengubah value untuk login
  const inputChangeHandler = e => {
    const name = e.target.name
    const value = e.target.value

    // Ngecek jika value kosong
    if(isEmpty(value || "", { ignore_whitespace: true })){
      const data = {
        ...login,
        [name]: { ...login[name], value: value, isValid: false, message: "Kolom tidak boleh kosong", },
      };
      setLogin(data);
    } else {
      // set data ke state
      const data = {
        ...login,
        [name]: { ...login[name], value: value, isValid: true, message: null, },
      };
      setLogin(data);
    }
  }

  // fungsi tombol untuk login dan koneksi ke web socket
  const submitLoginHandler = () => {
    // ngecek jika value untuk login sudah tervalidasi
    if(formLoginIsValid(login, setLogin)){
      // jika value sudah sesuai
      if(isEqual(email.value, EMAIL) && isEqual(password.value, PASSWORD)){
        console.log("Connecting to " + ipwebsocket.value)
        notification.success({
          message: "Success",
          description: "Selamat datang di Smart Cat Cage",
        });
        setIsLogin(true);
        const wsURL = `ws://${ipwebsocket.value}:81`
        const dataWs = new ReconnectingWebSocket(wsURL)
        setWs(dataWs)

        const ipws = { ipws: `ws://${ipwebsocket.value}:81` }

        axios.post(URL+'/set-ip-websocket', ipws)
          .then(res => { console.log(res?.data) })
          .catch(err => { console.log(err?.response) })
      }
    }
  }

  const sendWsHandler = (data) => { ws.send(data) }

  const onWaterChange = val => {
    if(ws && ws.send && ws.readyState === 1) {
      setWater(val)
      sendWsHandler(`water:${val ? 'on' : 'off'}`)
    }
  }

  const onEatChange = val => {
    if(ws && ws.send && ws.readyState === 1) {
      setEat(val)
      sendWsHandler(`eat:${val ? 'on' : 'off'}`)
    }
  }

  const onEatLeftChange = val => {
    if(ws && ws.send && ws.readyState === 1) {
      setEatLeft(val)
      sendWsHandler(`eat_left:${val ? 'on' : 'off'}`)
    }
  }

  const onSandInChange = val => {
    if(ws && ws.send && ws.readyState === 1) {
      setSandIn(val)
      sendWsHandler(`sand_in:${val ? 'on' : 'off'}`)
    }
  }

  const onSandOutChange = val => {
    if(ws && ws.send && ws.readyState === 1) {
      setSandOut(val)
      sendWsHandler(`sand_out:${val ? 'on' : 'off'}`)
    }
  }

  const onTimeChangeHandler = (time, setState) => {
    if(time) {
      setState(time)
    } else {
      setState(["", ""])
    }
  }

  const onSaveAutomaticHandler = e => {
    e.preventDefault()
    let data = {}

    if(moment(eatTime[0]).isValid() && moment(eatTime[1]).isValid()) {
      data = {
        ...data,
        eatMorningTime: moment(eatTime[0]).format("H:m"),
        eatAfternoonTime: moment(eatTime[1]).format("H:m"),
      }
    }

    if(moment(drinkTime[0]).isValid() && moment(drinkTime[1]).isValid()) {
      data = {
        ...data,
        drinkMorningTime: moment(drinkTime[0]).format("H:m"),
        drinkAfternoonTime: moment(drinkTime[1]).format("H:m"),
      }
    }

    axios.post(URL+'/setting', data)
      .then(res => {
        console.log("res: ", res.data)
      })
      .catch(err => {
        console.log("err:", err)
      })
  }

  useEffect(() => {
    axios.get(URL+'/get-setting')
      .then(res => {
        let resEatTime = []
        let resDrinkTime = []
        for(let [key, value] of Object.entries(res.data)) {
          if(key === "eatMorningTime") resEatTime.push(value)
          if(key === "eatAfternoonTime") resEatTime.push(value)
          if(key === "drinkMorningTime") resDrinkTime.push(value)
          if(key === "drinkAfternoonTime") resDrinkTime.push(value)
        }
        setEatTime(resEatTime)
        setDrinkTime(resDrinkTime)
      })
      .catch(err => {
        console.log("err:", err)
      })
  }, [])


  return (
    <>
      <Row gutter={[0, 0]} justify="center">
        <Col xxl={10} xl={10} lg={12} md={24} sm={24} xs={24}>
          {isLogin ? (
            <>
              <Header onLogout={() => setIsLogin(false)} />
              <Container>
                <Row gutter={[0, 0]} justify="center">
                  <Col xxl={10} xl={10} lg={12} md={24} sm={24} xs={24}>
                    <Form layout="vertical" className="mt-5">
                      <Form.Item className="text-center">
                        <p className="text-center fw-bold">Memberi Minum</p>
                        <Switch 
                          checkedChildren="On" 
                          unCheckedChildren="Off" 
                          checked={water} 
                          onChange={onWaterChange} 
                        />
                      </Form.Item>
                      <Form.Item className="text-center">
                        <p className="text-center fw-bold">Memberi Makan</p>
                        <Switch 
                          checkedChildren="On"
                          unCheckedChildren="Off"
                          checked={eat} 
                          onChange={onEatChange} 
                        />
                      </Form.Item>
                      <Form.Item className="text-center">
                        <p className="text-center fw-bold">Ganti Pasir</p>
                        <Switch 
                          checkedChildren="On"
                          unCheckedChildren="Off"
                          checked={eatLeft} 
                          onChange={onEatLeftChange} 
                        />
                      </Form.Item>
                      <Form.Item className="text-center">
                        <p className="text-center fw-bold">Buang Sisa Makanan</p>
                        <Switch 
                          checkedChildren="On"
                          unCheckedChildren="Off"
                          checked={sandIn} 
                          onChange={onSandInChange} 
                        />
                      </Form.Item>
                      <Form.Item className="text-center">
                        <p className="text-center fw-bold">Buang Pasir</p>
                        <Switch 
                          checkedChildren="On"
                          unCheckedChildren="Off"
                          checked={sandOut} 
                          onChange={onSandOutChange} 
                        />
                      </Form.Item>
                    </Form>
                  </Col>
                </Row>
              </Container>

              <hr />

              <Container>
                <Row gutter={[0, 0]} justify="center">
                  <Col xxl={10} xl={10} lg={12} md={24} sm={24} xs={24}>
                    <Form layout="vertical" className="mt-3">
                      <Form.Item className="text-center">
                        <p className="text-center fw-bold">Memberi Makan Otomatis</p>
                        <TimePicker.RangePicker
                          format="HH:mm"
                          inputReadOnly
                          placeholder={['Pagi', 'Sore']}
                          value={[
                            moment(eatTime?.[0], `H:m`).isValid() ? moment(eatTime[0], `H:m`) : "", 
                            moment(eatTime?.[1], `H:m`).isValid() ? moment(eatTime[1], `H:m`) : "", 
                          ]}
                          onChange={val => onTimeChangeHandler(val, setEatTime)}
                        />
                      </Form.Item>

                      <Form.Item className="text-center">
                        <p className="text-center fw-bold">Memberi Minum Otomatis</p>
                        <TimePicker.RangePicker
                          format="HH:mm"
                          inputReadOnly
                          placeholder={['Pagi', 'Sore']}
                          value={[
                            moment(drinkTime?.[0] || "", `H:m`).isValid() ? moment(drinkTime[0], `H:m`) : "", 
                            moment(drinkTime?.[1] || "", `H:m`).isValid() ? moment(drinkTime[1], `H:m`) : "", 
                          ]}
                          onChange={val => onTimeChangeHandler(val, setDrinkTime)}
                        />
                      </Form.Item>

                      <Form.Item className="text-center">
                        <Button type="primary" onClick={onSaveAutomaticHandler}>
                          Simpan
                        </Button>
                      </Form.Item>
                    </Form>
                  </Col>
                </Row>
              </Container>

            </>
          ) : (
            <Login 
              state={login}
              onLogin={submitLoginHandler} 
              onChange={inputChangeHandler}
            />
          )}
        </Col>
      </Row>
    </>
  );
};

export default App;
