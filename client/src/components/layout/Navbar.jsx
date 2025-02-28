import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4 shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="fas fa-graduation-cap me-2"></i>
          Student Course System
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/">Home</Nav.Link>
            {user && (
              <>
                <Nav.Link as={NavLink} to="/courses">Courses</Nav.Link>
                <Nav.Link as={NavLink} to="/students">Students</Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav>
            {user ? (
              <>
                <Nav.Link as={NavLink} to="/profile" className="me-2">
                  <i className="fas fa-user me-1"></i> My Profile
                </Nav.Link>
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login" className="me-2">
                  Login
                </Nav.Link>
                <Nav.Link as={NavLink} to="/register">
                  <Button variant="outline-light">Register</Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
