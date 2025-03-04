import { createContext, useState, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';
import jwtDecode from 'jwt-decode';

export const AuthContext = createContext();

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

const ADMIN_LOGIN_MUTATION = gql`
  mutation AdminLogin($input: AdminLoginInput!) {
    adminLogin(input: $input) {
      token
      admin {
        id
        username
        email
        firstName
        lastName
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
  const [adminLoginMutation] = useMutation(ADMIN_LOGIN_MUTATION);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode(token);
          console.log('Decoded token in client:', decodedToken);
          
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp < currentTime) {
            console.log('Token expired');
            localStorage.removeItem('token');
            setUser(null);
          } else {
            // Create user object with proper admin flag
            const userData = {
              id: decodedToken.id,
              email: decodedToken.email,
              username: decodedToken.username || null,
              studentNumber: decodedToken.studentNumber || null,
              isAdmin: decodedToken.isAdmin === true,
              role: decodedToken.role || (decodedToken.isAdmin ? 'admin' : 'student')
            };
            
            console.log('Setting user data:', userData);
            setUser(userData);
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

  const adminLogin = async (email, password) => {
    try {
      setError(null);
      const { data } = await adminLoginMutation({ 
        variables: { 
          input: { email, password } 
        } 
      });
      
      const { token, admin } = data.adminLogin;
      localStorage.setItem('token', token);
      setUser({ ...admin, isAdmin: true }); // Set isAdmin flag
      return { success: true };
    } catch (err) {
      setError(err.message || 'Admin login failed');
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        loading,
        error,
        login,
        register,
        adminLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
