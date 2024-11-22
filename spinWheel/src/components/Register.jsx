import React from 'react';
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // Custom CSS for styling

const Register = () => {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    const username = document.getElementById('usernameField').value;
    const password = document.getElementById('passwordField').value;

    const formData = {
      username: username,
      password: password,
    };

    // Call the backend API to register a new user
    fetch('http://145.223.21.62:3008/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'User registered') {
          swal({
            title: 'Registration Successful!',
            text: 'You can now login with your credentials.',
            icon: 'success',
            button: 'Go to Login',
          }).then(() => {
            navigate('/'); // Redirect to login page after successful registration
          });
        } else {
          swal({
            title: 'Registration Failed',
            text: data.message || 'Something went wrong!',
            icon: 'error',
            button: 'Try Again',
          });
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        swal({
          title: 'Error',
          text: 'Something went wrong!',
          icon: 'error',
          button: 'Try again!',
        });
      });
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card p-4 shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="text-center mb-4">Register</h3>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label htmlFor="usernameField" className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              id="usernameField"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="passwordField" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="passwordField"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Register</button>
        </form>
        <div className="mt-3 text-center">
          <span>Already have an account? </span>
          <button className="btn btn-link p-0" onClick={() => navigate('/')}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
