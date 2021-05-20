import { useState } from 'react'
import { Row, Col, Button, Form, notification } from "antd";

import isEqual from "validator/lib/equals";
import isEmpty from "validator/lib/isEmpty";
import Container from "react-bootstrap/Container";

import Login from "components/Login";
import Header from "components/Header";

import { formLogin, formLoginIsValid } from "formdata/formLogin";

const EMAIL = process.env.REACT_APP_EMAIL;
const PASSWORD = process.env.REACT_APP_PASSWORD;

const App = () => {
  const [login, setLogin] = useState(formLogin);
  const [isLogin, setIsLogin] = useState(false)

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
        console.log("Connected to " + ipwebsocket)
        notification.success({
          message: "Success",
          description: "Selamat datang di Smart Cat Cage",
        });
        setIsLogin(true);
      }
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
                        <Button type="primary" block>
                          Memberi Minum
                        </Button>
                      </Form.Item>
                      <Form.Item className="text-center">
                        <Button type="primary" block>
                          Memberi Makan
                        </Button>
                      </Form.Item>
                      <Form.Item className="text-center">
                        <Button type="primary" block>
                          Buang Sisa Makanan
                        </Button>
                      </Form.Item>
                      <Form.Item className="text-center">
                        <Button type="primary" block>
                          Ganti Pasir
                        </Button>
                      </Form.Item>
                      <Form.Item className="text-center">
                        <Button type="primary" block>
                          Buang Pasir
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
