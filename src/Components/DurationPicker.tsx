import moment, { Duration } from "moment";
import { useState, useEffect } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { Field } from "react-final-form";

interface DurationPickerProps {
    label?: string;
    onChange: (isoDuration: string) => void;
    value: Duration;
    name: string;  // or path
}

const DurationPicker: React.FC<DurationPickerProps> = ({ label, onChange, value: input }) => {
    const value = moment.duration(input);
    const [hours, setHours] = useState(value.hours());
    const [minutes, setMinutes] = useState(value.minutes());

    const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => setHours(parseInt(e.target.value));
    const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => setMinutes(parseInt(e.target.value));

    useEffect(() => {
        const duration = moment.duration({ hours, minutes });
        const isoDuration = duration.toISOString(); // Convert duration to ISO 8601 format
        onChange(isoDuration);
    }, [hours, minutes, onChange]);

    return (
        <Row>
            {label && <Col><label>{label}</label></Col>}
            <Col>
                <Form.Control
                    type="number"
                    min="0"
                    max="23"
                    placeholder="HH"
                    value={hours}
                    onChange={handleHoursChange}
                />
            </Col>
            <Col>
                <Form.Control
                    type="number"
                    min="0"
                    max="59"
                    placeholder="MM"
                    value={minutes}
                    onChange={handleMinutesChange}
                />
            </Col>
        </Row>
    );
};

interface DurationFieldProps {
    label?: string;
    name: string;
}

export const DurationPickerField: React.FC<DurationFieldProps> = ({ label, name }) => (
    <Field
        name={name}
        render={({ input }) => (
            <DurationPicker
                label={label}
                value={input.value}
                onChange={input.onChange}
                name={name} />
        )}
    />
);
