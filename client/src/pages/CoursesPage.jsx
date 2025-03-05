import React, { useState } from "react";
import { Container, Button, Row, Col, Alert, Card, Form, Modal } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useAuth } from "../hooks/useAuth";

// Query: GetCourses
const GET_COURSES = gql`
  query GetCourses {
    courses {
      id
      courseCode
      courseName
      section
      semester
      students {
        id
        firstName
        lastName
      }
    }
  }
`;

// Mutation: CreateCourse
const CREATE_COURSE = gql`
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(input: $input) {
      id
      courseCode
      courseName
      section
      semester
    }
  }
`;

// Mutation: UpdateCourse
const UPDATE_COURSE = gql`
  mutation UpdateCourse($id: ID!, $input: UpdateCourseInput!) {
    updateCourse(id: $id, input: $input) {
      id
      courseName
      section
      semester
    }
  }
`;

// Mutation: DeleteCourse
const DELETE_COURSE = gql`
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`;

const CoursesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    section: "",
    semester: "",
  });
  const { loading, error, data, refetch } = useQuery(GET_COURSES);
  const [createCourse] = useMutation(CREATE_COURSE);
  const [updateCourse] = useMutation(UPDATE_COURSE);
  const [deleteCourse] = useMutation(DELETE_COURSE);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      await createCourse({
        variables: {
          input: formData,
        },
      });

      // Reset form and refetch courses
      setFormData({
        courseCode: "",
        courseName: "",
        section: "",
        semester: "",
      });
      setShowAddForm(false);
      refetch();
    } catch (err) {
      console.error("Error creating course:", err.message);
    }
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    try {
      await updateCourse({
        variables: {
          id: selectedCourse.id,
          input: {
            courseName: formData.courseName,
            section: formData.section,
            semester: formData.semester,
          },
        },
      });

      setShowEditModal(false);
      refetch();
    } catch (err) {
      console.error("Error updating course:", err.message);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await deleteCourse({
        variables: {
          id: selectedCourse.id,
        },
      });

      setShowDeleteModal(false);
      refetch();
    } catch (err) {
      console.error("Error deleting course:", err.message);
    }
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setFormData({
      courseCode: course.courseCode,
      courseName: course.courseName,
      section: course.section,
      semester: course.semester,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (course) => {
    setSelectedCourse(course);
    setShowDeleteModal(true);
  };

  return (
    <Container>
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>Courses</h1>
        </Col>
        {user && (user.isAdmin || user.role === "admin") && (
          <Col xs="auto">
            <Button variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? "Cancel" : "Add New Course"}
            </Button>
          </Col>
        )}
      </Row>

      {error && <Alert variant="danger">{error.message || "Error loading courses"}</Alert>}

      {showAddForm && user && (user.isAdmin || user.role === "admin") && (
        <Card className="mb-4">
          <Card.Header>Add New Course</Card.Header>
          <Card.Body>
            <Form onSubmit={handleAddCourse}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Course Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="courseCode"
                      value={formData.courseCode}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Course Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="courseName"
                      value={formData.courseName}
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Create Course
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {data &&
            data.courses.map((course) => (
              <div className="col" key={course.id}>
                <Card className="h-100">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span>{course.courseCode}</span>
                    {user && (user.isAdmin || user.role === "admin") && (
                      <div className="btn-group btn-group-sm">
                        <Button variant="outline-secondary" onClick={() => openEditModal(course)}>
                          Edit
                        </Button>
                        <Button variant="outline-danger" onClick={() => openDeleteModal(course)}>
                          Delete
                        </Button>
                      </div>
                    )}
                  </Card.Header>
                  <Card.Body>
                    <Card.Title>{course.courseName}</Card.Title>
                    <Card.Text>
                      <strong>Section:</strong> {course.section}
                      <br />
                      <strong>Semester:</strong> {course.semester}
                      <br />
                      <strong>Students:</strong> {course.students?.length || 0}
                    </Card.Text>
                    <Link to={`/courses/${course.id}`} className="btn btn-primary">
                      View Details
                    </Link>
                  </Card.Body>
                </Card>
              </div>
            ))}
        </div>
      )}

      {/* Edit Course Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditCourse}>
            <Form.Group className="mb-3">
              <Form.Label>Course Code</Form.Label>
              <Form.Control type="text" value={formData.courseCode} disabled />
              <Form.Text className="text-muted">Course code cannot be changed</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Course Name</Form.Label>
              <Form.Control
                type="text"
                name="courseName"
                value={formData.courseName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Section</Form.Label>
              <Form.Control
                type="text"
                name="section"
                value={formData.section}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Semester</Form.Label>
              <Form.Control
                type="text"
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete the course <strong>{selectedCourse?.courseName}</strong>{" "}
            ({selectedCourse?.courseCode})?
          </p>
          <p className="text-danger">
            This action cannot be undone and will remove all student enrollments for this course.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteCourse}>
            Delete Course
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CoursesPage;
