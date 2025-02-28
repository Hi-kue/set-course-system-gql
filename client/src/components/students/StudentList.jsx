import { useQuery, gql } from '@apollo/client';
import { Table, Spinner, Alert, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const GET_STUDENTS = gql`
  query GetStudents {
    students {
      id
      studentNumber
      firstName
      lastName
      email
      program
      courses {
        id
        courseCode
      }
    }
  }
`;

const StudentList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { loading, error, data } = useQuery(GET_STUDENTS);
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredStudents = data?.students.filter(student => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(searchTermLower) ||
      student.lastName.toLowerCase().includes(searchTermLower) ||
      student.studentNumber.toLowerCase().includes(searchTermLower) ||
      student.email.toLowerCase().includes(searchTermLower) ||
      student.program.toLowerCase().includes(searchTermLower)
    );
  });

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        Error loading students: {error.message}
      </Alert>
    );
  }

  if (!data || !data.students || data.students.length === 0) {
    return (
      <div className="text-center my-5">
        <Alert variant="info">
          No students found in the system.
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4">Student Directory</h3>
      
      <InputGroup className="mb-4 shadow-sm">
        <Form.Control
          placeholder="Search by name, student number, email or program..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
          Clear
        </Button>
      </InputGroup>

      {filteredStudents?.length === 0 ? (
        <Alert variant="info">
          No students found matching your search criteria.
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="shadow-sm">
          <thead>
            <tr>
              <th>Student Number</th>
              <th>Name</th>
              <th>Email</th>
              <th>Program</th>
              <th>Courses</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents?.map((student) => (
              <tr key={student.id} className="student-list-item">
                <td>{student.studentNumber}</td>
                <td>{student.firstName} {student.lastName}</td>
                <td>{student.email}</td>
                <td>{student.program}</td>
                <td>
                  {student.courses.length === 0 ? (
                    <span className="text-muted">No courses</span>
                  ) : (
                    <div className="d-flex flex-wrap gap-1">
                      {student.courses.slice(0, 3).map((course) => (
                        <Badge bg="primary" key={course.id}>
                          {course.courseCode}
                        </Badge>
                      ))}
                      {student.courses.length > 3 && (
                        <Badge bg="secondary">
                          +{student.courses.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </td>
                <td>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => navigate(`/students/${student.id}`)}
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default StudentList;
