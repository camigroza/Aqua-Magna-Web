import React, { useRef, useState } from "react";
import {
  useMediaQuery,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  ThemeProvider,
  Grid,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import { darkTheme, lightTheme } from "../config/theme";

/**
 * main page shown when there is no company logged in
 * @returns the page populated with the appbar containing the app icon and name, signUp and login text buttons and a box with a welcome message
 */
export default function WelcomePage() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = prefersDarkMode ? darkTheme : lightTheme;

  const infoSectionRef = useRef(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: "",
    details: "",
  });

  const handleScroll = () => {
    if (infoSectionRef.current) {
      infoSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCardClick = (title, details) => {
    setDialogContent({ title, details });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const infoCards = [
    {
      title: "pH",
      description:
        "Indicates acidity or alkalinity. Ideal drinking water ranges between 6.5 and 8.5.",
      icon: "🌡️",
      details:
        "pH stands for 'potential of Hydrogen'. It measures the hydrogen ion concentration in the water. A low pH (<6.5) indicates acidic water, which can corrode pipes and leach metals. High pH (>8.5) can cause scaling and taste issues.",
    },
    {
      title: "Turbidity",
      description:
        "Measures water clarity. Higher turbidity means more particles and potential contamination.",
      icon: "🌫️",
      details:
        "Turbidity refers to the cloudiness of water caused by large numbers of individual particles. High turbidity can indicate the presence of disease-causing organisms like bacteria and viruses.",
    },
    {
      title: "Conductivity",
      description:
        "Reflects the presence of dissolved salts or minerals. Useful for purity and pollution analysis.",
      icon: "⚡",
      details:
        "Conductivity is a measure of water's ability to pass an electrical current. It is directly related to the concentration of ions. High conductivity indicates polluted or mineral-heavy water.",
    },
    {
      title: "Why It Matters",
      description:
        "Accurate water data ensures public health, agricultural safety, and environmental sustainability.",
      icon: "💧",
      details:
        "Monitoring key parameters helps prevent waterborne diseases, ensures agricultural irrigation quality, and supports environmental conservation.",
    },
  ];

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
            style={{ flexGrow: 1, color: theme.palette.surface.onMain }}
          >
            Aqua Magna
          </Typography>
          <Button href="/signUp" sx={{ color: theme.palette.primary.main }}>
            Sign up
          </Button>
          <Button href="/signIn" sx={{ color: theme.palette.primary.main }}>
            Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          width: "100%",
          height: "100vh",
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('background.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          px: 2,
        }}
      >
        <Typography
          variant="h2"
          gutterBottom
          style={{ color: darkTheme.palette.surface.onMain }}
        >
          Welcome to Aqua Magna!
        </Typography>
        <Typography
          variant="h5"
          style={{ color: darkTheme.palette.surface.onMain }}
        >
          Your number one solution for water management.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ borderRadius: "30px", px: 5, py: 1.5, mt: 3 }}
          onClick={handleScroll}
        >
          Learn More
        </Button>
      </Box>

      {/* Info Section */}
      <Box
        ref={infoSectionRef}
        sx={{
          backgroundColor: theme.palette.background.default,
          py: 10,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" fontWeight="bold" mb={6}>
            Key Water Quality Indicators
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {infoCards.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  elevation={4}
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    transition: "transform 0.3s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => handleCardClick(item.title, item.details)}
                >
                  <CardContent>
                    <Typography
                      variant="h3"
                      align="center"
                      gutterBottom
                      component="div"
                    >
                      {item.icon}
                    </Typography>
                    <Typography variant="h6" align="center" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      align="center"
                      color="text.secondary"
                    >
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Dialog with Close Button */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {dialogContent.title}
          <IconButton onClick={handleDialogClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogContent.details}</DialogContentText>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}
