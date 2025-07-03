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

export default function DatabasePHC() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState<any>(null);
    const [formData, setFormData] = useState({
        fy: "",
        coordenador: "",
        supervisor: "",
        shop: "",
        area: "",
        turno: "",
        mes: "",
        status: "",
        level_1: "",
        level_2: "",
        level_3: "",
        level_4: "",
        level_5: "",
        "1x2_op1": "",
        "1x2_op2": "",
        "1x2_job": "",
        sv_level: "",
        level_geral: "",
        check_daily: "",
    });


    const { isOpen, onOpen, onClose } = useDisclosure();

    // Opções dinâmicas
    const [options, setOptions] = useState({
        coordenadores: [] as string[],
        supervisores: [] as string[],
        shops: [] as string[],
        areas: [] as string[],
    });

    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ];

    const fetchRecords = async () => {
        setLoading(true);
        const { data, error } = await supabase.from("phc").select("*");
        if (error) {
            toaster.error("Erro ao carregar dados.");
        } else {
            setRecords(data);
            // Extrair opções únicas
            setOptions({
                coordenadores: [...new Set(data.map((d: any) => decryptData(d.coordenador)).filter(Boolean))],
                supervisores: [...new Set(data.map((d: any) => decryptData(d.supervisor)).filter(Boolean))],
                shops: [...new Set(data.map((d: any) => decryptData(d.shop)).filter(Boolean))],
                areas: [...new Set(data.map((d: any) => decryptData(d.area)).filter(Boolean))],
            });
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
                fy: "",
                coordenador: "",
                supervisor: "",
                shop: "",
                area: "",
                turno: "",
                mes: "",
                status: "",
                level_1: "",
                level_2: "",
                level_3: "",
                level_4: "",
                level_5: "",
                "1x2_op1": "",
                "1x2_op2": "",
                "1x2_job": "",
                sv_level: "",
                level_geral: "",
                check_daily: "",
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
                .from("phc")
                .update(encryptedData)
                .eq("id", current.id);
        } else {
            result = await supabase.from("phc").insert([encryptedData]);
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

        const { error } = await supabase.from("phc").delete().eq("id", id);
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
                Administração de Dados PHC
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
                                    <Th color={colors.white}>FY</Th>
                                    <Th color={colors.white}>Coordenador</Th>
                                    <Th color={colors.white}>Supervisor</Th>
                                    <Th color={colors.white}>Shop</Th>
                                    <Th color={colors.white}>Área</Th>
                                    <Th color={colors.white}>Turno</Th>
                                    <Th color={colors.white}>Mês</Th>
                                    <Th color={colors.white}>Status</Th>
                                    <Th color={colors.white}>Level 1</Th>
                                    <Th color={colors.white}>Level 2</Th>
                                    <Th color={colors.white}>Level 3</Th>
                                    <Th color={colors.white}>Level 4</Th>
                                    <Th color={colors.white}>Level 5</Th>
                                    <Th color={colors.white}>L Level do Operador por Job observation - 1 Job x 2 Op</Th>
                                    <Th color={colors.white}>L Level do Operador por Job observation - 1 Job x 2 Op 2</Th>
                                    <Th color={colors.white}>L Level do Operador por Job observation - 1 Op x 2 Job</Th>
                                    <Th color={colors.white}>L Level do Supervisor por Job observation - L ou U</Th>
                                    <Th color={colors.white}>L Level Geral</Th>
                                    <Th color={colors.white}>Check Daily SSD</Th>
                                    <Th color={colors.white} textAlign="center">Ações</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {records.map((rec) => (
                                    <Tr key={rec.id}>
                                        <Td>{decryptData(rec.fy)}</Td>
                                        <Td>{decryptData(rec.coordenador)}</Td>
                                        <Td>{decryptData(rec.supervisor)}</Td>
                                        <Td>{decryptData(rec.shop)}</Td>
                                        <Td>{decryptData(rec.area)}</Td>
                                        <Td>{decryptData(rec.turno)}</Td>
                                        <Td>{decryptData(rec.mes)}</Td>
                                        <Td>{decryptData(rec.status)}</Td>
                                        <Td>{decryptData(rec.level_1)}</Td>
                                        <Td>{decryptData(rec.level_2)}</Td>
                                        <Td>{decryptData(rec.level_3)}</Td>
                                        <Td>{decryptData(rec.level_4)}</Td>
                                        <Td>{decryptData(rec.level_5)}</Td>
                                        <Td>{decryptData(rec["1x2_op1"])}</Td>
                                        <Td>{decryptData(rec["1x2_op2"])}</Td>
                                        <Td>{decryptData(rec["1x2_job"])}</Td>
                                        <Td>{decryptData(rec.sv_level)}</Td>
                                        <Td>{decryptData(rec.level_geral)}</Td>
                                        <Td>{decryptData(rec.check_daily)}</Td>
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
                        {current ? "Editar Registro PHC" : "Novo Registro PHC"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <Input
                                placeholder="FY"
                                value={formData.fy}
                                onChange={(e) => setFormData({ ...formData, fy: e.target.value })}
                            />

                            {/* Coordenador */}
                            <Select
                                placeholder="Selecione um coordenador"
                                value={formData.coordenador}
                                onChange={(e) => setFormData({ ...formData, coordenador: e.target.value })}
                            >
                                {options.coordenadores.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </Select>
                            <Input
                                placeholder="Ou digite outro coordenador"
                                value={formData.coordenador}
                                onChange={(e) => setFormData({ ...formData, coordenador: e.target.value })}
                            />

                            {/* Supervisor */}
                            <Select
                                placeholder="Selecione um supervisor"
                                value={formData.supervisor}
                                onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                            >
                                {options.supervisores.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </Select>
                            <Input
                                placeholder="Ou digite outro supervisor"
                                value={formData.supervisor}
                                onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                            />

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

                            {/* Turno */}
                            <Select
                                placeholder="Selecione o turno"
                                value={formData.turno}
                                onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                            >
                                <option value="1">1</option>
                                <option value="2">2</option>
                            </Select>

                            {/* Mês */}
                            <Select
                                placeholder="Selecione o mês"
                                value={formData.mes}
                                onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
                            >
                                {meses.map((mes) => (
                                    <option key={mes} value={mes}>{mes}</option>
                                ))}
                            </Select>

                            {/* Status */}
                            <Select
                                placeholder="Selecione o status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="OK">OK</option>
                                <option value="NG">NG</option>
                            </Select>
                            <Input
                                placeholder="Level 1 (%)"
                                type="number"
                                value={formData.level_1}
                                onChange={(e) => setFormData({ ...formData, level_1: e.target.value })}
                            />
                            <Input
                                placeholder="Level 2 (%)"
                                type="number"
                                value={formData.level_2}
                                onChange={(e) => setFormData({ ...formData, level_2: e.target.value })}
                            />
                            <Input
                                placeholder="Level 3 (%)"
                                type="number"
                                value={formData.level_3}
                                onChange={(e) => setFormData({ ...formData, level_3: e.target.value })}
                            />
                            <Input
                                placeholder="Level 4 (%)"
                                type="number"
                                value={formData.level_4}
                                onChange={(e) => setFormData({ ...formData, level_4: e.target.value })}
                            />
                            <Input
                                placeholder="Level 5 (%)"
                                type="number"
                                value={formData.level_5}
                                onChange={(e) => setFormData({ ...formData, level_5: e.target.value })}
                            />
                            <Input
                                placeholder="1x2 Op 1 (%)"
                                type="number"
                                value={formData["1x2_op1"]}
                                onChange={(e) => setFormData({ ...formData, '1x2_op1': e.target.value })}
                            />
                            <Input
                                placeholder="1x2 Op 2 (%)"
                                type="number"
                                value={formData["1x2_op2"]}
                                onChange={(e) => setFormData({ ...formData, '1x2_op2': e.target.value })}
                            />
                            <Input
                                placeholder="1x2 Job (%)"
                                type="number"
                                value={formData["1x2_job"]}
                                onChange={(e) => setFormData({ ...formData, '1x2_job': e.target.value })}
                            />
                            <Input
                                placeholder="SV Level (%)"
                                type="number"
                                value={formData.sv_level}
                                onChange={(e) => setFormData({ ...formData, sv_level: e.target.value })}
                            />
                            <Input
                                placeholder="Level Geral (%)"
                                type="number"
                                value={formData.level_geral}
                                onChange={(e) => setFormData({ ...formData, level_geral: e.target.value })}
                            />
                            <Input
                                placeholder="Check Daily (%)"
                                type="number"
                                value={formData.check_daily}
                                onChange={(e) => setFormData({ ...formData, check_daily: e.target.value })}
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
