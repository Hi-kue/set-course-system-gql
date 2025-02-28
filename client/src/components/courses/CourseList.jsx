import { useQuery, gql } from '@apollo/client';
import { Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

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
      }
    }
  }
`;

const CourseList = () => {
  const { loading, error, data, refetch } = useQuery(GET_COURSES);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        Error loading courses: {error.message}
      </Alert>
    );
  }

  if (!data || !data.courses || data.courses.length === 0) {
    return (
      <div className="text-center my-5">
        <Alert variant="info">
          No courses found. Create a new course to get started.
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between mb-4">
        <h3>All Courses</h3>
        <Button 
          variant="primary" 
          as={Link} 
          to="#" 
          onClick={() => document.getElementById('createCourseForm').scrollIntoView()}
        >
          Add New Course
        </Button>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {data.courses.map((course) => (
          <Col key={course.id}>
            <Card className="h-100 course-card shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Badge bg="primary" className="px-3 py-2">{course.courseCode}</Badge>
                  <Badge bg="secondary" className="px-2 py-1">
                    {course.students.length} student{course.students.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <Card.Title>{course.courseName}</Card.Title>
                <Card.Text>
                  <strong>Section:</strong> {course.section}<br />
                  <strong>Semester:</strong> {course.semester}
                </Card.Text>
                <div className="d-flex justify-content-between mt-auto">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    as={Link} 
                    to={`/courses/${course.id}`}
                  >
                    View Details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CourseList;
