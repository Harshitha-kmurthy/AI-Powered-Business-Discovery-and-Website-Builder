// Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

.reg-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: reg-bg 15s ease infinite;
  padding: 20px;
  overflow: hidden;
  position: relative;
}
@keyframes reg-bg {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.reg-bubble {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  animation: reg-float 12s infinite ease-in-out;
}
.reg-bubble:nth-child(1){ width:120px;height:120px;top:10%;left:15%;animation-delay:0s;}
.reg-bubble:nth-child(2){ width:80px;height:80px;top:70%;left:80%;animation-delay:2s;}
.reg-bubble:nth-child(3){ width:60px;height:60px;top:40%;left:75%;animation-delay:4s;}
.reg-bubble:nth-child(4){ width:150px;height:150px;top:80%;left:10%;animation-delay:1s;}
@keyframes reg-float {
  0%,100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-40px) scale(1.1); }
}
.reg-card {
  position: relative;
  width: 100%;
  max-width: 440px;
  padding: 45px 40px;
  border-radius: 24px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.25);
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  animation: reg-in 0.7s cubic-bezier(.2,.9,.3,1.3);
  z-index: 1;
}
@keyframes reg-in {
  from { opacity: 0; transform: translateY(30px) scale(.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.reg-title {
  color: #fff;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 8px;
  letter-spacing: 1px;
}
.reg-sub {
  color: rgba(255,255,255,0.85);
  text-align: center;
  margin: 0 0 30px;
  font-size: 14px;
}
.reg-field {
  position: relative;
  margin-bottom: 22px;
}
.reg-input {
  width: 100%;
  padding: 14px 16px;
  font-size: 15px;
  color: #fff;
  background: rgba(255,255,255,0.1);
  border: 1.5px solid rgba(255,255,255,0.3);
  border-radius: 12px;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
  transition: all .3s;
}
.reg-input::placeholder { color: rgba(255,255,255,0.7); }
.reg-input:focus {
  border-color: #fff;
  background: rgba(255,255,255,0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}
.reg-input.error {
  border-color: #ff6b6b;
  animation: reg-shake 0.4s;
}
@keyframes reg-shake {
  0%,100%{transform:translateX(0);}
  25%{transform:translateX(-6px);}
  75%{transform:translateX(6px);}
}
.reg-err {
  color: #ffe0e0;
  font-size: 12px;
  margin: 6px 0 0 4px;
  animation: reg-fade .3s;
}
@keyframes reg-fade { from{opacity:0;} to{opacity:1;} }
.reg-btn {
  width: 100%;
  padding: 15px;
  font-size: 16px;
  font-weight: 600;
  color: #764ba2;
  background: #fff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.5px;
  transition: all .3s;
  position: relative;
  overflow: hidden;
}
.reg-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(0,0,0,0.2);
}
.reg-btn:disabled { opacity:.7; cursor:not-allowed; }
.reg-btn::before {
  content:''; position:absolute; top:0; left:-100%;
  width:100%; height:100%;
  background: linear-gradient(90deg, transparent, rgba(118,75,162,.2), transparent);
  transition: left .5s;
}
.reg-btn:hover::before { left: 100%; }
.reg-foot {
  text-align: center;
  color: rgba(255,255,255,0.85);
  margin-top: 22px;
  font-size: 14px;
}
.reg-foot a {
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color .3s;
}
.reg-foot a:hover { border-bottom-color: #fff; }
.reg-spin {
  display:inline-block; width:18px; height:18px;
  border: 2px solid #764ba2;
  border-top-color: transparent;
  border-radius:50%;
  animation: reg-rot .8s linear infinite;
  vertical-align: middle;
}
@keyframes reg-rot { to { transform: rotate(360deg); } }
`;

function Register() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const err = {};
    if (!user.username.trim()) err.username = "Username is required";
    else if (user.username.length < 3) err.username = "At least 3 characters";
    if (!user.email.trim()) err.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
      err.email = "Enter a valid email";
    if (!user.password) err.password = "Password is required";
    else if (user.password.length < 6) err.password = "At least 6 characters";
    if (!user.confirmPassword) err.confirmPassword = "Please confirm password";
    else if (user.password !== user.confirmPassword)
      err.confirmPassword = "Passwords do not match";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const register = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = user;
      await API.post("/auth/register", payload);
      alert("Registration successful");
      navigate("/login");
    } catch {
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="reg-wrap">
        <span className="reg-bubble" />
        <span className="reg-bubble" />
        <span className="reg-bubble" />
        <span className="reg-bubble" />

        <form className="reg-card" onSubmit={register} noValidate>
          <h1 className="reg-title">Create Account</h1>
          <p className="reg-sub">Join us and start your journey ✨</p>

          <div className="reg-field">
            <input
              className={`reg-input ${errors.username ? "error" : ""}`}
              name="username"
              placeholder="Username"
              value={user.username}
              onChange={handleChange}
            />
            {errors.username && <div className="reg-err">{errors.username}</div>}
          </div>

          <div className="reg-field">
            <input
              className={`reg-input ${errors.email ? "error" : ""}`}
              name="email"
              type="email"
              placeholder="Email"
              value={user.email}
              onChange={handleChange}
            />
            {errors.email && <div className="reg-err">{errors.email}</div>}
          </div>

          <div className="reg-field">
            <input
              className={`reg-input ${errors.password ? "error" : ""}`}
              name="password"
              type="password"
              placeholder="Password"
              value={user.password}
              onChange={handleChange}
            />
            {errors.password && <div className="reg-err">{errors.password}</div>}
          </div>

          <div className="reg-field">
            <input
              className={`reg-input ${errors.confirmPassword ? "error" : ""}`}
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={user.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <div className="reg-err">{errors.confirmPassword}</div>
            )}
          </div>

          <button className="reg-btn" type="submit" disabled={loading}>
            {loading ? <span className="reg-spin" /> : "Register"}
          </button>

          <p className="reg-foot">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </form>
      </div>
    </>
  );
}

export default Register;