import {
    Box,
    VStack,
    HStack,
    Text,
    Icon,
    Flex,
    Spacer,
    Avatar,
} from "@chakra-ui/react";
import {
    FiChevronDown,
    FiChevronUp
} from "react-icons/fi";
import { useState } from "react";
import { useNavigate } from "react-router";
import { colors } from "../../utils/colors";
import { MdAdminPanelSettings, MdOutlineDashboard } from "react-icons/md";
import { IoIosSchool } from "react-icons/io";
import { SiGoogleclassroom, SiLinksys } from "react-icons/si";
import { useAuth } from "../../utils/authprovider";
import { decryptData } from "../../utils/cripto";
import { FaDatabase, FaFilePdf, FaList } from "react-icons/fa";
import { AiOutlineAudit } from "react-icons/ai";
import { RxDashboard } from "react-icons/rx";

// Menu dinâmico
const menuItems = [
    {
        icon: MdOutlineDashboard,
        text: "Dashboard",
        route: "system/",
    },
    {
        icon: MdAdminPanelSettings,
        text: "Admin",
        subItems: [
            { icon: IoIosSchool, text: "Treinamentos", route: "system/admin/treinamentos" },
            { icon: SiGoogleclassroom, text: "Turmas", route: "system/admin/turmas" },
        ],
    },
    {
        icon: AiOutlineAudit,
        text: "PHC",
        subItems: [
            { icon: FaDatabase, text: "Base de Dados", route: "system/phc/database" },
            { icon: FaList, text: "Ichigen List", route: "system/phc/ichigenlist" },
        ],
    },
    {
        icon: SiLinksys,
        text: "Acessos Rápidos",
        route: "system/acessos",
    },
    {
        icon: IoIosSchool,
        text: "Treinamentos",
        subItems: [{
            icon: FaFilePdf,
            text: "Materiais de Treinamento",
            route: "system/treinamentos",
        },
        {
            icon: SiGoogleclassroom,
            text: "Turmas",
            route: "system/turmas",
        }]
    },
    {
        icon: RxDashboard,
        text: "Dashboard PHC",
        route: "system/phc/dashboard",
    },
    {
        icon: RxDashboard,
        text: "Dashboard SSD",
        route: "system/ssd/dashboard",
    },
];



const Sidebar = () => {
    const { user }: any = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <Flex
            direction="column"
            w="20vw"
            minHeight={"100vh"}
            bg={colors.pm}
            color="white"
            position="fixed"
            justify="space-between"
        >
            {/* Topo */}
            <Box>
                <Box p="4" fontWeight="bold" fontSize="xl" onClick={() => navigate('/system')}>
                    NPW <Text as="span" fontSize="sm" fontWeight="light">System</Text>
                </Box>

                {/* Menu */}
                <VStack align="stretch" fontWeight="600" fontSize={22} px="4" mt="2" color={colors.white}>
                    {menuItems
                        .filter((item) => {
                            if (item.text === 'Admin' || item.text === 'PHC') {
                                return user.admin_level === 2 || user.admin_level === 3;
                            }
                            return true;
                        })
                        .map((item, index) => (
                            <NavItem key={index} {...item} />
                        ))}

                </VStack>
            </Box>

            {/* Rodapé fixo */}
            <Box>

                <Box width={"100%"} height={2} borderColor={colors.white} />

                <Flex align="center" p="4">
                    <Avatar src="#" />
                    <Box ml="3">
                        <Text fontSize="sm">{decryptData(user.name)}</Text>
                        <Text fontSize="xs" color={colors.white}>{user.email}</Text>
                    </Box>
                    <Spacer />
                    <Icon as={FiChevronDown} />
                </Flex>
            </Box>
        </Flex>
    );
};

const NavItem = ({ icon, text, route, subItems = [] }: any) => {
    const navigate = useNavigate();
    const hasSubItems = subItems.length > 0;
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        if (hasSubItems) {
            setOpen(!open);
        } else if (route) {
            if (text === "SSD") {
                // Se o link for externo ou precisar abrir fora da SPA
                window.open(route.startsWith("http") ? route : `https://${route}`, "_blank");
            } else {
                // Navegação interna
                navigate(`/${route}`);
            }
        }
    };

    const handleSubClick = (route: string) => {
        if (text === "SSD") {
            // Se o link for externo ou precisar abrir fora da SPA
            window.open(route.startsWith("http") ? route : `https://${route}`, "_blank");
        } else {
            // Navegação interna
            navigate(`/${route}`);
        }
    };


    return (
        <Box>
            <HStack
                py="2"
                px="2"
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: colors.a }}
                onClick={handleClick}
                justify="space-between"
            >
                <HStack>
                    <Icon as={icon} />
                    <Text fontSize="sm">{text}</Text>
                </HStack>
                {hasSubItems && (
                    <Icon as={open ? FiChevronUp : FiChevronDown} boxSize={4} />
                )}
            </HStack>

            {hasSubItems && open && (
                <VStack align="start" ml="6" mt="1">
                    {subItems.map((sub: any, i: number) => (
                        <HStack
                            key={i}
                            cursor="pointer"
                            onClick={() => handleSubClick(sub.route)}
                            _hover={{ textDecoration: "underline" }}
                        >
                            {sub.icon && <Icon as={sub.icon} boxSize={3} />}
                            <Text fontSize="xs" color={colors.white}>
                                {sub.text}
                            </Text>
                        </HStack>
                    ))}
                </VStack>
            )}
        </Box>
    );
};

export default Sidebar;
