// BusyIndicator.tsx
import React from 'react';
import { Spinner, Modal } from 'react-bootstrap';
import { useBusy } from './BusyContext.js';

export const BusyIndicator: React.FC = () => {
    const { isBusy } = useBusy();

    return (
        <Modal show={isBusy} centered backdrop="static" keyboard={false}>
            <Modal.Body className="text-center">
                <Spinner animation="border" role="status" />
            </Modal.Body>
        </Modal>
    );
};
