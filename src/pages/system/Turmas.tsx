"use client";

import {
  Box,
  Heading,
  Button,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import supabase from "../../utils/supabase";
import { colors } from "../../utils/colors";
import { useAuth } from "../../utils/authprovider";

interface Treinamento {
  id: number;
  treinamento: string;
}

interface Turma {
  id: number;
  treinamento_id: number;
  data: string;
  turno: "Manhã" | "Tarde" | "Noite";
  status: "Aberta" | "Fechada";
  inscricoes: number[]; // array com userIds inscritos
}

export default function Turmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { user }: any = useAuth();
  const toast = useToast();

  async function fetchTurmas() {
    setLoading(true);
    try {
      // Buscar turmas abertas
      const { data: turmasData, error: turmasError } = await supabase
        .from("turmas")
        .select("id, treinamento_id, data, turno, status")
        .eq("status", "Aberta")
        .order("data", { ascending: true });

      if (turmasError) throw turmasError;
      if (!turmasData || turmasData.length === 0) {
        setTurmas([]);
        setLoading(false);
        return;
      }

      const turmaIds = turmasData.map((t) => t.id);

      // Buscar inscrições dos usuários (só user_ids para performance)
      const { data: inscricoesData, error: inscricoesError } = await supabase
        .from("inscricoes")
        .select("turmaid, userid")
        .in("turmaid", turmaIds);

      if (inscricoesError) throw inscricoesError;

      // Mapear inscrições por turma: turmaId => array de userIds
      const inscricoesPorTurma: Record<number, number[]> = {};
      turmaIds.forEach((id) => (inscricoesPorTurma[id] = []));
      inscricoesData?.forEach((insc: any) => {
        inscricoesPorTurma[insc.turmaid].push(insc.userid);
      });

      // Montar array final
      const turmasComInscricoes: Turma[] = turmasData.map((t) => ({
        ...t,
        inscricoes: inscricoesPorTurma[t.id] || [],
      }));

      setTurmas(turmasComInscricoes);
    } catch (error) {
      toast({
        title: "Erro ao carregar turmas",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchTreinamentos() {
    try {
      const { data, error } = await supabase
        .from("treinamentos")
        .select("id, treinamento");

      if (error) throw error;
      setTreinamentos(data || []);
    } catch {
      toast({
        title: "Erro ao carregar treinamentos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  useEffect(() => {
    fetchTreinamentos();
    fetchTurmas();
  }, []);

  async function handleInscrever(turmaId: number) {
    if (!user?.id) {
      toast({
        title: "Usuário não autenticado",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Verificar se já inscrito - opcional, pode evitar na UI tbm
      const { data: existing, error } = await supabase
        .from("inscricoes")
        .select("*")
        .eq("turmaid", turmaId)
        .eq("userid", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found, pode inserir

      if (existing) {
        toast({
          title: "Você já está inscrito nessa turma.",
          status: "info",
          duration: 2000,
          isClosable: true,
        });
        return;
      }

      // Inserir inscrição
      const { error: insertError } = await supabase
        .from("inscricoes")
        .insert([{ turmaid: turmaId, userid: user.id }]);

      if (insertError) throw insertError;

      toast({
        title: "Inscrição realizada com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      fetchTurmas();
    } catch {
      toast({
        title: "Erro ao realizar inscrição",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }

  if (loading) return <Spinner size="xl" mt={10} />;

  return (
    <Box p={8} bg={colors.white} minH="100vh" marginLeft={"20vw"}>
      <Heading size="lg" color={colors.pm} mb={6}>
        Inscrição em Turmas
      </Heading>

      <TableContainer bg="white" borderRadius="lg" boxShadow="md" p={4}>
        <Table variant="simple">
          <Thead bg={colors.sc}>
            <Tr>
              <Th color={colors.white}>Treinamento</Th>
              <Th color={colors.white}>Data</Th>
              <Th color={colors.white}>Turno</Th>
              <Th color={colors.white}>Status</Th>
              <Th color={colors.white} textAlign="center">Ação</Th>
            </Tr>
          </Thead>
          <Tbody>
            {turmas.map((turma) => {
              const treinamento = treinamentos.find(
                (t) => t.id === turma.treinamento_id
              );

              const inscrito = turma.inscricoes.includes(user?.id || -1);

              return (
                <Tr key={turma.id}>
                  <Td>{treinamento?.treinamento ?? "—"}</Td>
                  <Td>{new Date(turma.data).toLocaleDateString("pt-BR")}</Td>
                  <Td>{turma.turno}</Td>
                  <Td>{turma.status}</Td>
                  <Td textAlign="center">
                    {inscrito ? (
                      <Button isDisabled colorScheme="green">
                        Inscrito
                      </Button>
                    ) : (
                      <Button
                        colorScheme="blue"
                        onClick={() => handleInscrever(turma.id)}
                      >
                        Inscrever-se
                      </Button>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}
