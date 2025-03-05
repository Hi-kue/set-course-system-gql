import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { Form, Button, Alert, Card } from "react-bootstrap";

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

const CourseForm = ({ onCourseCreated }) => {
  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    section: "",
    semester: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [createCourse, { loading }] = useMutation(CREATE_COURSE, {
    onCompleted: (data) => {
      setSuccess(`Course "${data.createCourse.courseName}" created successfully!`);
      setFormData({
        courseCode: "",
        courseName: "",
        section: "",
        semester: "",
      });

      if (onCourseCreated) {
        onCourseCreated(data.createCourse);
      }

      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccess("");
      }, 5000);
    },
    onError: (error) => {
      setError(error.message || "Failed to create course");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createCourse({
        variables: {
          input: formData,
        },
      });
    } catch (err) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <Card className="shadow-sm mb-4" id="createCourseForm">
      <Card.Body>
        <h3 className="mb-3">Add New Course</h3>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="courseCode">
            <Form.Label>Course Code</Form.Label>
            <Form.Control
              type="text"
              name="courseCode"
              placeholder="e.g. COMP308"
              value={formData.courseCode}
              onChange={handleChange}
              required
            />
            <Form.Text className="text-muted">Unique identifier for the course</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="courseName">
            <Form.Label>Course Name</Form.Label>
            <Form.Control
              type="text"
              name="courseName"
              placeholder="e.g. Advanced Web Programming"
              value={formData.courseName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="section">
            <Form.Label>Section</Form.Label>
            <Form.Control
              type="text"
              name="section"
              placeholder="e.g. 001 or Morning"
              value={formData.section}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="semester">
            <Form.Label>Semester</Form.Label>
            <Form.Control
              type="text"
              name="semester"
              placeholder="e.g. Fall 2023"
              value={formData.semester}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Course"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CourseForm;
