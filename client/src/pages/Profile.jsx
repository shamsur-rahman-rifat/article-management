import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api';

const ROLES = ['admin', 'researcher', 'writer', 'publisher'];

export default function Profile() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.post('/profileDetails');
        const user = res.data?.data?.[0];

        if (user) {
          setValue('name', user.name);
          setValue('email', user.email);
          ROLES.forEach(role => {
            setValue(role, user.roles?.includes(role));
          });
        }
      } catch (err) {
        console.error(err);
        alert('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setValue]);

  const onSubmit = async (data) => {
    const selectedRoles = ROLES.filter(role => data[role]);

    const payload = {
      name: data.name,
      email: data.email,
      roles: selectedRoles
    };

    if (data.password) payload.password = data.password;

    try {
      await api.post('/profileUpdate', payload);
      alert('Profile updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-sm border-0 p-4">
            <h3 className="mb-4 text-center">👤 My Profile</h3>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Name */}
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="Your name"
                />
                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Invalid email format'
                    }
                  })}
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="you@example.com"
                />
                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label">Change Password (optional)</label>
                <div className="input-group">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="New password"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(prev => !prev)}
                    tabIndex={-1}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Roles */}
              <div className="mb-4">
                <label className="form-label">Your Roles</label>
                <div className="d-flex flex-wrap gap-3">
                  {ROLES.map(role => (
                    <div key={role} className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`role-${role}`}
                        {...register(role)}
                      />
                      <label className="form-check-label ms-1" htmlFor={`role-${role}`}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="d-grid">
                <button className="btn btn-primary btn-lg">
                  Update Profile
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
