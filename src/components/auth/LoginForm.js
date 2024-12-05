  // src/components/auth/AuthForm.js
  import React from 'react';

  class LoginForm extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        email: '',
        password: '',
        error: '',
        loading: false,
      };
    }

    handleInputChange = (e) => {
      this.setState({ [e.target.id]: e.target.value });
    };

    handleSubmit = async (e) => {
      e.preventDefault();
      const { email, password } = this.state;

      if (!email || !password) {
        this.setState({ error: 'Please fill in all fields' });
        return;
      }

      try {
        this.setState({ error: '', loading: true });
        await this.props.onSubmit(email, password);
      } catch (err) {
        console.error('Login error:', err);
        this.setState({
          error:
            err.code === 'auth/user-not-found' ? 'User not found' :
            err.code === 'auth/wrong-password' ? 'Invalid password' :
            err.code === 'auth/invalid-email' ? 'Invalid email format' :
            'Failed to login. Please try again.'
        });
      } finally {
        this.setState({ loading: false });
      }
    };

    render() {
      const { email, password, error, loading } = this.state;

      return (
        <form onSubmit={this.handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={this.handleInputChange}
              placeholder="Enter your email"
              disabled={loading}
              required
              className={error && !email ? 'invalid' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={this.handleInputChange}
              placeholder="Enter your password"
              disabled={loading}
              required
              className={error && !password ? 'invalid' : ''}
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit" 
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      );
    }
  }
  export default LoginForm;
