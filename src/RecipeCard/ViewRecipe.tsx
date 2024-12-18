// ViewRecipe Component
import React from 'react';
import { Card, ListGroup, Container, Col, Row } from "react-bootstrap";
import { RecipeData, Language } from "../Types.js";
import { translate } from "../utils.js";
import moment from 'moment/min/moment-with-locales';

type ViewRecipeProps = {
    recipe: RecipeData;
    language: Language;
};

const formatTime = (time: string|undefined, language: Language) => {
    if (!time) {
        return time;
    }
    const duration = moment.duration(time);

    return (duration.hours() > 0 || duration.minutes() > 0) && duration.locale(language).humanize();
};

const ViewRecipe: React.FC<ViewRecipeProps> = ({ recipe, language }) => (
            <Container style={{width: "90%"}}>
                <Col>
                    <Row>
                        <h1>{recipe.name}</h1>
                    </Row>
                </Col>
                <Col md={3} style={{ textAlign: "center" }}>
                    {recipe.image && recipe.image.length > 0 && (
                        <Card.Img
                            style={{ width: "100%" }}
                            variant="top"
                            src={recipe.image[0]}
                            alt={recipe.name}
                        />
                    )}
                    <ListGroup variant="flush">
                        <ListGroup.Item>{translate("cookTime", language)}: {formatTime(recipe.cookTime, language)}</ListGroup.Item>
                        <ListGroup.Item>{translate("prepTime", language)}: {formatTime(recipe.prepTime, language)}</ListGroup.Item>
                        <ListGroup.Item>{translate("totalTime", language)}: {formatTime(recipe.totalTime, language)}</ListGroup.Item>
                    </ListGroup>
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
            </Container>
);

export default ViewRecipe;