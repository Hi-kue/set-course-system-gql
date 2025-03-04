import React, { useState, useEffect } from 'react';
import { Container, Alert, Button, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import StudentDetail from '../components/students/StudentDetail';
import { useAuth } from '../hooks/useAuth';

const StudentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setError('You do not have permission to view this page');
      setLoading(false);
      return;
    }

    const fetchStudent = async () => {
      try {
        const response = await fetch(`/api/students/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setStudent(data.student);
        } else {
          setError(data.error || 'Failed to fetch student details');
        }
      } catch (err) {
        setError('Error fetching student details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, user]);

  if (loading) {
    return (
      <Container className="text-center p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </Container>
    );
  }

  if (!student) {
    return (
      <Container>
        <Alert variant="warning">Student not found</Alert>
        <Button variant="secondary" onClick={() => navigate('/students')}>Back to Students</Button>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>Student Details</h1>
        </Col>
        <Col xs="auto">
          <Button 
            variant="secondary" 
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </Col>
      </Row>

      <StudentDetail student={student} />
    </Container>
  );
};

export default StudentDetailsPage;
