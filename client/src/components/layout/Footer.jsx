import { Container } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="mb-3 mb-md-0">
            <h5>Student Course Registration System</h5>
            <p className="mb-0">Manage your courses with ease</p>
          </div>
          <div className="text-center text-md-end">
            <p className="mb-0">&copy; {currentYear} All Rights Reserved</p>
            <p className="mb-0">COMP308 Lab Assignment</p>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
