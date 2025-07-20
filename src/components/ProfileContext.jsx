import { createContext, useContext, useState } from "react";

// Create the context
const ProfileContext = createContext();

// Custom hook to use the context
export function useProfile() {
    return useContext(ProfileContext);
}

// Provider component
export function ProfileProvider({ children }) {
    const [profile, setProfile] = useState({

        realName: "",
        skills: [],
    });

    return (
        <ProfileContext.Provider value={{ profile, setProfile }}>
            {children}
        </ProfileContext.Provider>
    );
}
