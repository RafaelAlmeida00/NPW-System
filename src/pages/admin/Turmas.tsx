"use client";

import {
  Box,
  Heading,
  Button,
  IconButton,
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Spinner,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tag,
  Wrap,
  WrapItem,
  useToast,
} from "@chakra-ui/react";
import { FiEdit, FiTrash, FiPlus, FiX } from "react-icons/fi";
import { useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { colors } from "../../utils/colors";
import supabase from "../../utils/supabase";
import QRCode from 'qrcode';
import { MdQrCode } from "react-icons/md";

interface Treinamento {
  id: number;
  treinamento: string;
  link: string;
}

interface Inscricao {
  id: number;
  user_id: number;
  nome: string;
}

interface Turma {
  id: number;
  treinamento_id: number;
  data: string;
  turno: "Manhã" | "Tarde" | "Noite";
  status: "Aberta" | "Fechada";
  inscricoes: Inscricao[];
}

export default function TurmasAdmin() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [loading, setLoading] = useState(true);

  const [current, setCurrent] = useState<Turma | null>(null);
  const [formData, setFormData] = useState({
    treinamento_id: 0,
    data: "",
    turno: "Manhã",
    status: "Aberta",
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const generateQr = async (id: any) => {
    try {
      const url = `https://npw-system.vercel.app/system/admin/turmas/presenca/${id}`;
      const qr = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 300,
      });
      setQrCodeUrl(qr);
    } catch (err) {
      console.error('Erro ao gerar QR Code:', err);
    }
  };

  const onQrCode = async (id: number) => {
    await generateQr(id);
  }
  // Fetch turmas + inscricoes + nome usuarios (via join)
  async function fetchTurmas() {
    setLoading(true);
    // Query com join e subselect para pegar inscritos
    // Como supabase não tem join direto, fazemos múltiplas queries:

    try {
      // Buscar turmas com dados básicos
      const { data: turmasData, error: turmasError } = await supabase
        .from("turmas")
        .select("id, treinamento_id, data, turno, status")
        .order("data", { ascending: false });

      if (turmasError) throw turmasError;

      if (!turmasData || turmasData.length === 0) {
        setTurmas([]);
        setLoading(false);
        return;
      }

      // Buscar inscrições com info usuário
      const turmaIds = turmasData.map((t) => t.id);
      const { data: inscricoesData, error: inscricoesError } = await supabase
        .from("inscricoes")
        .select("id, turmaid, userid, users(email)")
        .in("turmaid", turmaIds);

      if (inscricoesError) throw inscricoesError;

      // Mapear as inscrições por turma
      const inscricoesPorTurma: Record<number, Inscricao[]> = {};
      turmaIds.forEach((id) => (inscricoesPorTurma[id] = []));
      inscricoesData?.forEach((insc: any) => {
        inscricoesPorTurma[insc.turmaid]?.push({
          id: insc.id,
          user_id: insc.userid,
          nome: insc.users?.email ?? "Usuário",
        });
      });

      // Montar array final com inscricoes agregadas
      const turmasComInscricoes: Turma[] = turmasData.map((t) => ({
        id: t.id,
        treinamento_id: t.treinamento_id,
        data: t.data,
        turno: t.turno,
        status: t.status,
        inscricoes: inscricoesPorTurma[t.id] || [],
      }));

      console.log(turmasComInscricoes);

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

  // Buscar treinamentos para select
  async function fetchTreinamentos() {
    const { data, error }: any = await supabase.from("treinamentos").select("id, treinamento");
    if (error) {
      toast({
        title: "Erro ao carregar treinamentos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setTreinamentos(data);
    console.log(data);
    console.log(treinamentos);


  }

  useEffect(() => {
    fetchTreinamentos();
    fetchTurmas();
  }, []);

  function openForm(turma: Turma | null = null) {
    if (turma) {
      setCurrent(turma);
      setFormData({
        treinamento_id: turma.treinamento_id,
        data: turma.data,
        turno: turma.turno,
        status: turma.status,
      });
    } else {
      setCurrent(null);
      setFormData({
        treinamento_id: 0,
        data: "",
        turno: "Manhã",
        status: "Aberta",
      });
    }
    onOpen();
  }

  // Salvar turma
  async function handleSave() {
    if (
      !formData.treinamento_id ||
      !formData.data ||
      !formData.turno ||
      !formData.status
    ) {
      toast({
        title: "Preencha todos os campos",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    const newRecord = {
      treinamento_id: formData.treinamento_id,
      data: formData.data,
      turno: formData.turno,
      status: formData.status,
    };

    try {
      let res;
      if (current) {
        res = await supabase
          .from("turmas")
          .update(newRecord)
          .eq("id", current.id);
      } else {
        res = await supabase.from("turmas").insert([newRecord]);
      }
      if (res.error) throw res.error;
      toast({
        title: current ? "Turma atualizada" : "Turma criada",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      fetchTurmas();
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar turma",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    }
  }

  // Excluir turma
  async function handleDeleteTurma(id: number) {
    const confirmed = window.confirm("Deseja excluir esta turma?");
    if (!confirmed) return;

    const { error } = await supabase.from("turmas").delete().eq("id", id);
    if (error) {
      toast({
        title: "Erro ao excluir turma",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } else {
      toast({
        title: "Turma excluída",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      fetchTurmas();
    }
  }

  // Excluir inscrição
  async function handleDeleteInscricao(inscricaoId: number) {
    const confirmed = window.confirm("Deseja excluir esta inscrição?");
    if (!confirmed) return;

    const { error } = await supabase.from("inscricoes").delete().eq("id", inscricaoId);
    if (error) {
      toast({
        title: "Erro ao excluir inscrição",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } else {
      toast({
        title: "Inscrição excluída",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      fetchTurmas();
    }
  }

  return (
    <Box p={8} bg={colors.white} minH="100vh" marginLeft={"20vw"}>
      <Heading size="lg" color={colors.pm} mb={6}>
        Administração de Turmas
      </Heading>

      <Button
        leftIcon={<FiPlus />}
        size="sm"
        color="white"
        bg={colors.sc}
        _hover={{ bg: colors.sc }}
        onClick={() => openForm(null)}
        mb={4}
      >
        Nova Turma
      </Button>

      {loading ? (
        <Spinner />
      ) : (
        <Box bg="white" borderRadius="lg" boxShadow="md" p={4}>
          <TableContainer>
            <Table variant="simple">
              <Thead bg={colors.sc}>
                <Tr>
                  <Th color={colors.white}>Treinamento</Th>
                  <Th color={colors.white}>Data</Th>
                  <Th color={colors.white}>Turno</Th>
                  <Th color={colors.white}>Status</Th>
                  <Th color={colors.white}>Inscritos</Th>
                  <Th textAlign="center" color={colors.white}>
                    Ações
                  </Th>
                  <Th color={colors.white}>Presença</Th>
                </Tr>
              </Thead>
              <Tbody>
                {turmas.map((turma) => {
                  const treinamento = treinamentos.find(
                    (t) => t.id === turma.treinamento_id
                  );

                  return (
                    <Tr key={turma.id}>
                      <Td>{treinamento ? treinamento.treinamento : "—"}</Td>
                      <Td>{new Date(turma.data).toLocaleDateString("pt-BR")}</Td>
                      <Td>{turma.turno}</Td>
                      <Td>{turma.status}</Td>
                      <Td>
                        <Wrap>
                          {turma.inscricoes.map((insc) => (
                            <WrapItem key={insc.id}>
                              <Tag
                                size="sm"
                                colorScheme="blue"
                                borderRadius="full"
                                cursor="default"
                                userSelect="none"
                              >
                                <HStack spacing={1}>
                                  <Text>{insc.nome}</Text>
                                  <IconButton
                                    aria-label="Excluir inscrição"
                                    icon={<FiX />}
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => handleDeleteInscricao(insc.id)}
                                  />
                                </HStack>
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </Td>
                      <Td textAlign="center">
                        <HStack justify="center">
                          <IconButton
                            aria-label="Editar"
                            size="sm"
                            icon={<FiEdit />}
                            onClick={() => openForm(turma)}
                          />
                          <IconButton
                            aria-label="Excluir"
                            size="sm"
                            icon={<FiTrash />}
                            colorScheme="red"
                            onClick={() => handleDeleteTurma(turma.id)}
                          />
                        </HStack>
                      </Td>
                      <Td><HStack justify="center">
                        <IconButton
                          aria-label="Presença"
                          size="sm"
                          icon={<MdQrCode />}
                          onClick={() => onQrCode(turma.id)}
                        />
                      </HStack></Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Modal para cadastrar/editar turma */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="white">
          <ModalHeader color={colors.pm}>
            {current ? "Editar Turma" : "Nova Turma"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Select
                placeholder="Selecione o Treinamento"
                value={formData.treinamento_id || ""}
                onChange={(e) =>
                  setFormData({ ...formData, treinamento_id: Number(e.target.value) })
                }
              >
                {treinamentos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.treinamento}
                  </option>
                ))}
              </Select>

              <Input
                type="date"
                placeholder="Data da Turma"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              />

              <Select
                value={formData.turno}
                onChange={(e) => setFormData({ ...formData, turno: e.target.value as any })}
              >
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
              </Select>

              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="Aberta">Aberta</option>
                <option value="Fechada">Fechada</option>
              </Select>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button bg={colors.pm} color="white" mr={3} onClick={handleSave}>
              Salvar
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para exibir QR Code */}
      <Modal isOpen={!!qrCodeUrl} onClose={() => setQrCodeUrl("")}>
        <ModalOverlay />
        <ModalContent bg="white">
          <ModalHeader color={colors.pm}>
            Lista de Presença
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <img src={qrCodeUrl || ""} alt="QR Code" style={{ width: "100%", height: "auto" }} />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
