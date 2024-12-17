import { Button, Container, Form, Nav, Navbar, NavDropdown, Image } from "react-bootstrap"
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import './App.css'
import RecipeScraper from "./recipescraper/recipescraper.js"
import { useContext, useState } from "react";
import { translate } from "./utils.js";
import moment from 'moment/min/moment-with-locales';
import RecipeList from "./RecipeList/RecipeList.js";
import RecipeView from "./RecipeView/RecipeView.js";
import { faSearch, faSignInAlt, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AuthContext, { AuthProvider } from "./AuthContext/AuthContext.js";
import { signInWithGoogle } from "./main.js";


function App() {
  const [language, setLanguage] = useState<"en" | "nl">("nl")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const originalHumanize = (moment.duration as any).fn.humanize;
  const navigate = useNavigate();

  // Override the humanize function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (moment.duration as any).fn.humanize = function (withSuffix: boolean) {
    const durationMinutes = this.asMinutes();
    if (durationMinutes < 60) {
      const roundedMinutes = Math.round(durationMinutes);
      const localeData = moment.localeData(language);
      const minuteString = localeData.relativeTime(roundedMinutes, !!withSuffix, 'mm', false);
      return minuteString.replace('%d', roundedMinutes.toString());
    }
    return originalHumanize.call(this, withSuffix);
  };



  const NavBar = () => {
    const authContext = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState<string>("");
    if (!authContext) throw new Error("AuthContext must be used within AuthProvider");

    const { user, signOut } = authContext;

    return <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">{translate("title", language)}</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav" role="main">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">{translate("home", language)}</Nav.Link>
            <Nav.Link as={Link} to="/add">{translate("add", language)}</Nav.Link>
          </Nav>
          <Nav className="ml-auto"> {/* Aligns to the right */}
            <Form
              className="d-flex"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery) {
                  navigate(`/search/${searchQuery}`);
                } else {
                  navigate("/");
                }
              }}
            >
              <Form.Control
                type="text"
                placeholder={translate("search", language)}
                className="me-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} />
              <Button variant="outline-light" type="submit">
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            </Form>
            <NavDropdown title={language === "en" ? "English" : "Nederlands"} id="languageDropdown">
              <NavDropdown.Item onClick={() => setLanguage("en")}>English</NavDropdown.Item>
              <NavDropdown.Item onClick={() => setLanguage("nl")}>Nederlands</NavDropdown.Item>
            </NavDropdown>
            <Navbar.Collapse className="justify-content-end" role="">
              {user && user.photoURL ? (<>

                <Image
                  src={user.photoURL || ''}
                  alt="User Avatar"
                  roundedCircle
                  style={{ width: '40px', height: '40px', marginRight: '10px' }}
                />
                <Button variant="outline-light" onClick={signOut}>
                  <FontAwesomeIcon size="xs" icon={faSignOutAlt} />
                </Button>

              </>
              ) : (
                <Button variant="outline-light" onClick={signInWithGoogle}>
                  <FontAwesomeIcon size="xs" icon={faSignInAlt} />
                </Button>
              )}
            </Navbar.Collapse>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  };
  return (
    <div className="app-container">
      <AuthProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<RecipeList language={language} />} />
          <Route path="/add" element={<RecipeScraper language={language} />} />
          <Route path="/recipe/:id" element={<RecipeView language={language} />} />
          <Route path="/search/:searchQuery" element={<RecipeList language={language} />} />
        </Routes>
      </AuthProvider>
    </div>
  )
}

export default App
