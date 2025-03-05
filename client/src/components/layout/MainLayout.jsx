import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import NavBar from "./NavBar";
import Footer from "./Footer";

const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavBar />
      <main className="flex-grow-1">
        <Container className="py-4">
          <Outlet />
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
