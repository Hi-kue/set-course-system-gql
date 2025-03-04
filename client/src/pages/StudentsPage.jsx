import React, { useState, useEffect } from 'react';
import { Container, Alert, Row, Col } from 'react-bootstrap';
import StudentList from '../components/students/StudentList';
import { useAuth } from '../hooks/useAuth';

const StudentsPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setError('You do not have permission to view this page');
      setLoading(false);
      return;
    }

    const fetchStudents = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch('/api/students');
        const data = await response.json();
        
        if (data.success) {
          setStudents(data.students);
        } else {
          setError(data.error || 'Failed to fetch students');
        }
      } catch (err) {
        setError('Error fetching students. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

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
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Students</h1>
        </Col>
      </Row>

      <StudentList students={students} />
    </Container>
  );
};

export default StudentsPage;
