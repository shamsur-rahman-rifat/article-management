// src/pages/Register.jsx
import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';


export default function Register() {
  const { register: registerFn, handleSubmit, formState: { errors } } = useForm();
  const { register: apiRegister } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {

      await apiRegister({
        email: data.email,
        name: data.name,
        password: data.password
      });

      alert('Registered. Please login.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert('Registration failed');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 600 }}>
      <h3>Register</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-2">
          <input
            {...registerFn('name', { required: 'Name is required' })}
            className="form-control"
            placeholder="Name"
          />
          {errors.name && <small className="text-danger">{errors.name.message}</small>}
        </div>

        <div className="mb-2">
          <input
            {...registerFn('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: 'Invalid email format'
              }
            })}
            className="form-control"
            placeholder="Email"
          />
          {errors.email && <small className="text-danger">{errors.email.message}</small>}
        </div>

        <div className="mb-2">
          <input
            {...registerFn('password', { required: 'Password is required' })}
            type="password"
            className="form-control"
            placeholder="Password"
          />
          {errors.password && <small className="text-danger">{errors.password.message}</small>}
        </div>

        <button className="btn btn-success">Register</button>
      </form>
    </div>
  );
}