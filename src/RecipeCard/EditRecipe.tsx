// EditRecipe Component
import React, { useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
//import arrayMutators from 'final-form-arrays';
import { Card, Button, Container, Row, Col, InputGroup, Form as BootstrapForm } from "react-bootstrap";
import { RecipeData, Language } from "../Types.js";
import { translate } from "../utils.js";
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

type EditRecipeProps = {
    recipe: RecipeData;
    onSave: (recipe: RecipeData) => void;
    language: Language;
};

const EditRecipe: React.FC<EditRecipeProps> = ({ recipe, onSave, language }) => {
    const [times, setTimes] = useState({
        cookHours: moment.duration(recipe.cookTime).hours(),
        cookMinutes: moment.duration(recipe.cookTime).minutes(),
        prepHours: moment.duration(recipe.prepTime).hours(),
        prepMinutes: moment.duration(recipe.prepTime).minutes(),
        totalHours: moment.duration(recipe.totalTime).hours(),
        totalMinutes: moment.duration(recipe.totalTime).minutes(),
    });

    const handleTimeChange = (field: keyof typeof times, value: number) => {
        setTimes({ ...times, [field]: value });
    };

    const handleSubmit = (values: RecipeData) => {
        const updatedValues = {
            ...values,
            cookTime: moment.duration({ hours: times.cookHours, minutes: times.cookMinutes }).toISOString(),
            prepTime: moment.duration({ hours: times.prepHours, minutes: times.prepMinutes }).toISOString(),
            totalTime: moment.duration({ hours: times.totalHours, minutes: times.totalMinutes }).toISOString(),
        };
        onSave(updatedValues);
    };

    return (
        <Form
            initialValues={recipe}
            onSubmit={handleSubmit}
            //mutators={{ ...arrayMutators }}
            render={({ handleSubmit }) => (
                <BootstrapForm onSubmit={handleSubmit}>
                    <Card style={{ width: '100%' }}>
                        <Card.Header>
                            <BootstrapForm.Group>
                                <Field name="name">
                                    {({ input }) => (
                                        <BootstrapForm.Control {...input} type="text" placeholder={translate("name", language)} />
                                    )}
                                </Field>
                            </BootstrapForm.Group>
                        </Card.Header>
                        <Card.Body>
                            <Container>
                                <Row>
                                    <FieldArray name="image">
                                        {({ fields }) => (
                                            <>
                                                <label>{translate("Images", language)}:</label>
                                                {fields.map((name, index) => (
                                                    <Row key={index} className="mb-2 align-items-center">
                                                        <Col md={8} sm={12}>
                                                            <Field name={name}>
                                                                {({ input }) => (
                                                                    <BootstrapForm.Control
                                                                        {...input}
                                                                        type="text"
                                                                        placeholder={translate("imageUrl", language)}
                                                                    />
                                                                )}
                                                            </Field>
                                                        </Col>
                                                        <Col md={2} sm={12} className="text-center">
                                                            <img
                                                                src={fields.value[index]}
                                                                alt={`Image ${index + 1}`}
                                                                style={{ maxWidth: "100%", maxHeight: "50px" }}
                                                            />
                                                        </Col>
                                                        <Col xs="auto">
                                                            <Button variant="danger" onClick={() => fields.remove(index)}>
                                                                <FontAwesomeIcon icon={faMinus} />
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                ))}
                                                <Button variant="primary" onClick={() => fields.push('')}>
                                                    <FontAwesomeIcon icon={faPlus} />
                                                </Button>
                                            </>
                                        )}
                                    </FieldArray>
                                </Row>
                                <Row>
                                    <Field name="description">
                                        {({ input }) => (
                                            <BootstrapForm.Control {...input} as="textarea" placeholder={translate("description", language)} />
                                        )}
                                    </Field>
                                </Row>
                                <Row>
                                    <FieldArray name="recipeIngredient">
                                        {({ fields }) => (
                                            <>
                                                <label>{translate("ingredients", language)}:</label>
                                                {fields.map((name, index) => (
                                                    <Row key={index} className="mb-2">
                                                        <Col>
                                                            <Field name={name}>
                                                                {({ input }) => (
                                                                    <BootstrapForm.Control {...input} type="text" placeholder={translate("ingredient", language)} />
                                                                )}
                                                            </Field>
                                                        </Col>
                                                        <Col xs="auto">
                                                            <Button variant="danger" onClick={() => fields.remove(index)}>
                                                                <FontAwesomeIcon icon={faMinus} />
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                ))}
                                                <Button variant="primary" onClick={() => fields.push('')}>
                                                    <FontAwesomeIcon icon={faPlus} />
                                                </Button>
                                            </>
                                        )}
                                    </FieldArray>
                                </Row>
                                <Row>
                                    <FieldArray name="recipeInstructions">
                                        {({ fields }) => (
                                            <>
                                                <label>{translate("instructions", language)}:</label>
                                                {fields.map((name, index) => (
                                                    <Row key={index} className="mb-2">
                                                        <Col>
                                                            <Field name={`${name}.text`}>
                                                                {({ input }) => (
                                                                    <BootstrapForm.Control {...input} as="textarea" placeholder={translate("instruction", language)} />
                                                                )}
                                                            </Field>
                                                        </Col>
                                                        <Col xs="auto">
                                                            <Button variant="danger" onClick={() => fields.remove(index)}>
                                                                <FontAwesomeIcon icon={faMinus} />
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                ))}
                                                <Button variant="primary" onClick={() => fields.push({ text: '' })}>
                                                    <FontAwesomeIcon icon={faPlus} />
                                                </Button>
                                            </>
                                        )}
                                    </FieldArray>
                                </Row>
                                <Row>
                                    <label>{translate("Times", language)}:</label>
                                    <InputGroup className="mb-3">
                                        <BootstrapForm.Control
                                            type="number"
                                            value={times.cookHours}
                                            onChange={(e) => handleTimeChange('cookHours', parseInt(e.target.value) || 0)}
                                            placeholder={translate("hours", language)}
                                            min="0"
                                        />
                                        <BootstrapForm.Control
                                            type="number"
                                            value={times.cookMinutes}
                                            onChange={(e) => handleTimeChange('cookMinutes', parseInt(e.target.value) || 0)}
                                            placeholder={translate("minutes", language)}
                                            min="0"
                                            max="59"
                                        />
                                        <span>{translate("cookTime", language)}</span>
                                    </InputGroup>
                                    <InputGroup className="mb-3">
                                        <BootstrapForm.Control
                                            type="number"
                                            value={times.prepHours}
                                            onChange={(e) => handleTimeChange('prepHours', parseInt(e.target.value) || 0)}
                                            placeholder={translate("hours", language)}
                                            min="0"
                                        />
                                        <BootstrapForm.Control
                                            type="number"
                                            value={times.prepMinutes}
                                            onChange={(e) => handleTimeChange('prepMinutes', parseInt(e.target.value) || 0)}
                                            placeholder={translate("minutes", language)}
                                            min="0"
                                            max="59"
                                        />
                                        <span>{translate("prepTime", language)}</span>
                                    </InputGroup>
                                    <InputGroup className="mb-3">
                                        <BootstrapForm.Control
                                            type="number"
                                            value={times.totalHours}
                                            onChange={(e) => handleTimeChange('totalHours', parseInt(e.target.value) || 0)}
                                            placeholder={translate("hours", language)}
                                            min="0"
                                        />
                                        <BootstrapForm.Control
                                            type="number"
                                            value={times.totalMinutes}
                                            onChange={(e) => handleTimeChange('totalMinutes', parseInt(e.target.value) || 0)}
                                            placeholder={translate("minutes", language)}
                                            min="0"
                                            max="59"
                                        />
                                        <span>{translate("totalTime", language)}</span>
                                    </InputGroup>
                                </Row>
                            </Container>
                        </Card.Body>
                        <Card.Footer>
                            <Button type="submit" variant="primary">
                                {translate("save", language)}
                            </Button>
                        </Card.Footer>
                    </Card>
                </BootstrapForm>
            )}
        />
    );
};

export default EditRecipe;
