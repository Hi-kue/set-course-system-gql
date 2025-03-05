import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";

const LoginPage = () => {
  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col md={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Student Login</h4>
            </Card.Header>
            <Card.Body>
              <LoginForm />
            </Card.Body>
            <Card.Footer className="text-center">
              <div className="mt-3">
                <p>Are you an administrator?</p>
                <Link to="/admin/login">
                  <Button variant="outline-primary">Go to Admin Login</Button>
                </Link>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
