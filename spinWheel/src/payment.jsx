// PaymentReceipt.jsx
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import swal from 'sweetalert';

const PaymentReceipt = () => {
  const [formData, setFormData] = useState({
  
    bankName: '',
    accountNumber: '',
    amount: '',
    receipt: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setFormData(prev => ({
        ...prev,
        receipt: file
      }));
      setError('');
      
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    } else {
      setError('Please upload a valid image file (JPG or PNG)');
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await fetch('/api/payments/upload', {
        method: 'POST',
        body: formDataToSend,
      });


      swal({
        title: 'Congrats!',
        text: 'Payment Upload Successful',
        icon: 'success',
        button: 'Ok',
      })

      //if (!response.ok) throw new Error('Upload failed');
      
      //etSuccess('Payment proof uploaded successfully!');
      setFormData({
        userName: '',
        bankName: '',
        accountNumber: '',
        amount: '',
        receipt: null
      });
      setPreviewUrl(null);
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
              <h4 className="mb-0">Upload Payment Receipt</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">

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
                  <div className="col-md-6 mb-3">
                    <label htmlFor="accountNumber" className="form-label">Reference Number*</label>
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
                    <label htmlFor="amount" className="form-label">Amount*</label>
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
                </div>

                <div className="mb-3">
                  <label htmlFor="receipt" className="form-label">Upload Receipt*</label>
                  <input
                    type="file"
                    className="form-control"
                    id="receipt"
                    name="receipt"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    required
                  />
                  <div className="form-text">Maximum file size: 5MB (JPG or PNG only)</div>
                </div>

                {previewUrl && (
                  <div className="mb-3 text-center">
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      className="img-fluid img-thumbnail"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                )}

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
                      Uploading...
                    </>
                  ) : 'Upload Receipt'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;