import { useState, useRef } from "react";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import axios from "axios";
import { getApiBase } from "@/lib/api/client";

export default function PhoneLogin() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const confirmationRef = useRef(null);

  // Setup reCAPTCHA (invisible)
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
      });
    }
  };

  // Step 1: Send OTP
  const sendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      setupRecaptcha();
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`; // adjust country code
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      confirmationRef.current = confirmation;
      setStep("otp");
    } catch (err) {
      setError(err.message);
      window.recaptchaVerifier = null; // reset on error
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP → get Firebase ID token → send to backend
  const verifyOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await confirmationRef.current.confirm(otp);
      const idToken = await result.user.getIdToken();

      // Send token to your Express backend
      const res = await axios.post(`${getApiBase()}/auth/phone-login`, { idToken });
      
      // Store your app's JWT
      localStorage.setItem("token", res.data.token);
      
      // Redirect or update auth state
      window.location.href = "/";
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login with Phone</h2>

      {step === "phone" && (
        <div>
          <input
            type="tel"
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={sendOtp} disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </div>
      )}

      {step === "otp" && (
        <div>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
          />
          <button onClick={verifyOtp} disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          <button onClick={() => setStep("phone")}>Change Number</button>
        </div>
      )}

      {/* Required for invisible reCAPTCHA */}
      <div id="recaptcha-container"></div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
