import { ThemeProvider } from "@emotion/react";
import { Link, useNavigate } from "react-router-dom";
import {
  useMediaQuery,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Typography,
  Button,
  Popover,
  Box,
  Card,
  CardContent,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { darkTheme, lightTheme } from "../config/theme";
import { useEffect, useState } from "react";
import { get, off, onValue, ref } from "firebase/database";
import { auth, database } from "../config/firebaseElements";
import { onAuthStateChanged } from "firebase/auth";
import EmployeeCard from "../components/EmployeeCard";

/** scan data object creator */
function ScanData(uid, name, date, location, ph, turbidity, conductivity) {
  return { uid, name, date, location, ph, turbidity, conductivity };
}

/** get user's name by uid */
async function getUserName(uid) {
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);
  if (snapshot.exists()) {
    return snapshot.val().name;
  }
  return "";
}

/** table row color based on standards */
function checkValues(ph, turbidity, conductivity, theme) {
  const phThreshhold = 7.5;
  if (
    Math.abs(phThreshhold - ph) <= 1.0 &&
    turbidity <= 1.0 &&
    conductivity <= 0.8
  )
    return theme.palette.secondary.container;
  else if (
    Math.abs(phThreshhold - ph) > 2.0 ||
    turbidity > 5.0 ||
    conductivity > 2.5
  )
    return theme.palette.error.container;
  return theme.palette.tertiary.container;
}

export default function Home() {
  const [rows, setRows] = useState([]);
  const [companyName, setCompanyName] = useState(null);
  const [userRole, setUserRole] = useState("");
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = prefersDarkMode ? darkTheme : lightTheme;
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredEmployee, setHoveredEmployee] = useState(null);
  const navigate = useNavigate();

  const handleSignOut = () => {
    auth.signOut().then(() => navigate("/"));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;

        const checkUserType = async () => {
          const companyRef = ref(database, `companies/${uid}`);
          const userRef = ref(database, `users/${uid}`);

          const [companySnap, userSnap] = await Promise.all([
            get(companyRef),
            get(userRef),
          ]);

          if (companySnap.exists()) {
            setUserRole("Company");
            setCompanyName(companySnap.val().name);
          } else if (userSnap.exists()) {
            setUserRole("User");
            setCompanyName(null); // important: reset pentru ca alt useEffect să nu ruleze
            const scanRef = ref(database, "scans");

            onValue(scanRef, async (snapshot) => {
              const allScans = snapshot.val();
              const userScans = [];

              for (let id in allScans) {
                const scan = allScans[id];
                if (scan.user === uid) {
                  const userName = await getUserName(uid);
                  userScans.unshift(
                    ScanData(
                      scan.user,
                      userName,
                      scan.date,
                      scan.location,
                      scan.ph,
                      scan.turbidity,
                      scan.conductivity
                    )
                  );
                }
              }

              setRows(userScans);
            });
          }
        };

        checkUserType();
      }
    });

    return () => unsubscribe();
  }, []);

  // Load scans for company
  useEffect(() => {
    if (companyName) {
      const scansRef = ref(database, "scans");
      const handleNewScan = async (snapshot) => {
        const scans = snapshot.val();
        const newScans = [];
        for (let id in scans) {
          const scan = scans[id];
          if (scan.company === companyName) {
            const userName = await getUserName(scan.user);
            newScans.unshift(
              ScanData(
                scan.user,
                userName,
                scan.date,
                scan.location,
                scan.ph,
                scan.turbidity,
                scan.conductivity
              )
            );
          }
        }
        setRows(newScans);
      };

      onValue(scansRef, handleNewScan);
      return () => off(scansRef, handleNewScan);
    }
  }, [companyName]);

  const handlePopoverOpen = (event, employeeUid) => {
    setAnchorEl(event.currentTarget);
    setHoveredEmployee(employeeUid);
  };

  const handlePopoverClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

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
          {userRole && (
            <Typography
              variant="body2"
              sx={{ mr: 2, color: theme.palette.primary.main }}
            ></Typography>
          )}

          <Button href="/profile" sx={{ color: theme.palette.primary.main }}>
            Profile
          </Button>

          <Button
            color="error"
            onClick={handleSignOut}
            sx={{ borderRadius: 2 }}
          >
            Sign Out
          </Button>
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

      <Box sx={{ padding: 3, pt: 10 }}>
        <Card elevation={6} sx={{ mb: 4, p: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Scan Data Overview
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <ReferenceArea
                  y1={6.5}
                  y2={8.5}
                  fill="green"
                  fillOpacity={0.1}
                />
                <Line
                  type="monotone"
                  dataKey="ph"
                  stroke={theme.palette.primary.main}
                  name="pH"
                />
                <ReferenceArea y1={0} y2={5} fill="blue" fillOpacity={0.1} />
                <Line
                  type="monotone"
                  dataKey="turbidity"
                  stroke={theme.palette.secondary.main}
                  name="Turbidity"
                />
                <ReferenceArea
                  y1={0}
                  y2={0.8}
                  fill="orange"
                  fillOpacity={0.1}
                />
                <Line
                  type="monotone"
                  dataKey="conductivity"
                  stroke={theme.palette.tertiary.main}
                  name="Conductivity"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Paper elevation={4}>
          <TableContainer>
            <Table stickyHeader sx={{ minWidth: 650 }} aria-label="scan table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">
                    <b>#</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Employee</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Date</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Location</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>pH</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Turbidity (NTU)</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Conductivity (mS/cm)</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor: checkValues(
                        row.ph,
                        row.turbidity,
                        row.conductivity,
                        theme
                      ),
                    }}
                  >
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell
                      align="center"
                      onMouseOver={(e) => handlePopoverOpen(e, row.uid)}
                      onMouseLeave={handlePopoverClose}
                    >
                      {row.name}
                    </TableCell>
                    <TableCell align="center">{row.date}</TableCell>
                    <TableCell align="center">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${row.location}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: theme.palette.primary.main,
                          textDecoration: "none",
                        }}
                      >
                        {row.location}
                      </a>
                    </TableCell>
                    <TableCell align="center">{row.ph}</TableCell>
                    <TableCell align="center">{row.turbidity}</TableCell>
                    <TableCell align="center">{row.conductivity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        onClose={handlePopoverClose}
        disableRestoreFocus
        sx={{ pointerEvents: "none" }}
      >
        <EmployeeCard uid={hoveredEmployee} />
      </Popover>
    </ThemeProvider>
  );
}
