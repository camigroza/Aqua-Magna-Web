import { ThemeProvider } from "@emotion/react";
import {
  Snackbar,
  IconButton,
  Toolbar,
  AppBar,
  Avatar,
  Button,
  Paper,
  useMediaQuery,
  Typography,
  Box,
  Stack,
  Divider,
} from "@mui/material";
import { darkTheme, lightTheme } from "../config/theme";
import Email from "../components/Email";
import Name from "../components/Name";
import Address from "../components/Address";
import City from "../components/City";
import Country from "../components/Country";
import Company from "../components/Company";
import { Link, useNavigate } from "react-router-dom";
import { auth, database } from "../config/firebaseElements";
import { useEffect, useState } from "react";
import { get, ref, set } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import CloseIcon from "@mui/icons-material/Close";
import PhoneNumber from "../components/Phone";

/**
 * page used to view and modify the company/user details.
 * it collects the data about the company/user from the database and populates the correspondent fields
 * it saves the new data in the database when the save button is pressed
 * it disconnects the company/user from the Auth instance and navigates back to the index page
 * @returns page populated with the app bar with the app icon and name and a paper where the fields and buttons are placed
 */
export default function Profile() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = prefersDarkMode ? darkTheme : lightTheme;
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState(null); // "company" | "user"
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const handleSignOut = () => {
    auth.signOut().then(() => navigate("/"));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/signIn");
        return;
      }

      try {
        const companyRef = ref(database, `companies/${user.uid}`);
        const userRef = ref(database, `users/${user.uid}`);

        const [companySnap, userSnap] = await Promise.all([
          get(companyRef),
          get(userRef),
        ]);

        if (companySnap.exists()) {
          const data = companySnap.val();
          setAccountType("company");
          setName(data.name || "");
          setAddress(data.address || "");
          setCity(data.city || "");
          setCountry(data.country || "");
          setEmail(data.email || "");
          setCompany(data.company || "");
          setPhone(data.phone || "");
        } else if (userSnap.exists()) {
          const data = userSnap.val();
          setAccountType("user");
          setName(data.name || "");
          setEmail(data.email || "");
          setCompany(data.company || "");
          setPhone(data.phone || "");
        } else {
          throw new Error("User account not found in database.");
        }
      } catch (error) {
        console.error(error.message);
        navigate("/signIn");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSaveDetails = async () => {
    try {
      const user = auth.currentUser;
      const path = accountType === "company" ? `companies` : `users`;
      const userRef = ref(database, `${path}/${user.uid}`);

      const userData =
        accountType === "company"
          ? { name, address, city, country, email, company, phone }
          : { name, email, company, phone };

      await set(userRef, userData);
      setSnackbarMessage("Details saved successfully!");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error saving details:", error.message);
      setSnackbarMessage("Problem saving details!");
      setOpenSnackbar(true);
    }
  };

  const renderCompanyFields = () => (
    <>
      <Company onChange={setName} value={name} />
      <Address onChange={setAddress} value={address} />
      <City onChange={setCity} value={city} />
      <Country onChange={setCountry} value={country} />
      <Email onChange={setEmail} value={email} />
    </>
  );

  const renderUserFields = () => (
    <>
      <Name onChange={setName} value={name} />
      <Email onChange={setEmail} value={email} />
      <Company onChange={setCompany} value={company} />
      <PhoneNumber onChange={setPhone} value={phone} />
    </>
  );

  return (
    <ThemeProvider theme={theme}>
      <AppBar
        position="static"
        elevation={6}
        sx={{ backgroundColor: theme.palette.surface.main }}
      >
        <Toolbar>
          <Link to="/">
            <IconButton edge="start" aria-label="menu">
              <Avatar src="logo192.png" sx={{ width: 32, height: 32 }} />
            </IconButton>
          </Link>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, color: theme.palette.surface.onMain }}
          >
            Aqua Magna
          </Typography>
          <IconButton edge="end" color="black" onClick={() => navigate("/")}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('background.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: -1,
        }}
      />

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
          py: 2,
        }}
      >
        <Paper
          elevation={10}
          sx={{
            width: "100%",
            maxWidth: 480,
            borderRadius: 4,
            p: 3,
            backgroundColor: theme.palette.secondary.container,
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Avatar src="logo512.png" sx={{ width: 56, height: 56 }} />
            <Typography variant="h6" fontWeight={500} align="center">
              {accountType === "company" ? "Company Profile" : "User Profile"}
            </Typography>
            <Divider sx={{ width: "100%" }} />
          </Stack>

          <Box mt={3}>
            <Stack spacing={2}>
              {accountType === "company"
                ? renderCompanyFields()
                : renderUserFields()}
            </Stack>
          </Box>

          <Stack direction="row" spacing={2} mt={4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSaveDetails}
              sx={{ borderRadius: 2 }}
            >
              Save
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={handleSignOut}
              sx={{ borderRadius: 2 }}
            >
              Sign Out
            </Button>
          </Stack>

          <Snackbar
            open={openSnackbar}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
            message={snackbarMessage}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          />
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
