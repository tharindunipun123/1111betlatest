import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './360.png'

const HomePage = () => {
  const navigate = useNavigate();

  const games = [
    {
      title: "Spin Wheel Game",
      path: "/spinwheel",
      image: "https://script.viserlab.com/kasino/assets/images/frontend/banner/6649ec9ddb9761716120733.jpg",
      description: "Spin the wheel and win exciting prizes!"
    },
    {
      title: "Lucky Number Game",
      path: "/lucky",
      image: "https://thegamereward.com/wp-content/uploads/2022/09/Lucky-Win-Casino.jpeg",
      description: "Choose your lucky number and multiply your earnings!"
    },
    {
      title: "Dice Game",
      path: "/dice",
      image: "https://fthmb.tqn.com/CcCUqMPOoZtiIWsdxbCe4l-BykA=/3364x2242/filters:fill(auto,1)/Rolling-dice-GettyImages-93453966-58a6f50c3df78c345b634f6f.jpg",
      description: "Play cricket and earn rewards!"
    }
  ];

  return (
    <div className="homepage-container">
     <nav className="navbar navbar-expand-lg navbar-dark fixed-top" style={{ backgroundColor: '#041A34' }}>
  <div className="container">
    <a className="navbar-brand fw-bold text-info d-flex align-items-center" href="/">
      <img 
        src={logo} 
        alt="Logo" 
        style={{
          height: '60px', // Adjust the size as needed
          width: 'auto',
          marginRight: '10px', // Space between logo and text (if any)
          transition: 'transform 0.3s ease', // Transition for hover effect
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      />
      {/* Uncomment the line below if you want to add text next to the logo */}
      {/* <span>Logo</span> */}
    </a>
    <button 
      className="navbar-toggler" 
      type="button" 
      data-bs-toggle="collapse" 
      data-bs-target="#navbarNav"
    >
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav ms-auto">
        <li className="nav-item">
          <a className="nav-link" href="/cricket">Play Live Games</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#about">About Us</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="/bet/payment">Deposit</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="/bet/withdraw">Withdraw</a>
        </li>
        {/* <li className="nav-item ms-lg-2">
          <button className="btn btn-info text-white">Account</button>
        </li> */}
      </ul>
    </div>
  </div>
</nav>

      {/* Hero Section */}
      <section className="hero-section position-relative d-flex align-items-center min-vh-100">
        <div className="hero-overlay position-absolute w-100 h-100" style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://script.viserlab.com/kasino/assets/images/frontend/banner/6649ec9ddb9761716120733.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}></div>
        <div className="container position-relative">
          <div className="row">
            <div className="col-lg-8 text-white">
              <h1 className="display-4 fw-bold mb-4">Earn Money While You Play</h1>
              <p className="lead mb-4">
                Contrary to popular belief, Lorem Ipsum is not simply random text. 
                It has roots in a piece of classical Latin literature.
              </p>
              <button className="btn btn-info btn-lg text-white px-5">
                Start Playing Now
              </button>
            </div>
          </div>
        </div>
      </section>

    {/* Games Section */}
<section className="py-5" style={{ backgroundColor: '#041A34' }}>
  <div className="container">
    <div className="text-center text-white mb-5">
      <h2 className="display-6 fw-bold">Fun and Win Money</h2>
      <p className="text-white">
        Contrary to popular belief, Lorem Ipsum is not simply random text.
      </p>
    </div>
    
    <div className="row g-4">
      {games.map((game, index) => (
        <div key={index} className="col-md-6 col-lg-4">
          <div 
            className="card h-100 game-card bg-dark text-white border-0" 
            onClick={() => navigate(game.path)}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-img-overlay-container position-relative">
              <img 
                src={game.image} 
                className="card-img-top game-image" 
                alt={game.title}
                style={{ height: '300px', objectFit: 'cover' }}
              />
              <div className="card-img-overlay d-flex flex-column justify-content-end" 
                   style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                <h5 className="card-title fw-bold">{game.title}</h5>
                <p className="card-text">{game.description}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
    {/* Footer */}
<footer className="py-4 text-white" style={{ backgroundColor: '#041A34' }}>
  <div className="container">
    <div className="row gy-4">
      <div className="col-lg-4">
        <h5 className="fw-bold text-info mb-3">Logo</h5>
        <p className="text-white">
          Experience the thrill of gaming and earning.
        </p>
      </div>
      <div className="col-lg-4">
        <h5 className="fw-bold text-info mb-3">Quick Links</h5>
        <ul className="list-unstyled">
          <li>
            <a href="#about" className="text-decoration-none text-white hover-opacity">
              About Us
            </a>
          </li>
          <li>
            <a href="#contact" className="text-decoration-none text-white hover-opacity">
              Contact
            </a>
          </li>
        </ul>
      </div>
      <div className="col-lg-4">
        <h5 className="fw-bold text-info mb-3">Contact Info</h5>
        <ul className="list-unstyled text-white">
          <li>Support: support@example.com</li>
          <li>Phone: (123) 456-7890</li>
        </ul>
      </div>
    </div>
    <div className="text-center text-white mt-4 pt-4 border-top border-secondary">
      <small>&copy; 2024 All Rights Reserved</small>
    </div>
  </div>

  <style>
    {`
      .hover-opacity:hover {
        opacity: 0.8;
        transition: opacity 0.3s ease;
      }
    `}
  </style>
</footer>
      <style>
        {`
          .hero-section {
            margin-top: -56px; /* Adjust based on navbar height */
          }
          
          .game-card {
            transition: transform 0.3s ease;
          }
          
          .game-card:hover {
            transform: translateY(-5px);
          }
          
          .navbar {
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .game-image {
            transition: transform 0.3s ease;
          }

          .game-card:hover .game-image {
            transform: scale(1.05);
          }
        `}
      </style>
    </div>
  );
};

export default HomePage;