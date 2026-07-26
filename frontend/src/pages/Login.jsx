// Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  position: relative;
  overflow: hidden;
  padding: 20px;
}

@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.bubble {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  animation: float 20s infinite linear;
  z-index: 0;
}

.bubble:nth-child(1) {
  width: 120px;
  height: 120px;
  left: 10%;
  top: 20%;
  animation-duration: 25s;
  animation-delay: 0s;
}

.bubble:nth-child(2) {
  width: 80px;
  height: 80px;
  right: 15%;
  top: 10%;
  animation-duration: 30s;
  animation-delay: -5s;
}

.bubble:nth-child(3) {
  width: 160px;
  height: 160px;
  left: 70%;
  bottom: 10%;
  animation-duration: 22s;
  animation-delay: -10s;
}

.bubble:nth-child(4) {
  width: 60px;
  height: 60px;
  left: 40%;
  top: 60%;
  animation-duration: 28s;
  animation-delay: -15s;
}

@keyframes float {
  0% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
  50% { transform: translateY(-40px) rotate(180deg); opacity: 0.9; }
  100% { transform: translateY(0) rotate(360deg); opacity: 0.6; }
}

.login-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1;
  animation: slideUp 0.7s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-title {
  color: #fff;
  font-size: 2.2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.login-subtitle {
  color: rgba(255,255,255,0.85);
  text-align: center;
  font-size: 0.95rem;
  margin-bottom: 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-group {
  position: relative;
  display: flex;
  flex-direction: column;
}

.login-label {
  color: rgba(255,255,255,0.9);
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 8px;
  margin-left: 4px;
}

.login-input {
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.15);
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.login-input::placeholder {
  color: rgba(255,255,255,0.55);
}

.login-input:focus {
  background: rgba(255,255,255,0.25);
  border-color: rgba(255,255,255,0.7);
  box-shadow: 0 0 0 3px rgba(255,255,255,0.15);
}

.login-input.error {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.15);
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

.login-error {
  color: #ffcccc;
  font-size: 0.8rem;
  margin-top: 6px;
  margin-left: 4px;
  min-height: 1rem;
}

.password-wrap {
  position: relative;
}

.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  font-size: 1.1rem;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.eye-btn:hover {
  color: #fff;
}

.login-btn {
  margin-top: 10px;
  padding: 15px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 10px 25px rgba(118, 75, 162, 0.4);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(118, 75, 162, 0.5);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-foot {
  text-align: center;
  color: rgba(255,255,255,0.8);
  font-size: 0.9rem;
  margin-top: 24px;
}

.login-foot a {
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.login-foot a:hover {
  border-bottom-color: #fff;
}
`;

function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

 const validate = () => {
  const next = { email: "", password: "" };
  let valid = true;

  if (!user.email.trim()) {
    next.email = "Email is required";
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    next.email = "Please enter a valid email";
    valid = false;
  }

  if (!user.password) {
    next.password = "Password is required";
    valid = false;
  }

  setErrors(next);
  return valid;
};

  const login = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await API.post("/auth/login", user);
      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        password: "Invalid email or password",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-wrap">
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>

        <div className="login-card">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to continue your journey</p>

          <form className="login-form" onSubmit={login}>
            <div className="login-group">
              <label className="login-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={user.email}
                onChange={handleChange}
                className={`login-input ${errors.email ? "error" : ""}`}
                autoComplete="email"
              />
              {errors.email && <span className="login-error">{errors.email}</span>}
            </div>

            <div className="login-group">
              <label className="login-label" htmlFor="password">
                Password
              </label>
              <div className="password-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={user.password}
                  onChange={handleChange}
                  className={`login-input ${errors.password ? "error" : ""}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <span className="login-error">{errors.password}</span>}
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? <span className="spinner"></span> : null}
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="login-foot">
            Don&apos;t have an account?{" "}
            <a href="/register">Create one</a>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;