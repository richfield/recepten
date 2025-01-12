import moment, { Duration } from "moment";
import { useState, useEffect } from "react";
import { Grid2, Card, CardContent } from "@mui/material";
import { Field } from "react-final-form";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

interface DurationPickerProps {
    label?: string;
    onChange: (isoDuration: string) => void;
    value: Duration;
    name: string; // or path
}

const DurationPicker: React.FC<DurationPickerProps> = ({ label, onChange, value: input }) => {
    const value = moment.duration(input);
    const [hours, setHours] = useState(value.hours());
    const [minutes, setMinutes] = useState(value.minutes());
    useEffect(() => {
        const duration = moment.duration({ hours, minutes });
        const isoDuration = duration.toISOString();
        onChange(isoDuration);
    }, [hours, minutes, onChange]);

    return (
        <Grid2 size={{ md: 4, xs: 12 }}>
            <Card>
                <CardContent>
                    <TimePicker
                        label={label}
                        ampm={false}
                        value={moment({ hours, minutes })}
                        onChange={(newValue) => {
                            setHours(newValue?.hours() || 0);
                            setMinutes(newValue?.minutes() || 0);
                        }}
                        views={['hours', 'minutes']}
                    />
                </CardContent>
            </Card>
        </Grid2>
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

export default DurationPicker;
