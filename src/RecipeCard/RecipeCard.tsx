import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Button, Form, InputGroup, Row, Col, ButtonGroup, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { AxiosResponse } from 'axios';
import { RecipeData, Language } from "../Types.js";

import { isArrayField, translate } from "../utils.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd, faCancel, faEdit, faRemove, faSave } from "@fortawesome/free-solid-svg-icons";
import moment from 'moment/min/moment-with-locales';
import { v4 as uuidv4 } from 'uuid';

type RecipeCardProps = {
    recipe: RecipeData | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    save: (data: RecipeData) => Promise<AxiosResponse<any, any>>;
    language: Language
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, save, language }) => {

    const [editableSection, setEditableSection] = useState<string | null>(null);
    const [editableRecipe, setEditableRecipe] = useState<RecipeData | undefined>(recipe);

    useEffect(() => {
        if (recipe !== undefined) {
            recipe._id = recipe._id || uuidv4()
        }
        console.log({ recipe })
        setEditableRecipe(recipe)
    }, [recipe])

    const [show, setShowModel] = useState(false);
    const [imageIndex, setImageIndex] = useState<number>(0);
    const handleCloseModel = () => setShowModel(false);
    const handleShowModal = (index: number) => {
        setImageIndex(index);
        setShowModel(true);
    };

    if (!editableRecipe) {
        return <></>
    }

    const handleImageChange = (imageIndex: number, value: string): void => {
        const newImageValue = editableRecipe.image ?? [];
        newImageValue[imageIndex] = value;
        handleInputChange("image", newImageValue)
    }

    const handleSectionToggle = (section: string) => {
        setEditableSection(editableSection === section ? null : section);
    };

    const handleInputChange = (field: keyof RecipeData, value: string) => {
        setEditableRecipe({ ...editableRecipe, [field]: value });
    };

    const handleSave = async (section: string) => {
        try {
            const response = await save(editableRecipe);
            console.log(`Saved ${section} successfully:`, response.data);
            setEditableSection(null);
        } catch (error) {
            console.error(`Error saving ${section}:`, error);
        }
    };

    const handleListChange = <T extends Iterable<unknown>>(
        field: keyof RecipeData,
        index: number,
        value: T
    ) => {
        if (isArrayField(editableRecipe[field])) {
            const updatedList = [...(editableRecipe[field] as unknown[])];
            updatedList[index] = value;
            setEditableRecipe({ ...editableRecipe, [field]: updatedList });
        }
    };

    const handleAddListItem = <T,>(
        field: keyof RecipeData,
        defaultValue: T
    ) => {
        const fieldValue = editableRecipe[field];

        if (Array.isArray(fieldValue)) {
            // Safe to spread because the type is narrowed to an array
            const updatedList = [...fieldValue, defaultValue];
            setEditableRecipe({ ...editableRecipe, [field]: updatedList });
        } else {
            // Initialize as an array if the field is not already an array
            setEditableRecipe({ ...editableRecipe, [field]: [defaultValue] });
        }
    };


    const handleRemoveListItem = (field: keyof RecipeData, index: number) => {
        const fieldValue = editableRecipe[field];

        if (Array.isArray(fieldValue)) {
            // Ensure type is narrowed to an array
            const updatedList = [...fieldValue];
            updatedList.splice(index, 1);
            setEditableRecipe({ ...editableRecipe, [field]: updatedList });
        }
    };


    const renderInstructions = () => (
        <Row style={{ marginBottom: "5px" }}>
            <Col sm={10}>
                <ListGroup.Item>
                    <div onDoubleClick={() => handleSectionToggle("recipeInstructions")} style={{ cursor: 'pointer' }}>
                        <strong>{translate("instructions", language)}:</strong>
                        {editableSection === "recipeInstructions" ? (
                            <>
                                {(editableRecipe.recipeInstructions as { name: string; text: string }[]).map((instruction, index) => (
                                    <div key={index} className="mb-2">
                                        {instruction.name !== instruction.text && (
                                            <InputGroup className="mb-1">
                                                <Form.Control
                                                    type="text"
                                                    placeholder={translate("instructionName", language)}
                                                    value={instruction.name || ""}
                                                    onChange={(e) =>
                                                        setEditableRecipe({
                                                            ...editableRecipe,
                                                            recipeInstructions: (editableRecipe.recipeInstructions || []).map((ins, idx) =>
                                                                idx === index ? { ...instruction, name: e.target.value, "@type": "HowToStep" } : ins
                                                            ),
                                                        })
                                                    }
                                                />
                                            </InputGroup>
                                        )}
                                        <InputGroup className="mb-1">
                                            <Form.Control
                                                type="text"
                                                placeholder={translate("instructionText", language)}
                                                value={instruction.text || ""}
                                                onChange={(e) =>
                                                    setEditableRecipe({
                                                        ...editableRecipe,
                                                        recipeInstructions: (editableRecipe.recipeInstructions || []).map((ins, idx) =>
                                                            idx === index ? { ...instruction, text: e.target.value, "@type": "HowToStep" } : ins
                                                        ),
                                                    })
                                                }
                                            />
                                            <Button
                                                variant="danger"
                                                onClick={() =>
                                                    setEditableRecipe({
                                                        ...editableRecipe,
                                                        recipeInstructions: (editableRecipe.recipeInstructions || []).filter((_, idx) => idx !== index),
                                                    })
                                                }
                                            >
                                                <FontAwesomeIcon icon={faRemove} />
                                            </Button>
                                        </InputGroup>

                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                {(editableRecipe.recipeInstructions as { name: string; text: string }[]).map((instruction, index) => (
                                    <div key={index}>

                                        {instruction.name !== instruction.text ? (
                                            <div>
                                                <strong>{instruction.name || index + 1}:</strong> {instruction.text}
                                            </div>
                                        ) : <div><strong>{index + 1}:</strong>{instruction.text}</div>}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                </ListGroup.Item>
            </Col>
            <Col xs={1}>
                {editableSection === "recipeInstructions" ? (
                    <ButtonGroup vertical size="sm">
                        <Button variant="success" onClick={() => handleSave("recipeInstructions")} className="me-2">
                            <FontAwesomeIcon icon={faSave} />
                        </Button>
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={() =>
                                setEditableRecipe({
                                    ...editableRecipe,
                                    recipeInstructions: [
                                        ...(editableRecipe.recipeInstructions || []),
                                        { name: "", text: "", "@type": "HowToStep" },
                                    ],
                                })
                            }
                        >
                            <FontAwesomeIcon icon={faAdd} />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleSectionToggle("recipeInstructions")} className="me-2">
                            <FontAwesomeIcon icon={faCancel} />
                        </Button>
                    </ButtonGroup>
                ) : (
                    <Button size="sm" variant="secondary" onClick={() => handleSectionToggle("recipeInstructions")} className="me-2">
                        <FontAwesomeIcon icon={faEdit} />
                    </Button>

                )}
            </Col>
        </Row>
    );

    const renderSection = <T,>(
        field: keyof RecipeData,
        label: string,
        defaultValue?: T
    ) => (
        <Row style={{ marginBottom: "5px" }}>
            <Col sm={10}>
                <ListGroup.Item>
                    <div onDoubleClick={() => handleSectionToggle(field)} style={{ cursor: 'pointer' }}>
                        {editableSection === field ? (
                            Array.isArray(editableRecipe[field]) ? (
                                <>
                                    {(editableRecipe[field] as []).map((item, index) => (
                                        <InputGroup className="mb-2" key={index}>
                                            <Form.Control
                                                type="text"
                                                value={(typeof item === "string" ? item : JSON.stringify(item)) || ""}
                                                onChange={(e) =>
                                                    handleListChange(
                                                        field,
                                                        index,
                                                        typeof item === "string" ? (e.target.value) : JSON.parse(e.target.value)
                                                    )
                                                }
                                                placeholder={label}
                                            />
                                            <Button variant="danger" onClick={() => handleRemoveListItem(field, index)}>
                                                <FontAwesomeIcon icon={faRemove} />
                                            </Button>
                                        </InputGroup>
                                    ))}
                                </>
                            ) : (
                                <Form.Control
                                    type="text"
                                    value={editableRecipe[field] ? String(editableRecipe[field]) : ""}
                                    onChange={(e) => handleInputChange(field, e.target.value)}
                                    placeholder={label}
                                />
                            )
                        ) : (
                            <>
                                {Array.isArray(editableRecipe[field])
                                    ? (editableRecipe[field] as []).map((item, idx) => (
                                        <div key={idx}>
                                            {typeof item === "string" ? item : JSON.stringify(item)}
                                        </div>
                                    ))
                                    : <>{editableRecipe[field] as string}</>}
                            </>
                        )}
                    </div>

                </ListGroup.Item>
            </Col>
            <Col xs={1}>
                {editableSection === field ? (
                    <ButtonGroup vertical size="sm">
                        <Button variant="success" onClick={() => handleSave(field as string)} className="me-2"><FontAwesomeIcon icon={faSave} /></Button>
                        {Array.isArray(editableRecipe[field]) &&
                            <Button variant="primary" onClick={() => handleAddListItem(field, defaultValue!)}>
                                <FontAwesomeIcon icon={faAdd} />
                            </Button>
                        }
                        <Button variant="danger" onClick={() => handleSectionToggle(field)} className="me-2"><FontAwesomeIcon icon={faCancel} /></Button>
                    </ButtonGroup>
                ) : (
                    <Button size="sm" variant="secondary" onClick={() => handleSectionToggle(field)} className="me-2"><FontAwesomeIcon icon={faEdit} /></Button>
                )}</Col>
        </Row>
    );

    type TimePickerProps = {
        duration: moment.Duration;
        onSave: (value: string) => void;
    }
    const TimePicker = ({ duration, onSave }: TimePickerProps) => {

        const [time, setTime] = React.useState(duration.toISOString());
        console.log({ duration, time })
        const handleTimeChange = (hours: number, minutes: number) => {
            const realHours = isNaN(hours) ? 0 : hours;
            const realMinutes = isNaN(minutes) ? 0 : minutes;
            const updatedTime = moment.duration(realHours, 'hours').add(realMinutes, 'minutes').toISOString();
            setTime(updatedTime);
            onSave(updatedTime)
        };

        return (
            <Row>
                <Col>
                    <Form.Group controlId="hours">
                        <Form.Label>Hours:</Form.Label>
                        <Form.Control
                            type="number"
                            value={moment.duration(time).hours()}
                            onChange={(e) => handleTimeChange(parseInt(e.target.value, 0), moment.duration(time).minutes())}
                            min="0"
                            max="23"
                        />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group controlId="minutes">
                        <Form.Label>Minutes:</Form.Label>
                        <Form.Control
                            type="number"
                            value={moment.duration(time).minutes()}
                            onChange={(e) => handleTimeChange(moment.duration(time).hours(), parseInt(e.target.value, 0))}
                            min="0"
                            max="59"
                        />
                    </Form.Group>
                </Col>
            </Row>
        );
    }

    const renderTimeSection = (field: keyof RecipeData, label: string, language: Language) => {
        const initialTime = editableRecipe[field] as string;
        const duration = initialTime?.includes(" ") ? moment.duration(initialTime.split(" ")[0], initialTime.split(" ")[1] as moment.DurationInputArg2) : moment.duration(initialTime)
        const hours = String(duration.hours()).padStart(2, '0');
        const minutes = String(duration.minutes()).padStart(2, '0');
        return (
            <Row style={{ marginTop: "5px" }}>
                <Col sm={10}>
                    <ListGroup.Item>
                        <Row>
                            <Col>{label}:</Col>
                            <Col>
                                {editableSection === field ? (
                                    <TimePicker
                                        duration={duration}
                                        onSave={(newTime: string) => handleInputChange(field, newTime)} />
                                ) : (
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip id={`tooltip-${field}`}>
                                                {hours}:{minutes}
                                            </Tooltip>
                                        }>
                                        <span>{(duration.hours() > 0 || duration.minutes() > 0) && duration.locale(language).humanize()}</span>
                                    </OverlayTrigger>
                                )}
                            </Col>
                        </Row>
                    </ListGroup.Item>
                </Col>
                <Col xs={1}>
                    {editableSection === field ? (
                        <ButtonGroup vertical size="sm">
                            <Button variant="success" onClick={() => handleSave(field as string)} className="me-2">
                                <FontAwesomeIcon icon={faSave} />
                            </Button>
                            <Button variant="danger" onClick={() => handleSectionToggle(field)} className="me-2">
                                <FontAwesomeIcon icon={faCancel} />
                            </Button>
                        </ButtonGroup>
                    ) : (
                        <Button size="sm" variant="secondary" onClick={() => handleSectionToggle(field)} className="me-2">
                            <FontAwesomeIcon icon={faEdit} />
                        </Button>
                    )}
                </Col>
            </Row>
        );
    };

    return (
        editableRecipe && (
            <Card style={{ width: '100%' }}>
                <Card.Header>
                    <h1>{renderSection<string>('name', translate("name", language))}</h1>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={3} style={{ textAlign: "center", position: "relative" }}>
                        <>
                            {editableRecipe.image ? (
                                editableRecipe.image.map((image, index) => {
                                <>
                                    <Card.Img
                                        style={{ width: "100%" }}
                                        variant="top"
                                        src={image}
                                        alt={editableRecipe.name}
                                        onDoubleClick={() => handleShowModal(index)}
                                    />
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 10,
                                            right: 10,
                                            zIndex: 2,
                                            cursor: "pointer",
                                            display: "visible" // hidden by default
                                        }}
                                        onClick={() => handleShowModal(index)}
                                    >
                                        <Button variant="light" onClick={() => handleShowModal(index)}><FontAwesomeIcon icon={faEdit} /></Button>
                                    </div>
                                </>

                                })
                            ) : (
                                    <Button variant="light" onClick={() => handleShowModal(0)}>
                                    <FontAwesomeIcon icon={faEdit} />
                                </Button>
                            )}
                            </>
                            <Modal show={show} onHide={handleCloseModel}>
                                <Modal.Header closeButton>
                                    <Modal.Title>{translate("editimageurl", language)}</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form.Control
                                        type="text"
                                        value={editableRecipe.image ? String(editableRecipe.image[imageIndex]) : ""}
                                        onChange={(e) => handleImageChange(imageIndex, e.target.value)}
                                        placeholder={translate("editimageurl", language)}
                                    />
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={handleCloseModel}>
                                        Close
                                    </Button>
                                    <Button variant="primary" onClick={handleCloseModel}>
                                        Save Changes
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                            <ListGroup variant="flush">
                                {renderTimeSection('cookTime', translate("cookTime", language), language)}
                                {renderTimeSection('prepTime', translate("prepTime", language), language)}
                                {renderTimeSection('totalTime', translate("totalTime", language), language)}
                            </ListGroup>
                        </Col>

                        <Col md={9}>
                            <ListGroup variant="flush">
                                {renderSection<string>('description', translate("description", language))}
                                {renderSection<string>('recipeIngredient', translate("ingredients", language), "")}
                                {renderInstructions()}
                                {renderSection<string>('keywords', translate("keywords", language), "")}
                            </ListGroup>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        )
    );
}

export default RecipeCard;

