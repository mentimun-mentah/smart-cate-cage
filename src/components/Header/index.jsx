import { Image } from "antd";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";

const Header = ({ onLogout }) => {
  return (
    <>
      <Navbar expand="lg" variant="light" bg="light">
        <Container>
          <Navbar.Brand href="/" className="pb-0">
            <Image
              src="/logo.png"
              preview={false}
              height={60}
              width={170}
              alt="logo"
            />
          </Navbar.Brand>
          <Nav className="ml-auto">
            <Nav.Link onClick={onLogout}>Logout</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
