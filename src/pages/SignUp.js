import { ThemeProvider } from "@emotion/react";
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
} from "@mui/material";
import { darkTheme, lightTheme } from "../config/theme";
import Email from "../components/Email";
import Password from "../components/Password";
import Name from "../components/Name";
import Address from "../components/Address";
import City from "../components/City";
import Country from "../components/Country";
import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, database } from "../config/firebaseElements";
import { ref, set } from "firebase/database";
import { Link, useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";

/**
 * SignUp page for company registration.
 * Improved UX and styling.
 */
export default function SignUp() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = prefersDarkMode ? darkTheme : lightTheme;

  // Form state
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
  const navigate = useNavigate();

  // Disable signup if required fields are empty
  const isFormValid =
    email.trim() &&
    password.trim() &&
    name.trim() &&
    address.trim() &&
    city.trim() &&
    country.trim();

  const handleSignUp = async () => {
    if (!isFormValid) return;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential) {
        const user = userCredential.user;
        const userId = user.uid;
        const companiesRef = ref(database, `companies/${userId}`);
        await set(companiesRef, {
          name,
          address,
          city,
          country,
          email,
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Error signing up:", error.message);
      setSnackbarMessage(
        "Problem creating account! Make sure to use a valid company email."
      );
      setOpenSnackbar(true);
    }
    setLoading(false);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
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
  }, [isSignedIn, navigate]);

  return (
    <ThemeProvider theme={theme}>
      <AppBar
        position="static"
        elevation={10}
        enableColorOnDark
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
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Avatar
              alt="Aqua Magna"
              src="logo512.png"
              sx={{ width: 80, height: 80, mx: "auto", mb: 2 }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              Register Your Company
            </Typography>
          </Box>

          <Box
            component="form"
            noValidate
            autoComplete="off"
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
              <Name onChange={setName} value={name} />
              <Address onChange={setAddress} value={address} />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <City onChange={setCity} value={city} />
              <Country onChange={setCountry} value={country} />
            </Box>

            <Email onChange={setEmail} value={email} />
            <Password onChange={setPassword} value={password} />

            <Button
              variant="contained"
              color="primary"
              onClick={handleSignUp}
              disabled={!isFormValid || loading}
              size="large"
              sx={{ mt: 2, borderRadius: "20px" }}
            >
              {loading ? <CircularProgress size={24} /> : "Create Company"}
            </Button>

            <Button
              component={Link}
              to="/signIn"
              variant="text"
              sx={{ mt: 1, mb: 2 }}
            >
              Company already created? Sign In!
            </Button>
          </Box>

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
                color="inherit"
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
