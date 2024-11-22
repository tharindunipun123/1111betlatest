import React from 'react';
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const username = document.getElementById('usernameField').value;
    const password = document.getElementById('passwordField').value;

    const formData = { username, password };

    fetch('http://145.223.21.62:3008/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          swal({
            title: 'Congrats!',
            text: 'Login Successful',
            icon: 'success',
            button: 'Proceed!',
          }).then(() => {
            localStorage.setItem('user_id', data.id);
            localStorage.setItem('wallet', data.wallet);
            navigate('/home');
          });
        } else {
          swal({
            title: 'Login Failed',
            text: 'Incorrect credentials, please try again.',
            icon: 'error',
            button: 'Try again!',
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
    <div className="login-container d-flex align-items-center justify-content-center min-vh-100" 
         style={{ 
           background: 'linear-gradient(135deg, #1e3c72, #0bc2e2)'
         }}>
      <div className="card shadow-lg" style={{ 
        maxWidth: '400px',
        width: '90%',
        borderRadius: '15px',
        border: 'none'
      }}>
        <div className="card-body p-4">
          <h3 className="text-center mb-4 fw-bold" style={{ color: '#1e3c72' }}>Login</h3>
          
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="usernameField" className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                id="usernameField"
                required
                style={{ height: '45px', borderRadius: '8px' }}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="passwordField" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="passwordField"
                required
                style={{ height: '45px', borderRadius: '8px' }}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-100 mb-3"
              style={{ 
                height: '45px',
                borderRadius: '8px',
                backgroundColor: '#1e3c72',
                border: 'none'
              }}
            >
              Login
            </button>

            <div className="text-center">
              <span>Don't have an account? </span>
              <button 
                className="btn btn-link p-0 text-decoration-none"
                onClick={() => navigate('/register')}
                style={{ color: '#0bc2e2' }}
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>
        {`
          .form-control:focus {
            border-color: #0bc2e2;
            box-shadow: 0 0 0 0.2rem rgba(11, 194, 226, 0.25);
          }

          .btn-primary:hover {
            background-color: #0bc2e2 !important;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(30, 60, 114, 0.3);
            transition: all 0.3s ease;
          }

          @media (max-width: 576px) {
            .card-body {
              padding: 1.5rem !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Login;