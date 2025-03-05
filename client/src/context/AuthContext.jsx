import { createContext, useState, useEffect } from "react";
import { useMutation, gql } from "@apollo/client";
import jwtDecode from "jwt-decode";

export const AuthContext = createContext();

// Mutation: Login
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

// Mutation: AdminLogin
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

// Mutation: Register
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
        const token = localStorage.getItem("token");
        if (token) {
          const decodedToken = jwtDecode(token);
          console.log("Decoded token in client:", decodedToken);

          const currentTime = Date.now() / 1000;
          if (decodedToken.exp < currentTime) {
            console.log("Token expired");
            localStorage.removeItem("token");
            setUser(null);
          } else {
            const userData = {
              id: decodedToken.id,
              email: decodedToken.email,
              username: decodedToken.username || null,
              firstName: decodedToken.firstName || "",
              lastName: decodedToken.lastName || "",
              studentNumber: decodedToken.studentNumber || null,
              isAdmin: decodedToken.isAdmin === true,
              role: decodedToken.role || (decodedToken.isAdmin ? "admin" : "student"),
            };

            console.log("Decoded token user ID:", decodedToken.id, typeof decodedToken.id);
            console.log("Setting user data from token:", userData);
            setUser(userData);
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Token validation error:", err);
        localStorage.removeItem("token");
        setUser(null);
        setLoading(false);
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
          input: { email, password },
        },
      });

      const { token, student } = data.login;
      localStorage.setItem("token", token);

      const userData = {
        ...student,
        isAdmin: false,
        role: "student",
      };

      console.log("Setting user data after student login:", userData);
      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      return { success: false, error: err.message };
    }
  };

  const register = async (studentData) => {
    try {
      setError(null);
      const { data } = await registerMutation({
        variables: {
          input: studentData,
        },
      });

      const { token, student } = data.createStudent;
      localStorage.setItem("token", token);

      const userData = {
        ...student,
        isAdmin: false,
        role: "student",
      };

      console.log("Setting user data after student registration:", userData);
      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed");
      return { success: false, error: err.message };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      setError(null);
      const { data } = await adminLoginMutation({
        variables: {
          input: { email, password },
        },
      });

      const { token, admin } = data.adminLogin;
      localStorage.setItem("token", token);

      const userData = {
        ...admin,
        isAdmin: true,
        role: "admin",
      };

      console.log("Setting user data after admin login:", userData);
      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.message || "Admin login failed");
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
