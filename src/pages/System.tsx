"use client";

import {
    Box,
    Heading,
    Text,
    SimpleGrid,
    Card,
    CardHeader,
    CardBody,
    Stat,
    StatLabel,
    StatNumber,
    Flex,
    VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Sidebar from "../components/app/Drawer";
import supabase from "../utils/supabase";

export default function Dashboard() {
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [counts, setCounts] = useState({
        users: 0,
        treinamentos: 0,
        turmasAbertas: 0,
        turmasTotais: 0,
    });
    const [recentUsers, setRecentUsers] = useState<any>([]);
    const [treinamentosComTurmas, setTreinamentosComTurmas] = useState<any>([]);
    const [presencasPorTreinamento, setPresencasPorTreinamento] = useState<any>([]);
    const [presencasMensais, setPresencasMensais] = useState<any>([]);
    const [turmasPorTreinamento, setTurmasPorTreinamento] = useState<any>([]);
    const [turmasPorMes, setTurmasPorMes] = useState<any>([]);

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor;
        setIsMobileDevice(/android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(userAgent));
    }, []);

    useEffect(() => {
        async function fetchData() {
            const [{ count: userCount }, { count: treinoCount }, turmas, users]: any = await Promise.all([
                supabase.from("users").select("id", { count: "exact", head: true }),
                supabase.from("treinamentos").select("id", { count: "exact", head: true }),
                supabase.from("turmas").select("*"),
                supabase.from("users").select("*").order("created_at", { ascending: false }).limit(5),
            ]);

            const turmasAbertas = turmas.data.filter((t: { status: string; }) => t.status === "aberta");

            setCounts({
                users: userCount || 0,
                treinamentos: treinoCount || 0,
                turmasAbertas: turmasAbertas.length,
                turmasTotais: turmas.data.length,
            });

            setRecentUsers(users.data);

            const { data: turmasComInscricoes }: any = await supabase
                .from("turmas")
                .select("*, treinamentos(*), inscricoes(*, users(*))")
                .eq("status", "aberta");
            setTreinamentosComTurmas(turmasComInscricoes);

            const { data: presencas }: any = await supabase
                .from("presenca")
                .select("*, turmas(*, treinamentos(*))");

            const treinoCountMap: any = {};
            const treinoMesMap: any = {};
            const turmaPorTreinoMap: any = {};
            const turmaPorMesMap: any = {};

            presencas.forEach((p: any) => {
                const treino: any = p.turmas.treinamentos?.treinamento;
                const mes = new Date(p.data).toLocaleDateString("pt-BR", { month: "short", year: "numeric" });

                if (treino) {
                    treinoCountMap[treino] = (treinoCountMap[treino] || 0) + 1;
                    treinoMesMap[mes] = (treinoMesMap[mes] || 0) + 1;
                }
            });

            turmas.data.forEach((t: { treinamentos_id: any; data: string | number | Date; }) => {
                const treino = t.treinamentos_id;
                const mes = new Date(t.data).toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
                turmaPorTreinoMap[treino] = (turmaPorTreinoMap[treino] || 0) + 1;
                turmaPorMesMap[mes] = (turmaPorMesMap[mes] || 0) + 1;
            });

            setPresencasPorTreinamento(
                Object.entries(treinoCountMap).map(([name, value]) => ({ name, value }))
            );
            setPresencasMensais(
                Object.entries(treinoMesMap).map(([name, value]) => ({ name, value }))
            );
            setTurmasPorTreinamento(
                Object.entries(turmaPorTreinoMap).map(([name, value]) => ({ name, value }))
            );
            setTurmasPorMes(
                Object.entries(turmaPorMesMap).map(([name, value]) => ({ name, value }))
            );
        }

        fetchData();
    }, []);

    return (
        <>
            {!isMobileDevice && <Sidebar />}
            <Box ml={!isMobileDevice ? "250px" : 0} p={4}>
                <Heading mb={4}>Dashboard</Heading>

                {/* 1. Cards de contagem */}
                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
                    <Card><CardBody><Stat><StatLabel>Usuários</StatLabel><StatNumber>{counts.users}</StatNumber></Stat></CardBody></Card>
                    <Card><CardBody><Stat><StatLabel>Treinamentos</StatLabel><StatNumber>{counts.treinamentos}</StatNumber></Stat></CardBody></Card>
                    <Card><CardBody><Stat><StatLabel>Turmas Abertas</StatLabel><StatNumber>{counts.turmasAbertas}</StatNumber></Stat></CardBody></Card>
                    <Card><CardBody><Stat><StatLabel>Total de Turmas</StatLabel><StatNumber>{counts.turmasTotais}</StatNumber></Stat></CardBody></Card>
                </SimpleGrid>

                {/* 1.1 Destaques */}
                <Box mb={8}>
                    <Heading size="md" mb={2}>Usuários Recentes</Heading>
                    <Flex gap={4} overflowX="auto">
                        {recentUsers.map((user: any) => (
                            <Card key={user.id} p={4} minW="200px">
                                <VStack>
                                    <Text fontWeight="bold">{user.name}</Text>
                                    <Text fontSize="sm">{user.email}</Text>
                                </VStack>
                            </Card>
                        ))}
                    </Flex>
                </Box>

                {/* 2. Lista de treinamentos com turmas em aberto e inscritos */}
                <Box mb={10}>
                    <Heading size="md" mb={4}>Treinamentos com Turmas Abertas</Heading>
                    <VStack spacing={4} align="stretch">
                        {treinamentosComTurmas.map((turma: any) => (
                            <Card key={turma.id} p={4}>
                                <Heading size="sm">{turma.treinamentos?.treinamento} - {turma.turno} ({turma.data})</Heading>
                                <Text mt={2} fontWeight="bold">Inscritos:</Text>
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={2} mt={2}>
                                    {turma.inscricoes.map((i: any) => (
                                        <Box key={i.id} borderWidth="1px" borderRadius="md" p={2}>
                                            {i.users?.name} ({i.users?.email})
                                        </Box>
                                    ))}
                                </SimpleGrid>
                            </Card>
                        ))}
                    </VStack>
                </Box>

                {/* 3-6. Gráficos */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                    <ChartBox title="Presenças por Treinamento" data={presencasPorTreinamento} />
                    <ChartBox title="Presenças por Mês" data={presencasMensais} />
                    <ChartBox title="Turmas por Treinamento" data={turmasPorTreinamento} />
                    <ChartBox title="Turmas por Mês" data={turmasPorMes} />
                </SimpleGrid>
            </Box>
        </>
    );
}

function ChartBox({ title, data }: any) {
    return (
        <Card>
            <CardHeader>
                <Heading size="sm">{title}</Heading>
            </CardHeader>
            <CardBody>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data}>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#0895d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardBody>
        </Card>
    );
}