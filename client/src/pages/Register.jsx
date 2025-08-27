// src/pages/Register.jsx
import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLES = ['admin', 'researcher', 'writer', 'publisher'];

export default function Register() {
  const { register: registerFn, handleSubmit, setValue, getValues, formState: { errors } } = useForm();
  const { register: apiRegister } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      // Ensure roles is an array of selected roles
      const selectedRoles = ROLES.filter(role => data[role]);
      if (selectedRoles.length === 0) selectedRoles.push('researcher'); // Default role

      await apiRegister({
        email: data.email,
        name: data.name,
        roles: selectedRoles,
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

<div className="mb-3">
  <label className="form-label mb-2">Select Roles:</label>
  <div className="d-flex flex-wrap gap-3">
    {ROLES.map(role => (
      <div key={role} className="form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id={`role-${role}`}
          {...registerFn(role)}
        />
        <label className="form-check-label ms-2" htmlFor={`role-${role}`}>
          {role}
        </label>
      </div>
    ))}
  </div>
</div>

        <button className="btn btn-success">Register</button>
      </form>
    </div>
  );
}