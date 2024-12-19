// EditRecipe Component
import React, { useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { Card, Button, Container, Row, Col, Form as BootstrapForm, Image, ButtonGroup, OverlayTrigger, Popover } from "react-bootstrap";
import { RecipeData, Language } from "../Types.js";
import { translate } from "../utils.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faSave, faTimes, faEye, faStar } from '@fortawesome/free-solid-svg-icons';
import myArrayMutators from "./mutators.js";
import { DurationPickerField } from "../Components/DurationPicker.js";
import axios from "axios";

type EditRecipeProps = {
    recipe: RecipeData;
    onSave: (recipe: RecipeData) => void;
    language: Language;
    toggleEdit: () => void
};


const EditRecipe: React.FC<EditRecipeProps> = ({ recipe, onSave, language, toggleEdit }) => {
    const [forceRender, setForceRender] = useState<number>(0)

    const handleSubmit = (values: RecipeData) => {
        console.log({ values })
        onSave(values);
    };

    const uploadImage = async (recipeId: string, file: File): Promise<void> => {
        const formData = new FormData();
        formData.append('image', file);

        await axios.post(`/api/recipes/${recipeId}/image/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    };

    async function handleSetDefaultImage(url: string): Promise<void> {
        try {
            const recipeId = recipe._id
            await axios.post(`/api/recipes/${recipeId}/image/url`, { url }, {
                headers: { 'Content-Type': 'application/json' },
            });
            setForceRender(forceRender+1);
            console.log('Default image set successfully');
        } catch (error) {
            console.error('Failed to set default image', error);
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const recipeId = recipe._id; // Assuming `recipe` contains the ID
            if (recipeId) {
                uploadImage(recipeId, file)
                    .then(() => {
                        console.log('Image uploaded successfully');
                    })
                    .catch((err) => {
                        console.error('Failed to upload image', err);
                    });
            } else {
                console.error('Recipe ID is not defined');
            }
        }
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
                                <Row className="mb-4">
                                        <h1>{translate("Images", language)}:</h1>
                                    <Col md={4}>
                                        {recipe._id && <Image key={forceRender} src={`/api/recipes/${recipe._id}/image`} alt="Recipe" width={"100%"} rounded /> }
                                    </Col>
                                    <Col md={8}>
                                    <Row>
                                        <BootstrapForm.Group controlId="formFile">
                                            <BootstrapForm.Label>
                                                {translate("Upload new image", language)}
                                            </BootstrapForm.Label>
                                            <BootstrapForm.Control
                                                type="file"
                                                onChange={handleFileUpload}
                                            />
                                        </BootstrapForm.Group>
                                    </Row>
                                <Row style={{paddingTop:"5px"}}>
                                    <FieldArray name="images">
                                        {({ fields }) => (
                                            <>
                                                <Col/>
                                                <Col xs="auto">
                                                    <Button variant="outline-secondary" onClick={() => fields.push('')}>
                                                        <FontAwesomeIcon icon={faPlus} />
                                                    </Button>
                                                </Col>
                                                {fields.map((name, index) => (
                                                    <Row key={index} className="mb-2 align-items-center">
                                                        <Col md={9}>
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
                                                        <Col xs="auto">
                                                        <ButtonGroup>
                                                            <OverlayTrigger
                                                                placement="right"
                                                                overlay={
                                                                    <Popover>
                                                                        <Popover.Body>
                                                                            <img
                                                                                src={fields.value[index]}
                                                                                alt={`Preview ${index + 1}`}
                                                                                style={{ width: "200px" }}
                                                                            />
                                                                        </Popover.Body>
                                                                    </Popover>
                                                                }
                                                            >
                                                                <Button variant="outline-secondary">
                                                                    <FontAwesomeIcon icon={faEye} />
                                                                </Button>
                                                            </OverlayTrigger>
                                                            <Button
                                                                variant="outline-secondary"
                                                                onClick={() => handleSetDefaultImage(fields.value[index])}
                                                            >
                                                                <FontAwesomeIcon icon={faStar} />
                                                            </Button>
                                                            <Button variant="outline-secondary" onClick={() => fields.remove(index)}>
                                                                <FontAwesomeIcon icon={faMinus} />
                                                            </Button>
                                                            </ButtonGroup>
                                                        </Col>
                                                    </Row>
                                                ))}
                                            </>
                                        )}
                                    </FieldArray>
                                </Row>
                                    </Col>
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


