"use client";

import {
  Box,
  Heading,
  Button,
  IconButton,
  Input,
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
} from "@chakra-ui/react";
import { FiEdit, FiTrash, FiPlus } from "react-icons/fi";
import { useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { colors } from "../../utils/colors";
import { toaster } from "../../components/ui/toaster";
import supabase from "../../utils/supabase";


export default function TreinamentosAdmin() {
  const [treinamentos, setTreinamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<any>(null);
  const [formData, setFormData] = useState({ treinamento: "", link: "" });

  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchTreinamentos = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("treinamentos").select("*");
    if (error) {
      toaster.error("Erro ao carregar treinamentos.");
    } else {
      setTreinamentos(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTreinamentos();
  }, []);

  const openForm = (item: any = null) => {
    setCurrent(item);
    setFormData(item || { treinamento: "", link: "" });
    onOpen();
  };

  const handleSave = async () => {
    if (!formData.treinamento || !formData.link) {
      toaster.warning("Preencha todos os campos.");
      return;
    }

    let result;
    if (current) {
      result = await supabase
        .from("treinamentos")
        .update(formData)
        .eq("id", current.id);
    } else {
      result = await supabase.from("treinamentos").insert([formData]);
    }

    if (result.error) {
      toaster.error("Erro ao salvar.");
    } else {
      toaster.success("Treinamento salvo com sucesso.");
      fetchTreinamentos();
      onClose();
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Deseja excluir este Treinamento?");
    if (!confirmed) return;

    const { error } = await supabase.from("treinamentos").delete().eq("id", id);
    if (error) {
      toaster.error("Erro ao excluir.");
    } else {
      toaster.success("Treinamento excluído.");
      fetchTreinamentos();
    }
  };

  return (
    <Box p={8} bg={colors.white} minH="100vh" marginLeft={"20vw"}>
      <Heading size="lg" color={colors.pm} mb={6}>
        Administração de Treinamentos
      </Heading>

      <Button
        leftIcon={<FiPlus />}
        size="sm"
        color="white"
        bg={colors.sc}
        _hover={{ bg: colors.sc }}
        onClick={() => openForm()}
        mb={4}
      >
        Novo Treinamento
      </Button>

      {loading ? (
        <Spinner />
      ) : (
        <Box bg="white" borderRadius="lg" boxShadow="md" p={4}>
          <TableContainer>
            <Table variant="simple">
              <Thead bg={colors.sc}>
                <Tr >
                  <Th color={colors.white}>Treinamento</Th>
                  <Th color={colors.white}>Link</Th>
                  <Th  textAlign="center" color={colors.white}>Ações</Th>
                </Tr>
              </Thead>
              <Tbody >
                {treinamentos.map((treino) => (
                  <Tr key={treino.id} >
                    <Td >{treino.treinamento}</Td>
                    <Td>
                      <a href={treino.link} target="_blank" rel="noopener noreferrer">
                        <Text color={colors.pm} fontSize="sm" _hover={{ textDecoration: "underline" }}>
                          {treino.link}
                        </Text>
                      </a>
                    </Td>
                    <Td textAlign="center">
                      <HStack justify="center">
                        <IconButton
                          aria-label="Editar"
                          size="sm"
                          icon={<FiEdit />}
                          onClick={() => openForm(treino)}
                        />
                        <IconButton
                          aria-label="Excluir"
                          size="sm"
                          icon={<FiTrash />}
                          colorScheme="red"
                          onClick={() => handleDelete(treino.id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="white">
          <ModalHeader color={colors.pm}>
            {current ? "Editar Treinamento" : "Novo Treinamento"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input
                placeholder="Nome do Treinamento"
                value={formData.treinamento}
                onChange={(e) => setFormData({ ...formData, treinamento: e.target.value })}
              />
              <Input
                placeholder="Link de Acesso"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
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
    </Box>
  );
}
