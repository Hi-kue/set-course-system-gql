import { createContext, useState, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';
import jwtDecode from 'jwt-decode';

export const AuthContext = createContext();

// GraphQL mutations
const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      student {
        id
        firstName
        lastName
        email
        studentNumber
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation CreateStudent($input: CreateStudentInput!) {
    createStudent(input: $input) {
      token
      student {
        id
        firstName
        lastName
        email
        studentNumber
      }
    }
  }
`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  // Check for token on load
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode(token);
          
          // Check if token is expired
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp < currentTime) {
            localStorage.removeItem('token');
            setUser(null);
          } else {
            // If token is valid, set the user
            setUser({
              id: decodedToken.id,
              email: decodedToken.email,
              studentNumber: decodedToken.studentNumber
            });
          }
        }
      } catch (err) {
        console.error('Token validation error:', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const { data } = await loginMutation({ 
        variables: { 
          input: { email, password } 
        } 
      });
      
      const { token, student } = data.login;
      localStorage.setItem('token', token);
      setUser(student);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Login failed');
      return { success: false, error: err.message };
    }
  };

  // Register function
  const register = async (studentData) => {
    try {
      setError(null);
      const { data } = await registerMutation({ 
        variables: { 
          input: studentData
        } 
      });
      
      const { token, student } = data.createStudent;
      localStorage.setItem('token', token);
      setUser(student);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Registration failed');
      return { success: false, error: err.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
