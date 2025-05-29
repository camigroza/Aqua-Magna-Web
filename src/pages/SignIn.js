import {
  CircularProgress,
  Button,
  Typography,
  Avatar,
  useMediaQuery,
  Paper,
  Snackbar,
  Box,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import { ThemeProvider } from "@emotion/react";
import { darkTheme, lightTheme } from "../config/theme";
import Email from "../components/Email";
import Password from "../components/Password";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../config/firebaseElements";
import { Link, useNavigate } from "react-router-dom";
import { get, ref, set } from "firebase/database";
import CloseIcon from "@mui/icons-material/Close";

export default function SignIn() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = prefersDarkMode ? darkTheme : lightTheme;

  const [accountType, setAccountType] = useState(null); // "company" | "user"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);

  const navigate = useNavigate();

  const isFormValid = email && password;

  const handleSignIn = async () => {
    if (!isFormValid) return;

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential) {
        const companyRef = ref(
          database,
          `companies/${userCredential.user.uid}`
        );
        const snapshot = await get(companyRef);
        if (snapshot.exists()) {
          navigate("/");
        } else throw new Error("Account is not a company");
      }
    } catch (error) {
      console.error("Error signing in:", error.message);
      setSnackbarMessage(
        "Problem while signing in! Make sure the account is created and it is a company account!"
      );
      setOpenSnackbar(true);
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
        Choose Account Type To Login
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

  const renderForm = () => (
    <>
      <Email onChange={setEmail} value={email} />
      <Password onChange={setPassword} value={password} name="new-password" />
    </>
  );

  return (
    <ThemeProvider theme={theme}>
      <AppBar
        position="static"
        elevation={10}
        enableColorOnDark
        sx={{ backgroundColor: theme.palette.surface.main }}
      >
        <Toolbar>
          <Link to={"/"}>
            <IconButton edge="start" aria-label="menu">
              <Avatar src="logo192.png" />
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
          minHeight: "100vh",
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          py: { xs: 8, sm: 10 },
          px: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
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
                    ? "Sign In as a Company"
                    : "Sign In as a User"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {renderForm()}

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSignIn}
                  disabled={loading || !isFormValid}
                  size="large"
                  sx={{ mt: 2, borderRadius: "20px" }}
                >
                  {loading ? <CircularProgress size={24} /> : "Sign In"}
                </Button>

                <Button
                  component={Link}
                  to="/signUp"
                  variant="text"
                  sx={{ mt: 1 }}
                >
                  Are you new to Aqua Magna? Sign Up
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
