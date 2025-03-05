import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";
import { useAuth } from "../hooks/useAuth";

// Mutation: createStudent
const CREATE_STUDENT_MUTATION = gql`
  mutation CreateStudent($input: CreateStudentInput!) {
    createStudent(input: $input) {
      student {
        id
        studentNumber
        firstName
        lastName
        email
      }
    }
  }
`;

const AdminCreateStudentPage = () => {
  const [formData, setFormData] = useState({
    studentNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    program: "",
    address: "",
    city: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [createStudent, { loading }] = useMutation(CREATE_STUDENT_MUTATION);

  useEffect(() => {
    console.log("Current user:", user);
    console.log("Is admin?", isAdmin);

    if (!isAdmin) {
      console.log("Not authenticated as admin, redirecting");
      navigate("/admin/login");
    }
  }, [isAdmin, navigate, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentNumber) {
      newErrors.studentNumber = "Student number is required";
    } else if (!/^\d{8}$/.test(formData.studentNumber)) {
      newErrors.studentNumber = "Student number must be 8 digits";
    }

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.program) newErrors.program = "Program is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const { confirmPassword, ...inputData } = formData;

      const { data } = await createStudent({
        variables: {
          input: inputData,
        },
      });

      console.log("Created student:", data);
      setSuccess(true);

      setFormData({
        studentNumber: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        program: "",
        address: "",
        city: "",
        phoneNumber: "",
      });

      setTimeout(() => {
        navigate("/admin/students");
      }, 2000);
    } catch (error) {
      console.error("Error creating student:", error);

      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const message = error.graphQLErrors[0].message;

        if (message.includes("email")) {
          setErrors({ ...errors, email: message });
        } else if (message.includes("student number")) {
          setErrors({ ...errors, studentNumber: message });
        } else {
          setErrors({ ...errors, form: message });
        }
      } else {
        setErrors({ ...errors, form: "An error occurred. Please try again." });
      }
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Create New Student</h1>
          <p className="text-muted">Complete the form below to create a new student account</p>
        </Col>
      </Row>

      {success && (
        <Alert variant="success" onClose={() => setSuccess(false)} dismissible>
          Student account created successfully! Redirecting to student list...
        </Alert>
      )}

      {errors.form && <Alert variant="danger">{errors.form}</Alert>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Student Number*</Form.Label>
                  <Form.Control
                    type="text"
                    name="studentNumber"
                    value={formData.studentNumber}
                    onChange={handleInputChange}
                    isInvalid={!!errors.studentNumber}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.studentNumber}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Program*</Form.Label>
                  <Form.Control
                    type="text"
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    isInvalid={!!errors.program}
                  />
                  <Form.Control.Feedback type="invalid">{errors.program}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name*</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    isInvalid={!!errors.firstName}
                  />
                  <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name*</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    isInvalid={!!errors.lastName}
                  />
                  <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email*</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password*</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    isInvalid={!!errors.password}
                  />
                  <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password*</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    isInvalid={!!errors.confirmPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => navigate("/admin/students")}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Student"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminCreateStudentPage;
