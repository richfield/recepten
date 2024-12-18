import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Button, Form, InputGroup, Row, Col, ButtonGroup } from "react-bootstrap";
import { AxiosResponse } from 'axios';
import { RecipeData, Language } from "../Types.js";
import { v4 as uuidv4 } from 'uuid';
import ViewRecipe from "./ViewRecipe.js";
import EditRecipe from "./EditRecipe.js";
import { faSave, faTimes, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type RecipeCardProps = {
    recipe: RecipeData | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    save: (data: RecipeData) => Promise<AxiosResponse<any, any>>;
    language: Language
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, save, language }) => {
    const [editableRecipe, setEditableRecipe] = useState<RecipeData | undefined>(recipe);
    const [editMode, setEditMode] = useState<boolean>(false);

    useEffect(() => {
        if (recipe !== undefined) {
            recipe._id = recipe._id || uuidv4()
        }
        console.log({ recipe })
        setEditableRecipe(recipe)
    }, [recipe])

    if (!editableRecipe) {
        return <></>
    }

    const handleSave = () => {
        save(editableRecipe);
        setEditMode(false);
    }


    return (
        editableRecipe && (<Col>
            <Row className="d-flex justify-content-between align-items-center">
                <Col/>
                <Col xs="auto">
                    {editMode ? (
                        <ButtonGroup>
                            <Button variant="outline" size="sm" onClick={handleSave}>
                                <FontAwesomeIcon icon={faSave} />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </Button>
                        </ButtonGroup>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                            <FontAwesomeIcon icon={faEdit} />
                        </Button>
                    )}
                </Col>
            </Row>
            <Row>
            {editMode ? <EditRecipe language={language} recipe={editableRecipe} onSave={setEditableRecipe} /> :
                <ViewRecipe language={language} recipe={editableRecipe} />}
            </Row>
        </Col>
        )
    );
}

export default RecipeCard;

