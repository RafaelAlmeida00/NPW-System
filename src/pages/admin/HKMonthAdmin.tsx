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
} from "@chakra-ui/react";
import { FiEdit, FiTrash, FiPlus } from "react-icons/fi";
import { useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { colors } from "../../utils/colors";
import { toaster } from "../../components/ui/toaster";
import supabase from "../../utils/supabase";
import { decryptData, encryptData } from "../../utils/cripto";

export default function HKMonthAdmin() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [objectives, setObjectives] = useState<any[]>([]);

    const { isOpen, onOpen, onClose } = useDisclosure();

    const fetchRecords = async () => {
        setLoading(true);
        const { data, error } = await supabase.from("hkdigitalmonth").select("*");
        if (error) {
            toaster.error("Erro ao carregar dados.");
        } else {
            setRecords(data);
        }
        setLoading(false);
    };

    const fetchObjectives = async () => {
        const { data, error } = await supabase.from("hkdigital").select("id, descricao");
        if (!error) {
            setObjectives(data);
        }
    };

    useEffect(() => {
        fetchRecords();
        fetchObjectives();
    }, []);

    const openForm = (item: any = null) => {
        if (item) {
            const decrypted = Object.fromEntries(
                Object.entries(item).map(([key, value]) => [key, decryptData(String(value))])
            );
            setCurrent(item);
            setFormData(decrypted);
        } else {
            setCurrent(null);
            setFormData({});
        }
        onOpen();
    };

    const handleSave = async () => {
        const encrypted = Object.fromEntries(
            Object.entries(formData).map(([key, value]) =>
                key === "objective" ? [key, value] : [key, encryptData(String(value))]
            )
        );


        console.log(encrypted);
        console.log(formData);

        const result = current
            ? await supabase.from("hkdigitalmonth").update(encrypted).eq("id", current.id)
            : await supabase.from("hkdigitalmonth").insert([encrypted]);

        if (result.error) {
            toaster.error("Erro ao salvar registro.");
        } else {
            toaster.success("Registro salvo com sucesso.");
            fetchRecords();
            onClose();
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Deseja realmente excluir?")) return;

        const { error } = await supabase.from("hkdigitalmonth").delete().eq("id", id);
        if (error) {
            toaster.error("Erro ao excluir registro.");
        } else {
            toaster.success("Registro excluído com sucesso.");
            fetchRecords();
        }
    };

    const renderInput = (field: string) => {
        const selectFields: Record<string, string[]> = {
            month: [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ],
            status: [
                "Achievement of Target (and or above) Target",
                "Between Commitment & Target",
                "Below Commitment"
            ]
        };

        if (selectFields[field]) {
            return (
                <Select
                    placeholder={field.toUpperCase()}
                    value={formData[field] || ""}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                >
                    {selectFields[field].map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </Select>
            );
        }

        if (field === "objective") {
            return (
                <Select
                    placeholder="OBJETIVO"
                    value={formData[field] || ""}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                >
                    {objectives.map((obj: any) => (
                        <option key={obj.id} value={obj.id}>{decryptData(obj.descricao)}</option>
                    ))}
                </Select>
            );
        }

        const numberFields = ["target", "commitment", "result"];

        return (
            <Input
                placeholder={field.toUpperCase()}
                type={numberFields.includes(field) ? "number" : "text"}
                value={formData[field] || ""}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            />
        );
    };

    const fields = ["month", "target", "commitment", "result", "status", "objective"];

    return (
        <Box p={8} bg={colors.white} minH="100vh" marginLeft="20vw">
            <Heading size="lg" color={colors.pm} mb={6}>
                Administração de Dados HK (Mês)
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
                                    {fields.map((f) => (
                                        <Th key={f} color={colors.white}>{f.toUpperCase()}</Th>
                                    ))}
                                    <Th color={colors.white} textAlign="center">Ações</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {records.map((rec) => (
                                    <Tr key={rec.id}>
                                        {fields.map((f) => (
                                            <Td key={f}>{decryptData(rec[f])}</Td>
                                        ))}
                                        <Td textAlign="center">
                                            <HStack justify="center">
                                                <IconButton aria-label="Editar" size="sm" icon={<FiEdit />} onClick={() => openForm(rec)} />
                                                <IconButton aria-label="Excluir" size="sm" icon={<FiTrash />} colorScheme="red" onClick={() => handleDelete(rec.id)} />
                                            </HStack>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader color={colors.pm}>{current ? "Editar Registro" : "Novo Registro"}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={3}>
                            {fields.map((f) => renderInput(f))}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button bg={colors.pm} color="white" mr={3} onClick={handleSave}>
                            Salvar
                        </Button>
                        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}