import { Box } from "@chakra-ui/react";
import Sidebar from "../components/app/Drawer";
import { Outlet } from "react-router";

export default function System() {
    return (
        <>
            <Sidebar />
            <Box>
                <Outlet />
            </Box>
        </>
    );
}
