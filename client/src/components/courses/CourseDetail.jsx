import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, Button, Row, Col, Form, Alert, Spinner, Table, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const GET_COURSE = gql`
  query GetCourse($id: ID!) {
    course(id: $id) {
      id
      courseCode
      courseName
      section
      semester
      students {
        id
        firstName
        lastName
        studentNumber
        email
        program
      }
    }
  }
`;

const UPDATE_COURSE = gql`
  mutation UpdateCourse($id: ID!, $input: UpdateCourseInput!) {
    updateCourse(id: $id, input: $input) {
      id
      courseCode
      courseName
      section
      semester
    }
  }
`;

const DELETE_COURSE = gql`
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`;

const CourseDetail = ({ courseId }) => {
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    courseName: '',
    section: '',
    semester: ''
  });
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  
  const navigate = useNavigate();
  
  const { loading, error, data, refetch } = useQuery(GET_COURSE, {
    variables: { id: courseId },
    onCompleted: (data) => {
      // Initialize form data with existing course data
      setFormData({
        courseName: data.course.courseName,
        section: data.course.section,
        semester: data.course.semester
      });
    }
  });
  
  const [updateCourse, { loading: updating }] = useMutation(UPDATE_COURSE, {
    onCompleted: () => {
      setUpdateSuccess('Course updated successfully!');
      setEditing(false);
      // Clear success message after a few seconds
      setTimeout(() => {
        setUpdateSuccess('');
      }, 5000);
    },
    onError: (error) => {
      setUpdateError(error.message || 'Failed to update course');
    }
  });
  
  const [deleteCourse, { loading: deleting }] = useMutation(DELETE_COURSE, {
    onCompleted: () => {
      navigate('/courses', { state: { message: 'Course deleted successfully!' } });
    },
    onError: (error) => {
      setUpdateError(error.message || 'Failed to delete course');
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess('');
    
    try {
      await updateCourse({
        variables: {
          id: courseId,
          input: formData
        }
      });
      refetch();
    } catch (err) {
      setUpdateError(err.message || 'An error occurred');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCourse({
        variables: {
          id: courseId
        }
      });
    } catch (err) {
      setUpdateError(err.message || 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading course details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        Error loading course: {error.message}
      </Alert>
    );
  }

  if (!data || !data.course) {
    return (
      <Alert variant="warning">
        Course not found
      </Alert>
    );
  }

  const { course } = data;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Course Details</h2>
        <div>
          <Button 
            variant="outline-primary" 
            className="me-2" 
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit Course'}
          </Button>
          <Button 
            variant="outline-danger" 
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Course
          </Button>
        </div>
      </div>

      {updateError && <Alert variant="danger">{updateError}</Alert>}
      {updateSuccess && <Alert variant="success">{updateSuccess}</Alert>}

      <Card className="shadow-sm mb-4">
        <Card.Body>
          {editing ? (
            <Form onSubmit={handleUpdate}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Course Code</Form.Label>
                    <Form.Control
                      type="text"
                      value={course.courseCode}
                      disabled
                    />
                    <Form.Text className="text-muted">
                      Course code cannot be changed
                    </Form.Text>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Course Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="courseName"
                      value={formData.courseName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Section</Form.Label>
                    <Form.Control
                      type="text"
                      name="section"
                      value={formData.section}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Semester</Form.Label>
                    <Form.Control
                      type="text"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button 
                variant="primary" 
                type="submit" 
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update Course'}
              </Button>
            </Form>
          ) : (
            <Row>
              <Col md={6}>
                <h5>Course Information</h5>
                <p><strong>Course Code:</strong> {course.courseCode}</p>
                <p><strong>Course Name:</strong> {course.courseName}</p>
                <p><strong>Section:</strong> {course.section}</p>
                <p><strong>Semester:</strong> {course.semester}</p>
                <p>
                  <Badge bg="primary" className="me-2">
                    {course.students.length} Enrolled Student{course.students.length !== 1 ? 's' : ''}
                  </Badge>
                </p>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      <h4>Enrolled Students</h4>
      {course.students.length === 0 ? (
        <Alert variant="info">
          No students enrolled in this course yet.
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="shadow-sm">
          <thead>
            <tr>
              <th>Student Number</th>
              <th>Name</th>
              <th>Email</th>
              <th>Program</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {course.students.map((student) => (
              <tr key={student.id} className="student-list-item">
                <td>{student.studentNumber}</td>
                <td>{student.firstName} {student.lastName}</td>
                <td>{student.email}</td>
                <td>{student.program}</td>
                <td>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => navigate(`/students/${student.id}`)}
                  >
                    View Profile
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the course "{course.courseName}" ({course.courseCode})?
          <Alert variant="warning" className="mt-3">
            This action cannot be undone. All course registrations will be removed.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete} 
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Course'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CourseDetail;
