// AcessosRapidos.tsx
"use client";
import { Box, Grid, Heading, Icon, Text, VStack } from "@chakra-ui/react";
import { FaShareAlt, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import { IoMdPeople } from "react-icons/io";
import { MdCastForEducation, MdOutlineTravelExplore, MdScore } from "react-icons/md";
import { colors } from "../../utils/colors";

const accessLinks = [
    {
        icon: FaShareAlt,
        name: "Sharepoint NPW GK",
        description: "Acesso rápido ao site da GK",
        route: "https://nissangroupnam.sharepoint.com/sites/NA_NNA_004390",
    },
    {
        icon: FaShareAlt,
        name: "Sharepoint NPW IE",
        description: "Portal da Engenharia Industrial",
        route: "https://nissangroupnam.sharepoint.com/teams/NA_NNA_002713",
    },
    {
        icon: FaShareAlt,
        name: "Sharepoint NPW Innovation",
        description: "Ideias e Inovação NPW",
        route: "https://nissangroupnam.sharepoint.com/sites/NA_NNA_004132",
    },
    {
        icon: FaShareAlt,
        name: "Sharepoint RTC NBA",
        description: "RTC NBA Processos",
        route: "https://nissangroupnam.sharepoint.com/sites/NA_NNA_000786",
    },
    {
        icon: FaFileAlt,
        name: "Sharepoint NPW GK KPIs",
        description: "Indicadores da GK",
        route: "https://nissangroupnam.sharepoint.com/sites/NA_NNA_000747",
    },
    {
        icon: FaCalendarAlt,
        name: "NPW GK Calendário",
        description: "Eventos e feriados",
        route: "https://calendar-npw.vercel.app/",
    },
    {
        icon: FaCalendarAlt,
        name: "NPW GK Master Schedule",
        description: "Planejamento Geral",
        route: "https://nissangroupnam.sharepoint.com/:x:/s/NA_NNA_004389/EXUo0iTCiadChJR0A9buVn0BiM6fGWdv6XL898WUQMludg?e=qe9mkt",
    },
    {
        icon: MdCastForEducation,
        name: "Onboarding NPW GK",
        description: "Onboarding e Informações",
        route: "https://nissangroupnam.sharepoint.com/:p:/r/sites/NA_NNA_004389/Shared%20Documents/Onboarding/Interno/Onboarding.pptx?d=w3b50a229e5df4eb68e298d7c2046ef2e&csf=1&web=1&e=2YY27f",
    },
    {
        icon: IoMdPeople,
        name: "Organograma NPW",
        description: "Visão da Equipe NPW",
        route: "https://www.canva.com/design/DAGi627qgmc/BpiwxF4N-vBWH1v9ah8BMA/edit?utm_content=DAGi627qgmc&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
    },
    {
        icon: MdScore,
        name: "SSD",
        description: "Faça sua avaliação de SSD",
        route: "https://nissangroup.sharepoint.com/:x:/t/JAO_NML_07_040813_NPW_world_sample/Ec73KRb04vpEpxTtz1_6kIABNBmrW4y2T5byw5mPMw2YKg?e=hzyA17",
    },
    {
        icon: MdOutlineTravelExplore,
        name: "Visitas Executivas",
        description: "Veja as Visitas Executivas",
        route: "https://apps.powerapps.com/play/e/cdfec081-168b-eb10-bb1e-04a6cc98daee/a/9c79b0f8-b30d-44ff-bb1a-d61411e58215?tenantId=4617a0ae-1a92-4482-a833-7bad535b3292&hint=c006862e-f3fc-4b47-8096-55cbe34d46a8&sourcetime=1751541490063",
    }
];

export default function AcessosRapidos() {

    return (
        <Box p={8} bg="white" minH="100vh" marginLeft="20vw">
            <Heading size="lg" color={colors.pm} mb={6}>
                Acessos Rápidos
            </Heading>

            <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={6}>
                {accessLinks.map((item, index) => (
                    <Box
                        key={index}
                        borderRadius="15px"
                        boxShadow="md"
                        p={5}
                        bg="gray.50"
                        cursor="pointer"
                        _hover={{ bg: "gray.100", transform: "scale(1.02)" }}
                        transition="all 0.2s"
                        onClick={() => window.open(item.route, "_blank")}
                    >
                        <VStack spacing={3}>
                            <Icon as={item.icon} boxSize={8} color={colors.pm} />
                            <Text fontWeight="bold" fontSize="md" textAlign="center">
                                {item.name}
                            </Text>
                            <Text fontSize="sm" color="gray.600" textAlign="center">
                                {item.description}
                            </Text>
                        </VStack>
                    </Box>
                ))}
            </Grid>
        </Box>
    );
}
