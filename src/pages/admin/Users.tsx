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
    Switch,
    Card,
} from "@chakra-ui/react";
import { FiEdit, FiTrash } from "react-icons/fi";
import { useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { colors } from "../../utils/colors";
import { toaster } from "../../components/ui/toaster";
import supabase from "../../utils/supabase";
import { decryptData, encryptData } from "../../utils/cripto";

export default function UsersAdmin() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState<any>(null);
    const [formData, setFormData] = useState<any>({
        name: "",
        email: "",
        matricula: "",
        senha: "",
        admin_level: 1,
        active: false,
    });

    const { isOpen, onOpen, onClose } = useDisclosure();

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase.from("users").select("*");
        if (error) {
            toaster.error("Erro ao carregar usuários.");
        } else {
            const decryptedUsers = data.map((user: any) => ({
                ...user,
                name: decryptData(user.name),
                matricula: decryptData(user.matricula),
            }));
            setUsers(decryptedUsers);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openForm = (item: any = null) => {
        setCurrent(item);
        setFormData(
            item || {
                name: "",
                email: "",
                matricula: "",
                senha: "",
                admin_level: 1,
                active: false,
            }
        );
        onOpen();
    };

    const handleSave = async () => {
        let encryptedPayload = {
            ...formData,
            name: encryptData(formData.name),
            matricula: encryptData(formData.matricula),
        }

        const teste = decryptData(formData.senha);

        if (!teste) {
            encryptedPayload = {
                ...formData,
                name: encryptData(formData.name),
                matricula: encryptData(formData.matricula),
                senha: encryptData(formData.senha),
            }
        }

        const result = current
            ? await supabase.from("users").update(encryptedPayload).eq("id", current.id)
            : await supabase.from("users").insert([encryptedPayload]);

        if (result.error) {
            toaster.error("Erro ao salvar.");
        } else {
            toaster.success("Usuário salvo com sucesso.");
            fetchUsers();
            onClose();
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = window.confirm("Deseja excluir este usuário?");
        if (!confirmed) return;

        const { error } = await supabase.from("users").delete().eq("id", id);
        if (error) {
            toaster.error("Erro ao excluir.");
        } else {
            toaster.success("Usuário excluído.");
            fetchUsers();
        }
    };

    return (
        <Box p={8} bg={colors.white} minH="100vh" marginLeft={"20vw"}>
            <Heading size="lg" color={colors.pm} mb={6}>
                Administração de Usuários
            </Heading>


            {loading ? (
                <Spinner />
            ) : (
                <Box bg="white" borderRadius="lg" boxShadow="md" p={4}>
                    <TableContainer>
                        <Table variant="simple">
                            <Thead bg={colors.sc}>
                                <Tr>
                                    <Th color={colors.white}>Nome</Th>
                                    <Th color={colors.white}>Email</Th>
                                    <Th color={colors.white}>Matrícula</Th>
                                    <Th color={colors.white}>Admin Level</Th>
                                    <Th color={colors.white}>Ativo</Th>
                                    <Th textAlign="center" color={colors.white}>
                                        Ações
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {users.map((user) => (
                                    <Tr key={user.id}>
                                        <Td>{user.name}</Td>
                                        <Td>{user.email}</Td>
                                        <Td>{user.matricula}</Td>
                                        <Td>{user.admin_level}</Td>
                                        <Td><Card padding={3} textAlign={"center"} borderRadius={10} bg={user.active ? "green.300" : "red.300"} fontWeight={"bold"}>{user.active ? "Sim" : "Não"}</Card></Td>
                                        <Td textAlign="center">
                                            <HStack justify="center">
                                                <IconButton
                                                    aria-label="Editar"
                                                    size="sm"
                                                    icon={<FiEdit />}
                                                    onClick={() => openForm(user)}
                                                />
                                                <IconButton
                                                    aria-label="Excluir"
                                                    size="sm"
                                                    icon={<FiTrash />}
                                                    colorScheme="red"
                                                    onClick={() => handleDelete(user.id)}
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
                        {current ? "Editar Usuário" : "Novo Usuário"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <Input
                                placeholder="Nome do Usuário"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                            <Input
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                            />
                            <Input
                                placeholder="Matrícula"
                                value={formData.matricula}
                                onChange={(e) =>
                                    setFormData({ ...formData, matricula: e.target.value })
                                }
                            />
                            <Input
                                placeholder="Senha"
                                value={formData.senha}
                                onChange={(e) =>
                                    setFormData({ ...formData, senha: e.target.value })
                                }
                                type="password"
                            />
                            <Input
                                placeholder="Admin Level"
                                type="number"
                                value={formData.admin_level}
                                onChange={(e) =>
                                    setFormData({ ...formData, admin_level: Number(e.target.value) })
                                }
                            />
                            <HStack w="100%" justify="space-between">
                                <span>Ativo</span>
                                <Switch
                                    isChecked={formData.active}
                                    onChange={(e) =>
                                        setFormData({ ...formData, active: e.target.checked })
                                    }
                                />
                            </HStack>
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
