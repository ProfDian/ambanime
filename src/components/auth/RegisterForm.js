// src/components/auth/RegisterForm.js
import React from 'react';

class RegisterForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      confirmPassword: '',
      error: '',
      loading: false,
    };
  }

  handleInputChange = (e) => {
    this.setState({ [e.target.id]: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword } = this.state;

    if (password !== confirmPassword) {
      this.setState({ error: 'Passwords do not match' });
      return;
    }

    try {
      this.setState({ error: '', loading: true });
      await this.props.onSubmit(email, password);
    } catch (err) {
      console.error('Registration error:', err);
      this.setState({ error: 'Failed to create an account. Please try again.' });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { email, password, confirmPassword, error, loading } = this.state;

    return (
      <form onSubmit={this.handleSubmit} className="auth-form">
        {error && <div className="auth-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={this.handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={this.handleInputChange}
            required
            minLength="6"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={this.handleInputChange}
            required
            minLength="6"
          />
        </div>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    );
  }
}
export default RegisterForm