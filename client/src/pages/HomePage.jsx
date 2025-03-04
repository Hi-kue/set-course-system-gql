import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1 className="mb-3">Welcome to Course Registration System</h1>
          {user && (
            <Card className="bg-light mb-4">
              <Card.Body>
                <Card.Title>Hello, {user.name || user.email}</Card.Title>
                <Card.Text>
                  {user.role === 'admin' 
                    ? 'You are logged in as an administrator. You can manage courses and students.' 
                    : 'You are logged in as a student. You can browse and register for courses.'}
                </Card.Text>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
      
      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Courses</Card.Title>
              <Card.Text>
                Browse and explore available courses.
              </Card.Text>
              <Link to="/courses">
                <Button variant="primary">View Courses</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        {user && user.role === 'student' && (
          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>My Profile</Card.Title>
                <Card.Text>
                  View and manage your profile and enrolled courses.
                </Card.Text>
                <Link to="/profile">
                  <Button variant="primary">Go to Profile</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        )}
        
        {user && user.role === 'admin' && (
          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>Students</Card.Title>
                <Card.Text>
                  Manage student information and registrations.
                </Card.Text>
                <Link to="/students">
                  <Button variant="primary">View Students</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default HomePage;
