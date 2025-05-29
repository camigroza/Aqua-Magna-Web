import { useEffect, useState } from "react";
import { Business } from "@mui/icons-material";
import { Autocomplete, TextField, InputAdornment } from "@mui/material";
import { database } from "../config/firebaseElements";
import { get, ref } from "firebase/database";

/**
 * Dropdown component to select a company from existing companies in the database
 * @param {*} param0
 * @returns Autocomplete dropdown for companies
 */
export default function Company({ value, onChange }) {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companiesRef = ref(database, "companies");
        const snapshot = await get(companiesRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const companyList = Object.values(data)
            .map((c) => c.name)
            .filter(Boolean);
          setCompanies(companyList);
        }
      } catch (error) {
        console.error("Error fetching companies:", error.message);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <Autocomplete
      options={companies}
      value={value}
      onChange={(event, newValue) => onChange(newValue || "")}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Company"
          variant="outlined"
          margin="normal"
          fullWidth
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Business />
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );
}
