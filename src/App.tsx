import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Container,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { Brightness4, Brightness7, Menu as MenuIcon, Person } from "@mui/icons-material";
import RecipeList from "./RecipeList/RecipeList.js";
import RecipeScraper from "./recipescraper/recipescraper.js";
import RecipeView from "./RecipeView/RecipeView.js";
import { useApplicationContext } from "./Components/ApplicationContext/useApplicationContext.js";
import { translate } from "./utils.js";
import moment from "moment/min/moment-with-locales";
import { signInWithGoogle } from "./main.js";

function App() {
  const navigate = useNavigate();
  const { language, theme, toggleTheme, user, setLanguage, signOut } = useApplicationContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileAnchorEl, setMobileAnchorEl] = useState<null | HTMLElement>(null);
  const isMobile = useMediaQuery("(max-width:600px)");

  // Preserve original humanize
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const originalHumanize = (moment.duration as any).fn.humanize;

  // Override the humanize function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (moment.duration as any).fn.humanize = function (withSuffix: boolean) {
    const durationMinutes = this.asMinutes();
    if (durationMinutes < 60) {
      return `${Math.round(durationMinutes)} min`;
    } else {
      return originalHumanize.call(this, withSuffix);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              {translate("title", language)}
            </Link>
          </Typography>
          {!isMobile && (
            <>
              <Button color="inherit" onClick={() => navigate("/recipes")}>
                {translate("recipes", language)}
              </Button>
              <Button color="inherit" onClick={() => navigate("/scraper")}>
                {translate("scraper", language)}
              </Button>
              <IconButton color="inherit" onClick={toggleTheme}>
                {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
              <Button color="inherit" onClick={handleMenuClick}>
                {language === "en" ? "English" : "Nederlands"}
              </Button>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem
                  onClick={() => {
                    setLanguage("en");
                    handleMenuClose();
                  }}
                >
                  English
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setLanguage("nl");
                    handleMenuClose();
                  }}
                >
                  Nederlands
                </MenuItem>
              </Menu>
            </>
          )}
          {isMobile && (
            <>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenuClick}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={mobileAnchorEl}
                open={Boolean(mobileAnchorEl)}
                onClose={handleMobileMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    navigate("/");
                    handleMobileMenuClose();
                  }}
                >
                  {translate("home", language)}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate("/scraper");
                    handleMobileMenuClose();
                  }}
                >
                  {translate("add", language)}
                </MenuItem>
              </Menu>
              <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <List>
                  <ListItem component={Link} to="/">
                    <ListItemText primary={translate("home", language)} />
                  </ListItem>
                  <ListItem component={Link} to="/scraper">
                    <ListItemText primary={translate("add", language)} />
                  </ListItem>
                </List>
              </Drawer>
            </>
          )}
          <div style={{ marginLeft: "auto" }}>
            {user && user.photoURL ? (
              <IconButton color="inherit">
                <Avatar
                  onClick={signOut}
                  src={user.photoURL}
                  alt="User Avatar"
                  style={{ width: "40px", height: "40px", marginRight: "10px" }}
                />
              </IconButton>
            ) : (
              <IconButton color="inherit" onClick={signInWithGoogle}>
                <Person />
              </IconButton>
            )}
          </div>
        </Toolbar>
      </AppBar>
      <Container>
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/scraper" element={<RecipeScraper />} />
          <Route path="/recipe/:id" element={<RecipeView edit={false} />} />
          <Route path="/recipe/:id/edit" element={<RecipeView edit={true} />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
