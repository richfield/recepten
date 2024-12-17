import React, { useState } from 'react';
import axios from 'axios';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { translate } from "../utils.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { useBusy } from "../Busy/BusyContext.js";
import { useNavigate } from "react-router-dom";

type RecipeScraperProps = {
    language: "en" | "nl";
};

const RecipeScraper: React.FC<RecipeScraperProps> = ({language}) => {
    const [url, setUrl ] = useState<string>("");
    const { showBusy, hideBusy } = useBusy();
    const navigate = useNavigate();

    const fetchData = async (url: string) => {
        showBusy();
        try {
            const response = await axios.get(`/api/scrape?url=${url}`); // API call through proxy
            navigate(`/recipe/${response.data._id}`)
        } catch (error) {
            console.error('Error fetching recipe data:', error);
        }
        hideBusy();
    };

    const onUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(event.target.value);
    };

    return <div className="content">
        <Form>
            <Form.Group as={Row} style={{marginBottom: "15px"}}>
                <Col lg={11}>
                    <Form.Control
                        type="text"
                        id="inputUrl"
                        aria-describedby="urlHelp"
                        value={url}
                        onChange={onUrlChange}
                        placeholder={translate("enterRecipeLink", language)}
                    />
                </Col>
                <Col xs className="text-end">
                    <Button variant="primary" onClick={() => fetchData(url)}>
                        <FontAwesomeIcon icon={faDownload} />
                    </Button>
                </Col>
            </Form.Group>
        </Form>
    </div>
    // ... rest of your component rendering logic ...
};
export default RecipeScraper