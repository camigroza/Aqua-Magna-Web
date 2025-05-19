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
import { Link, useNavigate } from "react-router-dom";
import { auth, database } from "../config/firebaseElements";
import { useEffect, useState } from "react";
import { get, ref, set } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import CloseIcon from "@mui/icons-material/Close";

/**
 * page used to view and modify the company details.
 * it collects the data about the company from the database and populates the correspondent fields
 * it saves the new data in the database when the save button is pressed
 * it disconnects the company from the Auth instance and navigates back to the index page
 * @returns page populated with the app bar with the app icon and name and a paper where the fields and buttons are placed
 */
export default function Profile() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = prefersDarkMode ? darkTheme : lightTheme;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const handleSignOut = () => {
    auth.signOut().then(() => navigate("/"));
  };

  const handleEmailChange = (newEmail) => setEmail(newEmail);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchCompany = async () => {
          try {
            const companyRef = ref(database, `companies/${user.uid}`);
            const snapshot = await get(companyRef);
            if (snapshot.exists()) {
              const data = snapshot.val();
              setName(data.name || "");
              setAddress(data.address || "");
              setCity(data.city || "");
              setCountry(data.country || "");
              setEmail(data.email || "");
            } else throw new Error("Account is not a company");
          } catch (error) {
            console.error(error.message);
          }
        };
        fetchCompany();
      } else {
        navigate("/signIn");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSaveDetails = async () => {
    try {
      const user = auth.currentUser;
      const companiesRef = ref(database, `companies/${user.uid}`);
      await set(companiesRef, {
        name,
        address,
        city,
        country,
        email,
      });
      setSnackbarMessage("Details saved successfully!");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error saving details:", error.message);
      setSnackbarMessage("Problem saving details!");
      setOpenSnackbar(true);
    }
  };

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
              Company Profile
            </Typography>
            <Divider sx={{ width: "100%" }} />
          </Stack>

          <Box mt={3}>
            <Stack spacing={2}>
              <Name onChange={(val) => setName(val)} value={name} />
              <Address onChange={(val) => setAddress(val)} value={address} />
              <City onChange={(val) => setCity(val)} value={city} />
              <Country onChange={(val) => setCountry(val)} value={country} />
              <Email onChange={handleEmailChange} value={email} />
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
