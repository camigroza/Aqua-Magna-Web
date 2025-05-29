import {
  Avatar,
  Button,
  Paper,
  useMediaQuery,
  Typography,
  Box,
  Snackbar,
  CircularProgress,
  IconButton,
  Toolbar,
  AppBar,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ThemeProvider } from "@emotion/react";
import { darkTheme, lightTheme } from "../config/theme";
import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, database } from "../config/firebaseElements";
import { ref, set } from "firebase/database";
import { Link, useNavigate } from "react-router-dom";

import Email from "../components/Email";
import Password from "../components/Password";
import Name from "../components/Name";
import Address from "../components/Address";
import City from "../components/City";
import Country from "../components/Country";
import Company from "../components/Company";

export default function SignUp() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = prefersDarkMode ? darkTheme : lightTheme;
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState(null); // null | "company" | "user"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);

  const isCompanyFormValid =
    email && password && name && address && city && country;
  const isUserFormValid = email && password && name;

  const handleSignUp = async () => {
    const isFormValid =
      accountType === "company" ? isCompanyFormValid : isUserFormValid;
    if (!isFormValid) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userId = user.uid;
      const refPath =
        accountType === "company" ? `companies/${userId}` : `users/${userId}`;
      const userData =
        accountType === "company"
          ? { name, address, city, country, email }
          : { name, email, company: "", phone: "" };

      await set(ref(database, refPath), userData);
      navigate("/");
    } catch (error) {
      setSnackbarMessage("Problem creating account. Try again.");
      setOpenSnackbar(true);
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsSignedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      navigate("/");
    }
  }, [isSignedIn]);

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  const renderAccountChoice = () => (
    <Paper elevation={10} sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
      <Typography variant="h5" gutterBottom>
        Choose Account Type To Sign Up
      </Typography>
      <Box display="flex" justifyContent="center" gap={2} mt={3}>
        <Button variant="contained" onClick={() => setAccountType("company")}>
          Company
        </Button>
        <Button variant="outlined" onClick={() => setAccountType("user")}>
          User
        </Button>
      </Box>
    </Paper>
  );

  const renderCompanyForm = () => (
    <>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Company onChange={setName} value={name} />
        <Address onChange={setAddress} value={address} />
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <City onChange={setCity} value={city} />
        <Country onChange={setCountry} value={country} />
      </Box>
      <Email onChange={setEmail} value={email} />
      <Password onChange={setPassword} value={password} name="new-password" />
    </>
  );

  const renderUserForm = () => (
    <>
      <Name onChange={setName} value={name} />
      <Email onChange={setEmail} value={email} />
      <Password onChange={setPassword} value={password} name="new-password" />
    </>
  );

  return (
    <ThemeProvider theme={theme}>
      <AppBar
        position="static"
        sx={{ backgroundColor: theme.palette.surface.main }}
      >
        <Toolbar>
          <Link to="/">
            <IconButton edge="start" aria-label="home">
              <Avatar src="logo192.png" alt="Aqua Magna Logo" />
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
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('background.jpg')`,
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
          {!accountType ? (
            renderAccountChoice()
          ) : (
            <>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Avatar
                  src="logo512.png"
                  sx={{ width: 80, height: 80, mx: "auto", mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  {accountType === "company"
                    ? "Register Your Company"
                    : "Create User Account"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {accountType === "company"
                  ? renderCompanyForm()
                  : renderUserForm()}

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSignUp}
                  disabled={
                    loading ||
                    !(accountType === "company"
                      ? isCompanyFormValid
                      : isUserFormValid)
                  }
                  size="large"
                  sx={{ mt: 2, borderRadius: "20px" }}
                >
                  {loading ? <CircularProgress size={24} /> : "Sign Up"}
                </Button>

                <Button
                  component={Link}
                  to="/signIn"
                  variant="text"
                  sx={{ mt: 1 }}
                >
                  Already have an account? Sign In
                </Button>
              </Box>
            </>
          )}

          <Snackbar
            open={openSnackbar}
            autoHideDuration={4000}
            onClose={handleCloseSnackbar}
            message={snackbarMessage}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="black"
                onClick={handleCloseSnackbar}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          />
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
