import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Alert, Button, Form } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);
    setLoading(true);

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const result = await updateUser({
        name: formData.name,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword || null,
      });

      if (result.success) {
        setSuccess(true);
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        setError(result.error || "Failed to update profile");
      }
    } catch (err) {
      setError(err.message || "An error occurred while updating your profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container>
        <Alert variant="warning">Please login to view your profile.</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="mb-4">My Profile</h1>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Profile Information</Card.Title>

              {success && <Alert variant="success">Profile updated successfully!</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={formData.email} disabled />
                  <Form.Text className="text-muted">Email cannot be changed.</Form.Text>
                </Form.Group>

                <Card.Title className="mt-4">Change Password</Card.Title>

                <Form.Group className="mb-3" controlId="currentPassword">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="newPassword">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Account Status</Card.Title>
              <Card.Text>
                <strong>Role:</strong> {user.role === "admin" ? "Administrator" : "Student"}
              </Card.Text>
              <Card.Text>
                <strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
