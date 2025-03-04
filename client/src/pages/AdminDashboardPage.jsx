import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminDashboardPage = () => {
  const { user } = useAuth();

  if (!user || !user.isAdmin) {
    return (
      <Container className="mt-5">
        <div className="alert alert-danger">
          <h4>Access Denied</h4>
          <p>You must be logged in as an administrator to view this page.</p>
          <Link to="/admin/login" className="btn btn-primary">
            Go to Admin Login
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Admin Dashboard</h1>
          <p className="lead">Welcome, {user.username || user.email}</p>
        </Col>
      </Row>

      <Row>
        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Courses</Card.Title>
              <Card.Text>Manage course listings, details, and enrollment.</Card.Text>
              <Link to="/courses">
                <Button variant="primary">Manage Courses</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Students</Card.Title>
              <Card.Text>View and manage student accounts and registrations.</Card.Text>
              <Link to="/students">
                <Button variant="primary">Manage Students</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Admin Accounts</Card.Title>
              <Card.Text>Create and manage administrator accounts.</Card.Text>
              <div className="d-flex gap-2">
                <Link to="/admin/accounts">
                  <Button variant="primary">Manage Admins</Button>
                </Link>
                <Link to="/admin/create">
                  <Button variant="outline-primary">Create Admin</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Reports</Card.Title>
              <Card.Text>Generate and view reports on course enrollments and student data.</Card.Text>
              <Link to="/admin/reports">
                <Button variant="primary">View Reports</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>System Settings</Card.Title>
              <Card.Text>Configure system settings and parameters.</Card.Text>
              <Link to="/admin/settings">
                <Button variant="primary">System Settings</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboardPage;
