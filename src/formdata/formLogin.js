import isEmpty from "validator/lib/isEmpty";
import isEqual from "validator/lib/equals";
import isEmail from "validator/lib/isEmail";
import isIP from "validator/lib/isIP";

const EMAIL = process.env.REACT_APP_EMAIL;
const PASSWORD = process.env.REACT_APP_PASSWORD;

export const formLogin = {
  email: { value: "", isValid: true, message: null },
  password: { value: "", isValid: true, message: null },
  ipwebsocket: { value: "", isValid: true, message: null },
};

export const formLoginIsValid = (state, setState) => {
  const email = { ...state.email };
  const password = { ...state.password };
  const ipwebsocket = { ...state.ipwebsocket };
  let isGood = true;

  if (!isEmail(email.value)) {
    isGood = false;
    email.isValid = false;
    email.message = "Email tidak valid";
  }

  if (!isEqual(email.value, EMAIL)) {
    isGood = false;
    email.isValid = false;
    email.message = "Email tidak terdaftar";
  }

  if (isEmpty(password.value, { ignore_whitespace: true })) {
    isGood = false;
    password.isValid = false;
    password.message = "Kolom tidak boleh kosong";
  }

  if (!isEqual(password.value, PASSWORD)) {
    isGood = false;
    password.isValid = false;
    password.message = "Password salah";
  }

  if (isEmpty(ipwebsocket.value, { ignore_whitespace: true })) {
    isGood = false;
    ipwebsocket.isValid = false;
    ipwebsocket.message = "Masukan Ip Smart Cat Cage";
  }

  if (!isIP(ipwebsocket.value)) {
    isGood = false;
    ipwebsocket.isValid = false;
    ipwebsocket.message = "IP tidak valid";
  }

  if (!isGood) setState({ ...state, email, password, ipwebsocket });

  return isGood;
};
