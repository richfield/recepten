import React, { useState } from 'react';
import axios from 'axios';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { RecipeData } from "../Types.js";
import RecipeCard from "../RecipeCard/RecipeCard.js";
import { translate } from "../utils.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

type RecipeScraperProps = {
    language: "en" | "nl";
};

const RecipeScraper: React.FC<RecipeScraperProps> = ({language}) => {
    const [recipe, setRecipe] = useState<RecipeData | undefined>();
    const [url, setUrl ] = useState<string>("");

    const fetchData = async (url: string) => {
        try {
            const response = await axios.get(`/api/scrape?url=${url}`); // API call through proxy
            setRecipe(response.data)
        } catch (error) {
            console.error('Error fetching recipe data:', error);
        }
    };

    const onUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(event.target.value);
    };

    const handleSave = async (data: RecipeData) => {
        return await axios.post('/api/recipes/save', data)
    }

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
        <RecipeCard recipe={recipe} save={handleSave} language = {language} />
    </div>
    // ... rest of your component rendering logic ...
};
export default RecipeScraper