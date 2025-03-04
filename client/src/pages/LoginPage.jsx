import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col md={6}>
          <Card>
            <Card.Body>
              <LoginForm />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
