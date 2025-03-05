import React, { useState } from "react";
import { Container, Row, Col, Card, Table, Button, Modal, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useAuth } from "../hooks/useAuth";

// Query: GetAdmins
const GET_ADMINS = gql`
  query GetAdmins {
    admins {
      id
      username
      email
      firstName
      lastName
      createdAt
    }
  }
`;

// Mutation: DeleteAdmin
const DELETE_ADMIN = gql`
  mutation DeleteAdmin($id: ID!) {
    deleteAdmin(id: $id)
  }
`;

const AdminAccountsPage = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");

  const { loading, error, data, refetch } = useQuery(GET_ADMINS);

  const [deleteAdmin] = useMutation(DELETE_ADMIN);

  if (!isAdmin) {
    navigate("/admin/login");
    return null;
  }

  const handleDeleteClick = (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
    setDeleteError("");
    setDeleteSuccess("");
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAdmin) return;

    try {
      await deleteAdmin({
        variables: { id: selectedAdmin.id },
      });

      setDeleteSuccess(`Admin ${selectedAdmin.username} deleted successfully`);
      refetch(); // NOTE: Refresh Admin List
      setShowDeleteModal(false);
    } catch (err) {
      setDeleteError(err.message || "Failed to delete admin");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h1>Admin Accounts Management</h1>
          <p className="lead">Create, view, and manage administrator accounts</p>
        </Col>
        <Col md="auto" className="d-flex align-items-center">
          <Link to="/admin/create">
            <Button variant="primary">Create New Admin</Button>
          </Link>
        </Col>
      </Row>

      {deleteSuccess && (
        <Alert variant="success" dismissible onClose={() => setDeleteSuccess("")}>
          {deleteSuccess}
        </Alert>
      )}

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center my-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <Alert variant="danger">Error loading admin accounts: {error.message}</Alert>
          ) : (
            <>
              {data.admins.length === 0 ? (
                <Alert variant="info">
                  No admin accounts found. Click "Create New Admin" to add one.
                </Alert>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.admins.map((admin) => (
                      <tr key={admin.id}>
                        <td>{admin.username}</td>
                        <td>
                          {admin.firstName} {admin.lastName}
                        </td>
                        <td>{admin.email}</td>
                        <td>{formatDate(admin.createdAt)}</td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteClick(admin)}
                            disabled={admin.id === user.id} // Prevent self-deletion
                            title={
                              admin.id === user.id
                                ? "Cannot delete your own account"
                                : "Delete admin"
                            }
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      <Row className="mt-4">
        <Col>
          <Button variant="secondary" onClick={() => navigate("/admin/dashboard")}>
            Back to Dashboard
          </Button>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}
          <p>
            Are you sure you want to delete the admin account for{" "}
            <strong>{selectedAdmin?.username}</strong>?
          </p>
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminAccountsPage;
