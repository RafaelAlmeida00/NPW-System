"use client";

import {
    Box,
    Heading,
    Text,
    VStack,
    Spinner,
    Card,
    CardBody,
    useToast,
    Flex,
    Wrap,
    WrapItem,
    HStack
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import supabase from "../../utils/supabase";
import { decryptData } from "../../utils/cripto";
import { colors } from "../../utils/colors";
import { FaArrowRightLong } from "react-icons/fa6";
import { FaArrowTrendDown } from "react-icons/fa6";
import { FaArrowTrendUp } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { FaRegCircle } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";


export default function HoshinKanriViewer() {
    const [loading, setLoading] = useState(true);
    const [fy, setFY] = useState<string>("");
    const [records, setRecords] = useState<any[]>([]);
    const [months, setMonths] = useState<any[]>([]);

    const toast = useToast();

    const fetchData = async () => {
        setLoading(true);
        const [resMain, resMonth] = await Promise.all([
            supabase.from("hkdigital").select("*"),
            supabase.from("hkdigitalmonth").select("*")
        ]);

        if (resMain.error || resMonth.error) {
            toast({
                title: "Erro ao buscar dados",
                status: "error",
                isClosable: true
            });
            setLoading(false);
            return;
        }

        const decryptedMain = resMain.data.map((row) =>
            Object.fromEntries(
                Object.entries(row).map(([k, v]) =>
                    k === "id" ? [k, v] : [k, decryptData(String(v))]
                )
            )
        );

        const decryptedMonth = resMonth.data.map((row) => ({
            ...row,
            month: decryptData(row.month),
            target: decryptData(row.target),
            commitment: decryptData(row.commitment),
            result: decryptData(row.result),
            status: decryptData(row.status),
        }));

        setRecords(decryptedMain);
        setMonths(decryptedMonth);

        console.log("Months:", resMonth.data);
        console.log("Months:", decryptedMonth);


        const year: any = decryptedMain[0]?.fy || "";
        setFY(year);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        console.log("Records:", months);
    }, []);

    const groupByCategory = (list: any[]) => {
        const map = new Map();
        for (const item of list) {
            if (!map.has(item.categoria)) map.set(item.categoria, []);
            map.get(item.categoria).push(item);
        }
        return map;
    };

    const groupBySQTC = (items: any[]) => {
        const map = new Map();
        for (const item of items) {
            if (!map.has(item.sqtc)) map.set(item.sqtc, []);
            map.get(item.sqtc).push(item);
        }
        return map;
    };

    if (loading) return <Spinner size="xl" />;

    const categories = groupByCategory(records);

    const getTrendIcon = (tendencia: string) => {
        if (tendencia.startsWith("Positive")) {
            return <FaArrowTrendUp />;
        }
        if (tendencia.startsWith("Negative")) {
            return <FaArrowTrendDown />;
        }
        return <FaArrowRightLong />;
    };

    const getTrendIconAch = (tendencia: string) => {
        if (tendencia.startsWith("Achievement")) {
            return <FaCheckCircle />;
        }
        if (tendencia.startsWith("Between")) {
            return <FaRegCircle />;
        }
        return <IoMdClose />;
    };

    return (
        <Box p={8} bg={colors.white} minH="100vh" marginLeft="20vw">
            <Heading color={colors.pm}>Hoshin Kanri Digital</Heading>

            <Card mt={4} mb={8} bg={colors.sc} color="white">
                <CardBody>
                    <Text fontSize="xl">Fiscal Year: {fy}</Text>
                </CardBody>
            </Card>

            {[...categories.entries()].map(([cat, items]) => {
                const sqtcMap = groupBySQTC(items);

                return (
                    <Box key={cat} mb={10}>
                        <Flex>
                            <Card minW="200px" h="auto" bg={colors.pm} color="white" mr={4}>
                                <CardBody justifyContent={"center"} alignItems="center" display="flex" flexDirection="column">
                                    <Text transform="rotate(-90deg)" fontWeight="bold" textAlign={"center"}>{cat}</Text>
                                </CardBody>
                            </Card>

                            <Wrap spacing={6} align="start">
                                {[...sqtcMap.entries()].map(([sqtc, itensSQTC]) => (
                                    <WrapItem key={sqtc}>
                                        <VStack align="start" spacing={4} bg={colors.pm} p={4} borderRadius="md" boxShadow="md">
                                            <Card bg={colors.sc} color="white" w="100%">
                                                <CardBody>
                                                    <Text fontWeight="bold">{sqtc}</Text>
                                                </CardBody>
                                            </Card>

                                            {itensSQTC.map((item: any) => (
                                                <Box key={item.id} w="100%">
                                                    <Card mb={2} w="100%">
                                                        <CardBody>
                                                            <VStack align="start" spacing={1}>
                                                                <Text><strong>Item:</strong> {item.item}</Text>
                                                                <Text><strong>Descrição:</strong> {item.descricao}</Text>
                                                                <Text><strong>Target:</strong> {item.target}</Text>
                                                                <Text><strong>Commit:</strong> {item.commit}</Text>
                                                                <Text><strong>Responsável:</strong> {item.responsavel}</Text>
                                                                <Text><strong>Report:</strong> {item.responsavel_report}</Text>
                                                                <Text><strong>Up/Down:</strong> {item.aumentar_diminuir}</Text>
                                                            </VStack>
                                                        </CardBody>
                                                    </Card>

                                                    <Wrap spacing={2} mb={2}>
                                                        {months.filter((m) => m.objective == item.id).map((m) => (
                                                            <WrapItem key={`${m.id}`}>
                                                                <Card minW="140px" borderWidth="1px" borderColor={colors.pm}>
                                                                    <CardBody>
                                                                        <VStack spacing={1}>
                                                                            <Text fontWeight="bold">{m.month}</Text>
                                                                            <Text fontSize="sm">Target: {m.target}</Text>
                                                                            <Text fontSize="sm">Commit: {m.commitment}</Text>
                                                                            <Text fontSize="sm">Result: {m.result}</Text>
                                                                            <HStack align="center" spacing={2}>
                                                                                <Text fontSize="sm">Status: </Text>
                                                                                {getTrendIconAch(m.status)}
                                                                            </HStack>
                                                                        </VStack>
                                                                    </CardBody>
                                                                </Card>
                                                            </WrapItem>
                                                        ))}
                                                    </Wrap>

                                                    <Card w="100%">
                                                        <CardBody>
                                                            <VStack align="start" spacing={1}>
                                                                <HStack align="center" spacing={2}>
                                                                    <Text><strong>Tendência:</strong></Text>
                                                                    {getTrendIcon(item.tendencia)}
                                                                </HStack>

                                                                <HStack align="center" spacing={2}>
                                                                    <Text><strong>Status:</strong></Text>
                                                                    {getTrendIconAch(item.status)}
                                                                </HStack>
                                                                <Text><strong>Lógica:</strong> {item.logic}</Text>
                                                                <Text><strong>Comentários:</strong> {item.comentarios}</Text>
                                                            </VStack>
                                                        </CardBody>
                                                    </Card>
                                                </Box>
                                            ))}
                                        </VStack>
                                    </WrapItem>
                                ))}
                            </Wrap>
                        </Flex>
                    </Box>
                );
            })}
        </Box>
    );
}