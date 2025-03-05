import React, { useState } from "react";
import {
  Container,
  Alert,
  Button,
  Row,
  Col,
  Card,
  Badge,
  ListGroup,
  Modal,
  Form,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useAuth } from "../hooks/useAuth";

// Query: GetCourse
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
        email
        studentNumber
        program
      }
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

// Mutation: AddCourseToStudent
const ADD_COURSE_TO_STUDENT = gql`
  mutation AddCourseToStudent($studentId: ID!, $courseId: ID!) {
    addCourseToStudent(studentId: $studentId, courseId: $courseId) {
      id
      firstName
      lastName
      courses {
        id
        courseName
      }
    }
  }
`;

// Mutation: RemoveCourseFromStudent
const REMOVE_COURSE_FROM_STUDENT = gql`
  mutation RemoveCourseFromStudent($studentId: ID!, $courseId: ID!) {
    removeCourseFromStudent(studentId: $studentId, courseId: $courseId) {
      id
      firstName
      lastName
      courses {
        id
        courseName
      }
    }
  }
`;

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    courseName: "",
    section: "",
    semester: "",
  });

  const { loading, error, data, refetch } = useQuery(GET_COURSE, {
    variables: { id },
    onCompleted: (data) => {
      setFormData({
        courseName: data.course.courseName,
        section: data.course.section,
        semester: data.course.semester,
      });
    },
  });

  const [updateCourse] = useMutation(UPDATE_COURSE);
  const [deleteCourse] = useMutation(DELETE_COURSE);
  const [addCourseToStudent] = useMutation(ADD_COURSE_TO_STUDENT);
  const [removeCourseFromStudent] = useMutation(REMOVE_COURSE_FROM_STUDENT);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      await updateCourse({
        variables: {
          id,
          input: formData,
        },
      });

      setIsEditing(false);
      refetch();
    } catch (err) {
      console.error("Error updating course:", err.message);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      const { data } = await deleteCourse({
        variables: { id },
      });

      if (data.deleteCourse) {
        navigate("/admin/courses");
      }
    } catch (err) {
      console.error("Error deleting course:", err.message);
    }
  };

  const [errorMessage, setErrorMessage] = useState("");

  const handleEnroll = async () => {
    setErrorMessage("");

    if (!user || !user.id) {
      setErrorMessage("You must be logged in to enroll in a course");
      console.error("User not authenticated");
      return;
    }

    try {
      console.log("Full user object:", user);
      console.log("Enrolling with user ID:", user.id, typeof user.id);
      console.log("Course ID:", id, typeof id);
      await addCourseToStudent({
        variables: {
          studentId: user.id,
          courseId: id,
        },
      });

      refetch();
    } catch (err) {
      console.error("Error enrolling in course:", err);
      setErrorMessage(`Error enrolling in course: ${err.message}`);
    }
  };

  const handleUnenroll = async () => {
    setErrorMessage("");

    if (!user || !user.id) {
      setErrorMessage("You must be logged in to unenroll from a course");
      console.error("User not authenticated");
      return;
    }

    try {
      console.log("Unenrolling with user ID:", user.id);
      await removeCourseFromStudent({
        variables: {
          studentId: user.id,
          courseId: id,
        },
      });

      refetch();
    } catch (err) {
      console.error("Error unenrolling from course:", err);
      setErrorMessage(`Error unenrolling from course: ${err.message}`);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await removeCourseFromStudent({
        variables: {
          studentId: studentId,
          courseId: id,
        },
      });

      refetch();
    } catch (err) {
      console.error("Error removing student from course:", err.message);
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
        <Alert variant="danger">{error.message || "Error loading course details"}</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Container>
    );
  }

  if (errorMessage) {
    setTimeout(() => setErrorMessage(""), 5000);
  }

  if (!data || !data.course) {
    return (
      <Container>
        <Alert variant="warning">Course not found</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </Container>
    );
  }

  const course = data.course;
  const isEnrolled = course.students.some((student) => student.id === user?.id);

  return (
    <Container>
      {errorMessage && (
        <Alert
          variant="danger"
          className="mt-3 mb-3"
          dismissible
          onClose={() => setErrorMessage("")}
        >
          {errorMessage}
        </Alert>
      )}
      <Button variant="secondary" className="mb-3" onClick={() => navigate(-1)}>
        &laquo; Back to Courses
      </Button>

      <Row className="mb-4 align-items-center">
        <Col>
          <h1>{course.courseName}</h1>
          <h5>
            <Badge bg="secondary">{course.courseCode}</Badge>
          </h5>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          {user &&
            user.role !== "admin" &&
            (isEnrolled ? (
              <Button variant="outline-danger" onClick={handleUnenroll}>
                Unenroll from Course
              </Button>
            ) : (
              <Button variant="success" onClick={handleEnroll}>
                Enroll in Course
              </Button>
            ))}

          {user && user.role === "admin" && (
            <>
              <Button
                variant="outline-primary"
                className="me-2"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit"}
              </Button>

              {!isEditing && (
                <Button variant="outline-danger" onClick={() => setShowDeleteConfirm(true)}>
                  Delete
                </Button>
              )}
            </>
          )}
        </Col>
      </Row>

      {isEditing ? (
        <Card className="mb-4">
          <Card.Header>Edit Course</Card.Header>
          <Card.Body>
            <Form onSubmit={handleUpdateCourse}>
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

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      ) : (
        <Card className="mb-4">
          <Card.Header>Course Details</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p>
                  <strong>Course Code:</strong> {course.courseCode}
                </p>
                <p>
                  <strong>Course Name:</strong> {course.courseName}
                </p>
              </Col>
              <Col md={6}>
                <p>
                  <strong>Section:</strong> {course.section}
                </p>
                <p>
                  <strong>Semester:</strong> {course.semester}
                </p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Enrolled Students ({course.students.length})</span>
        </Card.Header>
        <ListGroup variant="flush">
          {course.students.length === 0 ? (
            <ListGroup.Item className="text-muted">
              No students enrolled in this course yet.
            </ListGroup.Item>
          ) : (
            course.students.map((student) => (
              <ListGroup.Item
                key={student.id}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <div>
                    {student.firstName} {student.lastName}
                  </div>
                  <div className="text-muted small">
                    {student.studentNumber} | {student.email}
                  </div>
                </div>
                {user && user.role === "admin" && (
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleRemoveStudent(student.id)}
                  >
                    Remove
                  </Button>
                )}
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the course "{course.courseName}"? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              handleDeleteCourse();
              setShowDeleteConfirm(false);
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CourseDetailsPage;
