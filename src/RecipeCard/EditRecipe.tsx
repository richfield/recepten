// EditRecipe Component
import React from 'react';
import { Form, Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { Card, Button, Container, Row, Col, Form as BootstrapForm, Image, ButtonGroup } from "react-bootstrap";
import { RecipeData, Language } from "../Types.js";
import { translate } from "../utils.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import myArrayMutators from "./mutators.js";
import { DurationPickerField } from "../Components/DurationPicker.js";

type EditRecipeProps = {
    recipe: RecipeData;
    onSave: (recipe: RecipeData) => void;
    language: Language;
    toggleEdit: () => void
};


const EditRecipe: React.FC<EditRecipeProps> = ({ recipe, onSave, language, toggleEdit }) => {


    const handleSubmit = (values: RecipeData) => {
        console.log({ values })
        onSave(values);
    };

    return (
        <Form
            initialValues={recipe}
            onSubmit={handleSubmit}
            mutators={{ ...myArrayMutators }}
            render={({ handleSubmit }) => (
                <BootstrapForm onSubmit={handleSubmit}>
                    <Row className="d-flex justify-content-between align-items-center">
                        <Col />
                        <Col xs="auto">
                            <ButtonGroup>
                                <Button variant="outline" size="sm" onClick={handleSubmit}>
                                    <FontAwesomeIcon icon={faSave} />
                                </Button>
                                <Button variant="outline" size="sm" onClick={toggleEdit}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </Button>
                            </ButtonGroup>
                        </Col>
                    </Row>
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
                                                <Col><h1>{translate("Images", language)}:</h1></Col>
                                                <Col xs="auto">
                                                    <Button variant="outline-secondary" onClick={() => fields.push('')}>
                                                        <FontAwesomeIcon icon={faPlus} />
                                                    </Button>
                                                </Col>
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
                                                            <Image
                                                                style={{ maxWidth: "100%" }}
                                                                src={fields.value[index]}
                                                                alt={`Image ${index + 1}`}
                                                                rounded
                                                            />

                                                        </Col>
                                                        <Col xs="auto">
                                                            <Button variant="outline-secondary" onClick={() => fields.remove(index)}>
                                                                <FontAwesomeIcon icon={faMinus} />
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                ))}
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
                                <Row style={{ marginTop: "10px" }}>
                                    <FieldArray name="recipeIngredient">
                                        {({ fields }) => (
                                            <>
                                                <Col>
                                                    <h1>{translate("ingredients", language)}</h1>
                                                </Col>
                                                <Col xs="auto">
                                                    <Button variant="outline-secondary" onClick={() => fields.push('')}>
                                                        <FontAwesomeIcon icon={faPlus} />
                                                    </Button>
                                                </Col>
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
                                                            <Button variant="outline-secondary" onClick={() => fields.remove(index)}>
                                                                <FontAwesomeIcon icon={faMinus} />
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                ))}
                                            </>
                                        )}
                                    </FieldArray>
                                </Row>
                                <Row>
                                    <FieldArray name="recipeInstructions">
                                        {({ fields }) => (
                                            <>
                                                <Col>
                                                    <h1>{translate("instructions", language)}:</h1>
                                                </Col>
                                                <Col xs="auto">
                                                    <Button variant="outline-secondary" onClick={() => fields.push('')}>
                                                        <FontAwesomeIcon icon={faPlus} />
                                                    </Button>
                                                </Col>

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
                                                            <Button variant="outline-secondary" onClick={() => fields.remove(index)}>
                                                                <FontAwesomeIcon icon={faMinus} />
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                ))}
                                            </>
                                        )}
                                    </FieldArray>
                                </Row>
                                <Row>
                                    <h1>{translate("times", language)}</h1>
                                    <DurationPickerField name="cookTime" label={translate("cookTime", language)} />
                                    <DurationPickerField name="prepTime" label={translate("prepTime", language)} />
                                    <DurationPickerField name="totalTime" label={translate("totalTime", language)} />
                                </Row>
                            </Container>
                        </Card.Body>
                        <Card.Footer>
                            <Button type="submit" variant="outline-secondary">
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
