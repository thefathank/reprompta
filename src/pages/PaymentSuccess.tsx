import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/analyze", { replace: true });
  }, [navigate]);
  return null;
}
