import { Phone } from "@mui/icons-material";
import { InputAdornment, TextField } from "@mui/material";
import { useState, useEffect } from "react";

/**
 * component used for the phone number text field across the app
 * @param {*} param0
 * @returns TextField with validation for 10-digit phone number
 */
export default function PhoneNumber({ value, onChange }) {
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState("");

  useEffect(() => {
    const isValid = /^\d{10}$/.test(value);
    if (value === "") {
      setError(false);
      setHelperText("");
    } else if (!isValid) {
      setError(true);
      setHelperText("Phone number must be exactly 10 digits");
    } else {
      setError(false);
      setHelperText("");
    }
  }, [value]);

  const handleChange = (event) => {
    const input = event.target.value;
    onChange(input.replace(/\D/g, "")); // păstrează doar cifrele
  };

  return (
    <TextField
      label="Phone"
      variant="outlined"
      margin="normal"
      fullWidth
      value={value}
      onChange={handleChange}
      error={error}
      helperText={helperText}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Phone />
          </InputAdornment>
        ),
      }}
    />
  );
}
