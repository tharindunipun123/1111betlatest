// WithdrawalRequest.jsx
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const WithdrawalRequest = () => {
  const [formData, setFormData] = useState({
    userName: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    amount: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/withdrawals/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
       
      swal({
        title: 'Congrats!',
        text: 'Request Send Successful',
        icon: 'success',
        button: 'Ok',
      })
      //if (!response.ok) throw new Error('Request failed');

      //setSuccess('Withdrawal request submitted successfully!');
      setFormData({
        userName: '',
        bankName: '',
        accountNumber: '',
        accountHolderName: '',
        ifscCode: '',
        amount: '',
        notes: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Request Withdrawal</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="userName" className="form-label">User Name*</label>
                    <input
                      type="text"
                      className="form-control"
                      id="userName"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="bankName" className="form-label">Bank Name*</label>
                    <input
                      type="text"
                      className="form-control"
                      id="bankName"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter bank name"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 mb-3">
                    <label htmlFor="accountHolderName" className="form-label">Account Holder Name*</label>
                    <input
                      type="text"
                      className="form-control"
                      id="accountHolderName"
                      name="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter account holder name"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="accountNumber" className="form-label">Account Number*</label>
                    <input
                      type="text"
                      className="form-control"
                      id="accountNumber"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter account number"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="ifscCode" className="form-label">IFSC Code*</label>
                    <input
                      type="text"
                      className="form-control"
                      id="ifscCode"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter IFSC code"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="amount" className="form-label">Withdrawal Amount*</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className="form-control"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Add any additional notes here"
                  />
                </div>

                {error && (
                  <div className="alert alert-danger mb-3" role="alert">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success mb-3" role="alert">
                    {success}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary w-100" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span 
                        className="spinner-border spinner-border-sm me-2" 
                        role="status" 
                        aria-hidden="true"
                      ></span>
                      Processing...
                    </>
                  ) : 'Submit Withdrawal Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalRequest;