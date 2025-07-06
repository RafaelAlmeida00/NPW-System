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
    Select,
    Card,
} from "@chakra-ui/react";
import { FiEdit, FiTrash, FiPlus } from "react-icons/fi";
import { useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { colors } from "../../utils/colors";
import { toaster } from "../../components/ui/toaster";
import supabase from "../../utils/supabase";
import { decryptData, encryptData } from "../../utils/cripto";

export default function IchigenList() {
    const [idp, setIdp] = useState<any>();
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState<any>(null);
    const [options, setOptions] = useState({
        shops: [] as string[],
        areas: [] as string[],
    });

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

    const fetchRecords2 = async () => {
        setLoading(true);
        const { data, error } = await supabase.from("phc").select("*");

        if (error) {
            toaster.error("Erro ao carregar dados.");
        } else {
            setOptions({
                shops: [...new Set(data.map((d: any) => decryptData(d.shop)).filter(Boolean))],
                areas: [...new Set(data.map((d: any) => decryptData(d.area)).filter(Boolean))],
            });
        }
        setLoading(false);
    };


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
        fetchRecords2();
    }, []);

    const openForm = async (item: any = null) => {
        if (item) {
            const { data }: any = await supabase
                .from("phc")
                .select("*")
                .match(item);

            setIdp(data[0].id)
            const decryptDatavar: any = Object.fromEntries(
                Object.entries(item).map(([key, value]) => [key, decryptData(String(value))])
            );

            setCurrent(decryptDatavar);
            setFormData(
                decryptDatavar
            );
        }

        setFormData(
            {
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
            Object.entries(formData)
                .filter(([key]) => key !== "id" && key !== "created_at") // Remove o id
                .map(([key, value]) => [key, encryptData(String(value))])
        );

        if (current) {

            result = await supabase
                .from("ichigenlist")
                .update(encryptedData)
                .eq("id", idp);
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
                                        <Td><Card padding={3} textAlign={"center"} borderRadius={10} bg={decryptData(rec.status) == "Aberto" ? "red.300" : "green.300"} fontWeight={"bold"}>{decryptData(rec.status)}</Card></Td>
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
                            {/* Shop */}
                            <Select
                                placeholder="Selecione um shop"
                                value={formData.shop}
                                onChange={(e) => setFormData({ ...formData, shop: e.target.value })}
                            >
                                {options.shops.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </Select>
                            <Input
                                placeholder="Ou digite outro shop"
                                value={formData.shop}
                                onChange={(e) => setFormData({ ...formData, shop: e.target.value })}
                            />

                            {/* Área */}
                            <Select
                                placeholder="Selecione uma área"
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                            >
                                {options.areas.map((a) => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </Select>
                            <Input
                                placeholder="Ou digite outra área"
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
                            <Select
                                placeholder="Selecione o status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Aberto">Aberto</option>
                                <option value="Fechado">Fechado</option>
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
        </Box>
    );
}
