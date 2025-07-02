// pages/Root.tsx
import { Outlet } from "react-router";
import { Box } from "@chakra-ui/react"
import { AuthProvider } from "../utils/authprovider.tsx";

export default function Root() {
    return (
        <Box minWidth={"100vw"} minHeight={"100vh"} height={"100%"} width={"100%"} >
            <AuthProvider>
                <Outlet />
            </AuthProvider>
        </Box>
    );
}
