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
import { decryptData, encryptData } from "../../utils/cripto";

export default function IchigenList() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState<any>(null);
    const [formData, setFormData] = useState({
        shop: "",
        area: "",
        confirmacao: "",
        observacao: "",
        acao: "",
        responsavel: "",
        abertura: "",
        status: "",
    });

    const { isOpen, onOpen, onClose } = useDisclosure();

    const fetchRecords = async () => {
        setLoading(true);
        const { data, error } = await supabase.from("ichigenlist").select("*");
        if (error) {
            toaster.error("Erro ao carregar dados.");
        } else {
            setRecords(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const openForm = (item: any = null) => {
        setCurrent(item);
        setFormData(
            item || {
                shop: "",
                area: "",
                confirmacao: "",
                observacao: "",
                acao: "",
                responsavel: "",
                abertura: "",
                status: "",
            }
        );
        onOpen();
    };

    const handleSave = async () => {
        let result;
        const encryptedData = Object.fromEntries(
            Object.entries(formData).map(([key, value]) => [key, encryptData(String(value))])
        );

        if (current) {
            result = await supabase
                .from("ichigenlist")
                .update(encryptedData)
                .eq("id", current.id);
        } else {
            result = await supabase.from("ichigenlist").insert([encryptedData]);
        }

        if (result.error) {
            toaster.error("Erro ao salvar.");
        } else {
            toaster.success("Registro salvo com sucesso.");
            fetchRecords();
            onClose();
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = window.confirm("Deseja excluir este registro?");
        if (!confirmed) return;

        const { error } = await supabase.from("ichigenlist").delete().eq("id", id);
        if (error) {
            toaster.error("Erro ao excluir.");
        } else {
            toaster.success("Registro excluído.");
            fetchRecords();
        }
    };

    return (
        <Box p={8} bg={colors.white} minH="100vh" marginLeft={"20vw"}>
            <Heading size="lg" color={colors.pm} mb={6}>
                Administração de Dados Ichigen
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
                Novo Registro
            </Button>

            {loading ? (
                <Spinner />
            ) : (
                <Box bg="white" borderRadius="lg" boxShadow="md" p={4}>
                    <TableContainer>
                        <Table variant="simple">
                            <Thead bg={colors.sc}>
                                <Tr>
                                    <Th color={colors.white}>Shop</Th>
                                    <Th color={colors.white}>Área</Th>
                                    <Th color={colors.white}>Confirmação</Th>
                                    <Th color={colors.white}>Observação</Th>
                                    <Th color={colors.white}>Ação</Th>
                                    <Th color={colors.white}>Responsável</Th>
                                    <Th color={colors.white}>Abertura</Th>
                                    <Th color={colors.white}>Status</Th>
                                    <Th color={colors.white} textAlign="center">Ações</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {records.map((rec) => (
                                    <Tr key={rec.id}>
                                        <Td>{decryptData(rec.shop)}</Td>
                                        <Td>{decryptData(rec.area)}</Td>
                                        <Td>{decryptData(rec.confirmacao)}</Td>
                                        <Td>{decryptData(rec.observacao)}</Td>
                                        <Td>{decryptData(rec.acao)}</Td>
                                        <Td>{decryptData(rec.responsavel)}</Td>
                                        <Td>{decryptData(rec.abertura)}</Td>
                                        <Td>{decryptData(rec.status)}</Td>
                                        <Td textAlign="center">
                                            <HStack justify="center">
                                                <IconButton
                                                    aria-label="Editar"
                                                    size="sm"
                                                    icon={<FiEdit />}
                                                    onClick={() => openForm(rec)}
                                                />
                                                <IconButton
                                                    aria-label="Excluir"
                                                    size="sm"
                                                    icon={<FiTrash />}
                                                    colorScheme="red"
                                                    onClick={() => handleDelete(rec.id)}
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
                        {current ? "Editar Registro Ichigen" : "Novo Registro Ichigen"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <Input
                                placeholder="Shop"
                                value={formData.shop}
                                onChange={(e) => setFormData({ ...formData, shop: e.target.value })}
                            />
                            <Input
                                placeholder="Área"
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            />
                            <Input
                                placeholder="Confirmação"
                                type="date"
                                value={formData.confirmacao}
                                onChange={(e) => setFormData({ ...formData, confirmacao: e.target.value })}
                            />
                            <Input
                                placeholder="Observação"
                                value={formData.observacao}
                                onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                            />
                            <Input
                                placeholder="Ação"
                                value={formData.acao}
                                onChange={(e) => setFormData({ ...formData, acao: e.target.value })}
                            />
                            <Input
                                placeholder="Responsável"
                                value={formData.responsavel}
                                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                            />
                            <Input
                                placeholder="Abertura"
                                type="date"
                                value={formData.abertura}
                                onChange={(e) => setFormData({ ...formData, abertura: e.target.value })}
                            />
                            <Input
                                placeholder="Status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
