import { faEdit, faRemove, faCancel } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useState } from "react";
import { ButtonGroup, Button, Modal } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { RecipeData } from "../Types.js";

export const RecipeRow = ({ recipe, index, onDeleted }: { recipe: RecipeData; index: number, onDeleted: () => void }) => {
    const [show, setShow] = useState(false);
    const handleDelete = () => {
        setShow(true); // Open the modal
    };
    const navigate = useNavigate();
    const handleClose = () => setShow(false); // Close the modal

    const confirmDelete = async () => {
        await axios.delete(`/api/recipes/${recipe.id}`); // API call through proxy
        onDeleted();
        setShow(false); // Close modal after deletion
    };

    return (
        <tr onDoubleClick={() => navigate(`/recipe/${recipe.id}`)}>
            <td>{index + 1}</td>
            <td>{recipe.name}</td>
            <td>{recipe.description}</td>
            <td>
                <ButtonGroup>
                    <Link to={`/recipe/${recipe.id}`}>
                        <Button variant="primary"><FontAwesomeIcon icon={faEdit} /></Button>
                    </Link>
                    <Button variant="danger" onClick={handleDelete}>
                        <FontAwesomeIcon icon={faRemove}/>
                    </Button>

                    <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Deletion</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Are you sure you want to delete this recipe?</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                <FontAwesomeIcon icon={faCancel} />
                            </Button>
                            <Button variant="danger" onClick={confirmDelete}>
                                <FontAwesomeIcon icon={faRemove} />
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </ButtonGroup>
            </td>
        </tr>
    );
};
