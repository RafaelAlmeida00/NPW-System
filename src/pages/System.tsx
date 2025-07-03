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
  Avatar,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Sidebar from "../components/app/Drawer";
import { colors } from "../utils/colors";
import { Outlet, useLocation } from "react-router";
import supabase from "../utils/supabase";
import { decryptData } from "../utils/cripto";

export default function System() {
  const location = useLocation();
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

      const turmasAbertas = turmas.data.filter((t: any) => t.status === "Aberta");

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
        .eq("status", "Aberta");

      if (turmasComInscricoes) setTreinamentosComTurmas(turmasComInscricoes);

      const { data: presencas }: any = await supabase
        .from("presenca")
        .select("*, turmas(*, treinamentos(*))");

      const treinoCountMap: any = {};
      const treinoMesMap: any = {};
      const turmaPorTreinoMap: any = {};
      const turmaPorMesMap: any = {};

      presencas?.forEach((p: any) => {
        const treino = p.turmas?.treinamentos?.treinamento || "Sem nome";
        const mes = p.data
          ? new Date(p.data).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
          : "sem data";

        treinoCountMap[treino] = (treinoCountMap[treino] || 0) + 1;
        treinoMesMap[mes] = (treinoMesMap[mes] || 0) + 1;
      });

      turmas.data.forEach((t: any) => {
        const treino = t.treinamento || 0;
        const mes = t.data
          ? new Date(t.data).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
          : "sem data";
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
      {location.pathname !== "/system" && location.pathname !== "/system/" ? (<Box><Outlet /></Box>) :

        <Box p={8} bg={colors.white} minH="100vh" marginLeft={"20vw"}>
          <Heading size="lg" color={colors.pm} mb={6}>
            Dashboard</Heading>

          <SimpleGrid columns={{ base: 1, md: 4 }} mb={6}>
            <Card bg={colors.pms}><CardBody><Stat><StatLabel>Usuários</StatLabel><StatNumber>{counts.users}</StatNumber></Stat></CardBody></Card>
            <Card bg={colors.scs}><CardBody><Stat><StatLabel>Treinamentos</StatLabel><StatNumber>{counts.treinamentos}</StatNumber></Stat></CardBody></Card>
            <Card bg={colors.pms}><CardBody><Stat><StatLabel>Turmas Abertas</StatLabel><StatNumber>{counts.turmasAbertas}</StatNumber></Stat></CardBody></Card>
            <Card bg={colors.scs}><CardBody><Stat><StatLabel>Total de Turmas</StatLabel><StatNumber>{counts.turmasTotais}</StatNumber></Stat></CardBody></Card>
          </SimpleGrid>

          <Box mb={8}>
            <Heading size="md" mb={2}>Usuários Recentes</Heading>
            <Flex gap={4} overflowX="auto">
              {recentUsers.map((user: any) => (
                <Card key={user.id} p={4} minW="200px" bg={colors.white}>
                  <VStack>
                    <Avatar name={decryptData(user.name)} />
                    <Text fontWeight="bold">{decryptData(user.name)}</Text>
                    <Text fontSize="sm">{user.email}</Text>
                  </VStack>
                </Card>
              ))}
            </Flex>
          </Box>

          {treinamentosComTurmas.length > 0 && (
            <Box mb={10}>
              <Heading size="md" mb={4}>Treinamentos com Turmas Abertas</Heading>
              <VStack align="stretch">
                {treinamentosComTurmas.map((turma: any) => (
                  <Card key={turma.id} p={4}>
                    <Heading size="sm">{turma.treinamentos?.treinamento} - {turma.turno} ({turma.data})</Heading>
                    <Text mt={2} fontWeight="bold">Inscritos:</Text>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={2} mt={2}>
                      {turma.inscricoes.map((i: any) => (
                        <Box key={i.id} borderWidth="1px" borderRadius="md" p={2}>
                          {i.users?.name ? decryptData(i.users.name) : "Sem nome"} ({i.users?.email})
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Card>
                ))}
              </VStack>
            </Box>
          )}

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <ChartBox title="Presenças por Treinamento" data={presencasPorTreinamento} />
            <ChartBox title="Presenças por Mês" data={presencasMensais} />
            <ChartBox title="Turmas por Treinamento" data={turmasPorTreinamento} />
            <ChartBox title="Turmas por Mês" data={turmasPorMes} />
          </SimpleGrid>
        </Box>
      }
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
            <Bar dataKey="value" fill={colors.pm} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
