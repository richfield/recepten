// ViewRecipe Component
import React from 'react';
import { Card, ListGroup, Container, Col, Row, Button } from "react-bootstrap";
import { RecipeData, Language } from "../Types.js";
import { translate } from "../utils.js";
import moment from 'moment/min/moment-with-locales';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

type ViewRecipeProps = {
    recipe: RecipeData;
    language: Language;
    toggleEdit: () => void
};

const formatTime = (time: string | undefined, language: Language) => {
    if (!time) {
        return time;
    }
    const duration = moment.duration(time);

    return (duration.hours() > 0 || duration.minutes() > 0) && duration.locale(language).humanize();
};

const ViewRecipe: React.FC<ViewRecipeProps> = ({ recipe, language, toggleEdit }) => (
    <Container>
        <Col>
            <Row className="d-flex justify-content-between align-items-center">
                <Col />
                <Col xs="auto">
                    <Button variant="outline" size="sm" onClick={toggleEdit} >
                        <FontAwesomeIcon icon={faEdit} />
                    </Button>
                </Col>
            </Row>
            <Row>
                <h1>{recipe.name}</h1>
            </Row>
            <Row>
                <Col md={3} style={{ textAlign: "center" }}>
                    <Card>
                    {recipe.images && recipe.images.length > 0 && (
                        <Card.Img
                            style={{ width: "100%" }}
                            variant="top"
                            src={`/api/recipes/${recipe._id}/image`}
                            alt={recipe.name}
                        />
                    )}
                    <ListGroup variant="flush">
                        <ListGroup.Item>{translate("cookTime", language)}: {formatTime(recipe.cookTime, language)}</ListGroup.Item>
                        <ListGroup.Item>{translate("prepTime", language)}: {formatTime(recipe.prepTime, language)}</ListGroup.Item>
                        <ListGroup.Item>{translate("totalTime", language)}: {formatTime(recipe.totalTime, language)}</ListGroup.Item>
                    </ListGroup>

                    </Card>
                    { recipe.keywords?.length !== 0 && <Card>
                        <Card.Header>
                            {translate("keywords", language)}
                        </Card.Header>
                        <Card.Body>
                            {recipe.keywords?.join(', ')}
                        </Card.Body>
                    </Card> }
                </Col>

                <Col md={9}>
                    <ListGroup variant="flush">
                        <ListGroup.Item>{translate("description", language)}: {recipe.description}</ListGroup.Item>
                        <ListGroup.Item>
                            {translate("ingredients", language)}:
                            <ListGroup>
                                {recipe.recipeIngredient?.map((ingredient, index) => (
                                    <ListGroup.Item key={index}>{ingredient}</ListGroup.Item>
                                ))}
                            </ListGroup>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            {translate("instructions", language)}:
                            <ListGroup as="ol" numbered>
                                {recipe.recipeInstructions?.map((instruction, index) => (
                                    <ListGroup.Item as="li" key={index}>{instruction.text}</ListGroup.Item>
                                ))}
                            </ListGroup>
                        </ListGroup.Item>
                    </ListGroup>
                </Col>
            </Row>

        </Col>

    </Container>
);

export default ViewRecipe;