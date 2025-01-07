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
  TextField,
  Card,
  ListItemIcon,
} from "@mui/material";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import {
  Add,
  Menu as MenuIcon,
  Person,
  Search,
} from "@mui/icons-material";
import RecipeList from "./RecipeList/RecipeList.js";
import { useApplicationContext } from "./Components/ApplicationContext/useApplicationContext.js";
import { translate } from "./utils.js";
import moment from "moment/min/moment-with-locales";
import { signInWithGoogle } from "./main.js";
import RecipeScraper from "./RecipeScraper/RecipeScraper.js";
import ViewRecipe from "./ViewRecipe/ViewRecipe.js";
import EditRecipe from "./EditRecipe/EditRecipe.js";
import UserProfile from "./UserProfile/UserProfile.js";

function App() {
  const navigate = useNavigate();
  const { language, user } =
    useApplicationContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileAnchorEl, setMobileAnchorEl] = useState<null | HTMLElement>(
    null
  );
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



  const handleMobileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };
  if (!user) {
    return (
      <Container
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Card style={{ padding: "20px", textAlign: "center" }}>
          <Typography variant="h5" component="div" gutterBottom>
            {translate("login", language)}
          </Typography>
          <IconButton color="inherit" onClick={signInWithGoogle}>
            <Person />
          </IconButton>
        </Card>
      </Container>
    );
  }

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
              <Button color="inherit" onClick={() => navigate("/scraper")} startIcon={<Add />} style={{marginRight: "10px"}}>
                {translate("add", language)}
              </Button>

              <SearchField />
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
                    navigate("/scraper");
                    handleMobileMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <Add fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="inherit">
                    {translate("add", language)}
                  </Typography>
                </MenuItem>
                <MenuItem>
                  <SearchField />
                </MenuItem>
              </Menu>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
              >
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
              <IconButton color="inherit" onClick={() => navigate("/profile")}>
                <Avatar
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
      <Container style={{ marginTop: "10px" }}>
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/scraper" element={<RecipeScraper />} />
          <Route path="/recipe/:id" element={<ViewRecipe />} />
          <Route path="/recipe/:id/edit" element={<EditRecipe />} />
          <Route path="/search/:searchQuery" element={<RecipeList />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </Container>
    </>
  );
}

const SearchField: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useApplicationContext();
  return (
    <>
      <TextField
        id="mainSearch"
        variant="outlined"
        placeholder={translate("search", language)}
        size="small"
        style={{ marginRight: "10px" }}
        onKeyPress={(event) => {
          if (event.key === "Enter") {
            const value = (event.target as HTMLInputElement).value;
            if (value) {
              navigate(`/search/${value}`);
            } else {
              navigate("/");
            }
          }
        }}
      />
      <Button
        color="inherit"
        onClick={() => {
          const value = (
            document.getElementById("mainSearch") as HTMLInputElement
          ).value;
          console.log({ value });
          if (value) {
            navigate(`/search/${value}`);
          } else {
            navigate("/");
          }
        }}
        size="small"
      >
        <Search fontSize="small" />
      </Button>
    </>
  );
};

export default App;
