import {
    Box
} from "@chakra-ui/react";
import { Outlet } from "react-router";
import Sidebar from "../components/app/Drawer";
import { useEffect, useState } from "react";

export default function System() {
    const [isMobileDevice, setIsMobileDevice] = useState(false);

    useEffect(() => {
        function useIsMobileDevice() {
            const [isMobileDevice, setIsMobileDevice] = useState(false);

            useEffect(() => {
                const userAgent = navigator.userAgent || navigator.vendor;

                const isMobile =
                    /android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(userAgent);

                setIsMobileDevice(isMobile);
            }, []);

            return isMobileDevice;
        }
        setIsMobileDevice(useIsMobileDevice());
    }, [isMobileDevice]);



    return (
        <>
            {!isMobileDevice && <Sidebar />}
            <Box>
                <Outlet />
            </Box>
        </>
    );
}
