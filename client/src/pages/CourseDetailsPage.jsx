import React, { useState, useEffect } from 'react';
import { Container, Alert, Button, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import CourseDetail from '../components/courses/CourseDetail';
import CourseForm from '../components/courses/CourseForm';
import { useAuth } from '../hooks/useAuth';

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch(`/api/courses/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setCourse(data.course);
        } else {
          setError(data.error || 'Failed to fetch course details');
        }
      } catch (err) {
        setError('Error fetching course details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleUpdateCourse = async (updatedData) => {
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCourse(data.course);
        setIsEditing(false);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Failed to update course. Please try again.' };
    }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        navigate('/courses');
      } else {
        setError(data.error || 'Failed to delete course');
      }
    } catch (err) {
      setError('Error deleting course. Please try again later.');
      console.error(err);
    }
  };

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

  if (!course) {
    return (
      <Container>
        <Alert variant="warning">Course not found</Alert>
        <Button variant="secondary" onClick={() => navigate('/courses')}>Back to Courses</Button>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>Course Details</h1>
        </Col>
        <Col xs="auto">
          <Button 
            variant="secondary" 
            className="me-2" 
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          
          {user && user.role === 'admin' && (
            <>
              <Button
                variant="outline-primary"
                className="me-2"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
              
              {!isEditing && (
                <Button
                  variant="outline-danger"
                  onClick={handleDeleteCourse}
                >
                  Delete
                </Button>
              )}
            </>
          )}
        </Col>
      </Row>

      {isEditing && user && user.role === 'admin' ? (
        <CourseForm
          initialData={course}
          onSubmit={handleUpdateCourse}
          isEditing={true}
        />
      ) : (
        <CourseDetail 
          course={course} 
          isAdmin={user && user.role === 'admin'} 
        />
      )}
    </Container>
  );
};

export default CourseDetailsPage;
