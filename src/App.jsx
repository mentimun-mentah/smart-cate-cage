import { useState } from 'react'
import { Row, Col, Form, notification, Switch } from "antd";

import isEqual from "validator/lib/equals";
import isEmpty from "validator/lib/isEmpty";
import Container from "react-bootstrap/Container";
import ReconnectingWebSocket from 'reconnecting-websocket'

import Login from "components/Login";
import Header from "components/Header";

import { formLogin, formLoginIsValid } from "formdata/formLogin";

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
