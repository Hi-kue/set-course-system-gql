import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Card, Button, Row, Col, Form, Alert, Spinner, Table, Badge, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// Query: GetStudent
const GET_STUDENT = gql`
  query GetStudent($id: ID!) {
    student(id: $id) {
      id
      studentNumber
      firstName
      lastName
      email
      address
      city
      phoneNumber
      program
      courses {
        id
        courseCode
        courseName
        section
        semester
      }
    }
  }
`;

// Mutation: UpdateStudent
const UPDATE_STUDENT = gql`
  mutation UpdateStudent($id: ID!, $input: UpdateStudentInput!) {
    updateStudent(id: $id, input: $input) {
      id
      firstName
      lastName
      address
      city
      phoneNumber
      program
    }
  }
`;

// Mutation: RemoveCourseFromStudent
const REMOVE_COURSE = gql`
  mutation RemoveCourseFromStudent($studentId: ID!, $courseId: ID!) {
    removeCourseFromStudent(studentId: $studentId, courseId: $courseId) {
      id
      courses {
        id
      }
    }
  }
`;

const StudentDetail = ({ studentId }) => {
  const { user } = useAuth();
  const isOwnProfile = user?.id === studentId;

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    phoneNumber: "",
    program: "",
  });
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  const navigate = useNavigate();

  const { loading, error, data, refetch } = useQuery(GET_STUDENT, {
    variables: { id: studentId },
    onCompleted: (data) => {
      setFormData({
        firstName: data.student.firstName,
        lastName: data.student.lastName,
        address: data.student.address || "",
        city: data.student.city || "",
        phoneNumber: data.student.phoneNumber || "",
        program: data.student.program,
      });
    },
  });

  const [updateStudent, { loading: updating }] = useMutation(UPDATE_STUDENT, {
    onCompleted: () => {
      setUpdateSuccess("Profile updated successfully!");
      setEditing(false);
      setTimeout(() => {
        setUpdateSuccess("");
      }, 5000);
    },
    onError: (error) => {
      setUpdateError(error.message || "Failed to update profile");
    },
  });

  const [removeCourse, { loading: removing }] = useMutation(REMOVE_COURSE, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      setUpdateError(error.message || "Failed to drop course");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateError("");
    setUpdateSuccess("");

    try {
      await updateStudent({
        variables: {
          id: studentId,
          input: formData,
        },
      });
      refetch();
    } catch (err) {
      setUpdateError(err.message || "An error occurred");
    }
  };

  const handleRemoveCourse = async (courseId) => {
    setUpdateError("");

    try {
      await removeCourse({
        variables: {
          studentId,
          courseId,
        },
      });
    } catch (err) {
      setUpdateError(err.message || "Failed to drop course");
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading student profile...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">Error loading student profile: {error.message}</Alert>;
  }

  if (!data || !data.student) {
    return <Alert variant="warning">Student not found</Alert>;
  }

  const { student } = data;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isOwnProfile ? "My Profile" : "Student Profile"}</h2>
        {isOwnProfile && (
          <Button variant="outline-primary" onClick={() => setEditing(!editing)}>
            {editing ? "Cancel" : "Edit Profile"}
          </Button>
        )}
      </div>

      {updateError && <Alert variant="danger">{updateError}</Alert>}
      {updateSuccess && <Alert variant="success">{updateSuccess}</Alert>}

      <Card className="shadow-sm mb-4 profile-header">
        <Card.Body>
          {editing ? (
            <Form onSubmit={handleUpdate}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Program</Form.Label>
                    <Form.Control
                      type="text"
                      name="program"
                      value={formData.program}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </Form.Group>

              <Button variant="primary" type="submit" disabled={updating}>
                {updating ? "Updating..." : "Update Profile"}
              </Button>
            </Form>
          ) : (
            <Row>
              <Col md={6} className="profile-info">
                <h5>Student Information</h5>
                <p>
                  <strong>Student Number:</strong> {student.studentNumber}
                </p>
                <p>
                  <strong>Name:</strong> {student.firstName} {student.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {student.email}
                </p>
                <p>
                  <strong>Program:</strong> {student.program}
                </p>
              </Col>

              <Col md={6} className="profile-info">
                <h5>Contact Information</h5>
                <p>
                  <strong>Phone:</strong> {student.phoneNumber || "Not provided"}
                </p>
                <p>
                  <strong>Address:</strong> {student.address || "Not provided"}
                </p>
                <p>
                  <strong>City:</strong> {student.city || "Not provided"}
                </p>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      <h4>Registered Courses</h4>

      {student.courses.length === 0 ? (
        <Alert variant="info">
          {isOwnProfile
            ? "You are not registered for any courses yet."
            : "This student is not registered for any courses yet."}
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="shadow-sm">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Section</th>
              <th>Semester</th>
              {isOwnProfile && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {student.courses.map((course) => (
              <tr key={course.id}>
                <td>{course.courseCode}</td>
                <td>{course.courseName}</td>
                <td>{course.section}</td>
                <td>{course.semester}</td>
                {isOwnProfile && (
                  <td>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveCourse(course.id)}
                      disabled={removing}
                    >
                      Drop Course
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {isOwnProfile && (
        <div className="mt-4">
          <Button variant="primary" onClick={() => navigate("/courses")}>
            Browse Available Courses
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentDetail;
