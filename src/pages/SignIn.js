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
import { get, ref } from "firebase/database";
import CloseIcon from "@mui/icons-material/Close";

export default function SignIn() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = prefersDarkMode ? darkTheme : lightTheme;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);

  const navigate = useNavigate();

  const handleSignIn = async () => {
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
        } else {
          throw new Error("Account is not a company");
        }
      }
    } catch (error) {
      console.error("Error signing in:", error.message);
      setSnackbarMessage(
        "Sign-in failed. Make sure this is a valid company account."
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
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('background.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          py: { xs: 8, sm: 10 },
          px: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Paper
          elevation={10}
          sx={{
            p: 3,
            width: "100%",
            maxWidth: 400,
            backgroundColor: theme.palette.secondary.container,
            borderRadius: 3,
            mx: "auto",
          }}
        >
          <Avatar
            alt="Aqua Magna"
            src="logo512.png"
            sx={{
              width: 70,
              height: 70,
              mx: "auto",
              mb: 2,
            }}
          />
          <Typography variant="h4" align="center" gutterBottom>
            Welcome back!
          </Typography>

          <Email onChange={(val) => setEmail(val)} value={email} />
          <Password onChange={(val) => setPassword(val)} />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, borderRadius: 2 }}
            onClick={handleSignIn}
            disabled={loading || !email || !password}
          >
            {loading ? <CircularProgress size={24} /> : "Sign In"}
          </Button>

          <Button
            fullWidth
            variant="text"
            sx={{ mt: 2, mb: 2 }}
            component={Link}
            to="/signUp"
          >
            New company? Sign Up!
          </Button>

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
