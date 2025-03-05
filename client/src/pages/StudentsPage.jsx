import React, { useState } from "react";
import { Container, Alert, Row, Col, Card, Table, Button, Modal, Form } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useAuth } from "../hooks/useAuth";

// GraphQL queries
const GET_STUDENTS = gql`
  query GetStudents {
    students {
      id
      firstName
      lastName
      studentNumber
      email
      courses {
        id
        courseCode
        courseName
      }
    }
  }
`;

const StudentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // GraphQL query
  const { loading, error, data } = useQuery(GET_STUDENTS, {
    onError: (err) => console.error("Error fetching students:", err),
  });

  // Check if user is admin
  if (!user || (!user.isAdmin && user.role !== "admin")) {
    return (
      <Container>
        <Alert variant="danger">
          You do not have permission to view this page. Only administrators can access this page.
        </Alert>
      </Container>
    );
  }

  const viewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
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
        <Alert variant="danger">{error.message || "Error loading students"}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>Students</h1>
        </Col>
        {user && (user.isAdmin || user.role === "admin") && (
          <Col xs="auto">
            <Link to="/admin/students/create">
              <Button variant="primary">Add New Student</Button>
            </Link>
          </Col>
        )}
      </Row>

      <Card>
        <Card.Body>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Name</th>
                <th>Email</th>
                <th>Courses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data &&
                data.students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.studentNumber}</td>
                    <td>
                      {student.firstName} {student.lastName}
                    </td>
                    <td>{student.email}</td>
                    <td>{student.courses?.length || 0}</td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => viewStudentDetails(student)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              {(!data || data.students.length === 0) && (
                <tr>
                  <td colSpan="5" className="text-center">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Student Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Student Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <div>
              <h4>
                {selectedStudent.firstName} {selectedStudent.lastName}
              </h4>
              <p>
                <strong>Student Number:</strong> {selectedStudent.studentNumber}
              </p>
              <p>
                <strong>Email:</strong> {selectedStudent.email}
              </p>

              <h5 className="mt-4">Enrolled Courses</h5>
              {selectedStudent.courses && selectedStudent.courses.length > 0 ? (
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudent.courses.map((course) => (
                      <tr key={course.id}>
                        <td>{course.courseCode}</td>
                        <td>{course.courseName}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>Not enrolled in any courses</p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StudentsPage;
