import React from 'react';
import { Form, Field } from 'react-final-form';
import { Select, MenuItem, Button, Grid2, InputLabel, FormControl, Checkbox, ListItemText, OutlinedInput } from '@mui/material';
import { RoleData, UserProfile, GroupData } from "../Types.js";
import { translate } from "../utils.js";
import { useApplicationContext } from "../Components/ApplicationContext/useApplicationContext.js";
import { Logout, Save } from "@mui/icons-material";

interface UserProfileFormProps {
    userProfile: UserProfile | undefined;
    roles: RoleData[];
    groups: GroupData[];
    onSubmit: (values: UserProfile) => Promise<void>;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ userProfile, roles, groups, onSubmit }) => {
    const { language, isAdmin, signOut, user } = useApplicationContext();
    const getRoleDisplayNames = (selected: string[]): string => {
        return selected.map((id) => {
            const role = roles.find((role) => role._id === id);
            return role ? role.name : id;
        }).join(', ');
    }

    const getGroupDisplayNames = (selected: string[]): string => {
        return selected.map((id) => {
            const group = groups.find((group) => group._id === id);
            return group ? group.name : id;
        }).join(', ');
    }

    return (
        <Form
            onSubmit={onSubmit}
            initialValues={userProfile}
            render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 12 }}>
                            <Field name="settings.language">
                                {({ input }) => (
                                    <FormControl fullWidth>
                                        <InputLabel>{translate("language", language)}</InputLabel>
                                        <Select
                                            {...input}
                                            value={input.value || []}
                                            onChange={(event) => input.onChange(event.target.value)}
                                        >
                                            <MenuItem key="notSet" value="">Kies</MenuItem>
                                            <MenuItem key="nl" value="nl">Nederlands</MenuItem>
                                            <MenuItem key="en" value="en">English</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            </Field>
                        </Grid2>
                        <Grid2 size={{ xs: 12 }}>
                            <Field name="settings.theme">
                                {({ input }) => (
                                    <FormControl fullWidth>
                                        <InputLabel>{translate("theme", language)}</InputLabel>
                                        <Select
                                            {...input}
                                            value={input.value || []}
                                            onChange={(event) => input.onChange(event.target.value)}
                                        >
                                            <MenuItem key="notSet" value="">Kies</MenuItem>
                                            <MenuItem key="followOS" value="followOS">{translate("followOS", language)}</MenuItem>
                                            <MenuItem key="dark" value="dark">{translate("dark", language)}</MenuItem>
                                            <MenuItem key="light" value="light">{translate("light", language)}</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            </Field>
                        </Grid2>
                        {isAdmin &&
                            <><Grid2 size={{ xs: 12 }}>
                                <Field name="roles">
                                    {({ input }) => (
                                        <FormControl fullWidth>
                                            <InputLabel>Roles</InputLabel>
                                            <Select<string[]>
                                                {...input}
                                                multiple
                                                value={input.value || []}
                                                input={<OutlinedInput label="Roles" />}
                                                renderValue={(selected) => getRoleDisplayNames(selected)}
                                            >
                                                {roles.map((role) => (
                                                    <MenuItem key={role.name} value={role._id} selected={input.value.includes(role.name)} >
                                                        <Checkbox checked={input.value.includes(role._id)} />
                                                        <ListItemText primary={role.name} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                </Field>
                            </Grid2>
                                <Grid2 size={{ xs: 12 }}>
                                    <Field name="groups">
                                        {({ input }) => (
                                            <FormControl fullWidth>
                                                <InputLabel>Groups</InputLabel>
                                                <Select<string[]>
                                                    {...input}
                                                    multiple
                                                    value={input.value || []}
                                                    input={<OutlinedInput label="Groups" />}
                                                    renderValue={(selected) => getGroupDisplayNames(selected)}
                                                >
                                                    {groups.map((group) => (
                                                        <MenuItem key={group.name} value={group._id} selected={input.value.includes(group._id)} >
                                                            <Checkbox checked={input.value.includes(group._id)} />
                                                            <ListItemText primary={group.name} />
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                    </Field>
                                </Grid2> </>}
                        <Grid2 size={{ xs: 12 }}>
                            <Button type="submit" startIcon={<Save />}>
                                {translate("save", language)}
                            </Button>
                            {user?.uid === userProfile?.firebaseUID &&
                                <Button type="button" onClick={signOut} startIcon={<Logout />}>

                                    {translate("logoff", language)}
                                </Button>}
                        </Grid2>
                    </Grid2>
                </form>
            )}
        />
    );
};

export default UserProfileForm;
