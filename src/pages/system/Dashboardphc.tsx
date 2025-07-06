import { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Heading,
    Text,
    Card,
    CardBody,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from "@chakra-ui/react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { decryptData } from "../../utils/cripto";
import supabase from "../../utils/supabase";
import { colors } from "../../utils/colors";

const DashboardPHC = () => {
    const [phcData, setPhcData] = useState([]);
    const [ichigenData, setIchigenData] = useState([]);
    const [filteredShop, setFilteredShop] = useState("");
    const [filteredArea, setFilteredArea] = useState("");

    useEffect(() => {
        fetchPHC();
        fetchIchigen();
    }, []);

    const fetchPHC = async () => {
        const { data }: any = await supabase.from("phc").select("*");
        const decrypted = data.map((item: any) =>
            Object.fromEntries(
                Object.entries(item).map(([key, value]) => [key, decryptData(String(value))])
            )
        );
        setPhcData(decrypted);
    };

    const fetchIchigen = async () => {
        const { data }: any = await supabase.from("ichigenlist").select("*");
        const decrypted = data.map((item: any) =>
            Object.fromEntries(
                Object.entries(item).map(([key, value]) => [key, decryptData(String(value))])
            )
        );
        setIchigenData(decrypted);
    };

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

    const applyFilters = (data: any) => {
        return data.filter(
            (item: any) =>
                (filteredShop ? item.shop === filteredShop : true) &&
                (filteredArea ? item.area === filteredArea : true)
        );
    };

    const averageByMonth = (data: any, key: any) => {
        const grouped: any = {};
        const counts: any = {};
        data.forEach((item: any) => {
            const mes: any = item.mes;
            if (!grouped[mes]) {
                grouped[mes] = 0;
                counts[mes] = 0;
            }
            grouped[mes] += parseFloat(item[key] || 0);
            counts[mes]++;
        });
        return Object.entries(grouped).map(([mes, total]: any) => ({ mes, total: total / counts[mes] }));
    };

    const averageByMonthDate = (data: any, dateKey: any, statusKey: any = "status") => {
        const grouped: any = {};
        const counts: any = {};
        data.forEach((item: any) => {
            const date = new Date(item[dateKey]);
            const mes = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            if (!grouped[mes]) {
                grouped[mes] = 0;
                counts[mes] = 0;
            }
            if (item[statusKey] === "Aberto") {
                grouped[mes]++;
            }
            counts[mes]++;
        });
        return Object.entries(grouped).map(([mes, total]: any) => ({ mes, total: (total / counts[mes]) * 100 }));
    };

    const percentageByField = (data: any, field: any, statusKey: any = "status") => {
        const grouped: any = {};
        const counts: any = {};
        data.forEach((item: any) => {
            const key = item[field];
            if (!grouped[key]) {
                grouped[key] = 0;
                counts[key] = 0;
            }
            if (item[statusKey] === "Aberto") {
                grouped[key]++;
            }
            counts[key]++;
        });
        return Object.entries(grouped).map(([key, total]: any) => ({ mes: key, total: (total / counts[key]) * 100 }));
    };

    const ichigenStatusCounts = () => {
        let aberto = 0;
        let fechado = 0;
        ichigenData.forEach((item: any) => {
            if (item.status === "Aberto") aberto++;
            if (item.status === "Fechado") fechado++;
        });
        return { aberto, fechado, total: aberto + fechado };
    };

    const statusCounts = ichigenStatusCounts();

    const filteredPhcData = applyFilters(phcData);
    const filteredIchigenData = applyFilters(ichigenData);

    const uniqueShops = Array.from(new Set([...phcData, ...ichigenData].map((item: any) => item.shop)));
    const uniqueAreas = Array.from(new Set([...phcData, ...ichigenData].map((item: any) => item.area)));

    return (
        <Box p={8} bg={colors.white} minH="100vh" marginLeft={"20vw"}>
            <Heading size="lg" color={colors.pm} mb={6}>
                Dashboard PHC
            </Heading>

            <Box mb={6} display="flex" gap={4}>
                <Select placeholder="Filtrar por Shop" value={filteredShop} onChange={(e) => setFilteredShop(e.target.value)}>
                    {uniqueShops.map((shop) => (
                        <option key={shop} value={shop}>{shop}</option>
                    ))}
                </Select>
                <Select placeholder="Filtrar por Área" value={filteredArea} onChange={(e) => setFilteredArea(e.target.value)}>
                    {uniqueAreas.map((area) => (
                        <option key={area} value={area}>{area}</option>
                    ))}
                </Select>
            </Box>

            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                <Card><CardBody><Text>% L Level SV - "I" ou "L"</Text><ResponsiveContainer width="100%" height={200}><BarChart data={averageByMonth(filteredPhcData, "sv_level")}><XAxis dataKey="mes" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#3182CE" /></BarChart></ResponsiveContainer></CardBody></Card>
                <Card><CardBody><Text>Level Geral</Text><ResponsiveContainer width="100%" height={200}><BarChart data={averageByMonth(filteredPhcData, "level_geral")}><XAxis dataKey="mes" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#8884d8" /></BarChart></ResponsiveContainer></CardBody></Card>
                <Card><CardBody><Text>Check Daily</Text><ResponsiveContainer width="100%" height={200}><BarChart data={averageByMonth(filteredPhcData, "check_daily")}><XAxis dataKey="mes" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#82ca9d" /></BarChart></ResponsiveContainer></CardBody></Card>
                <Card><CardBody><Text>% L Level 1x2 Operador</Text><ResponsiveContainer width="100%" height={200}><BarChart data={averageByMonth(filteredPhcData, "1x2_op1")}><XAxis dataKey="mes" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#FF8042" /></BarChart></ResponsiveContainer></CardBody></Card>
                <Card><CardBody><Text>% L Level 1x2 Operador 2</Text><ResponsiveContainer width="100%" height={200}><BarChart data={averageByMonth(filteredPhcData, "1x2_op2")}><XAxis dataKey="mes" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#FFBB28" /></BarChart></ResponsiveContainer></CardBody></Card>
                <Card><CardBody><Text>% Level 1x2 Posto</Text><ResponsiveContainer width="100%" height={200}><BarChart data={averageByMonth(filteredPhcData, "1x2_job")}><XAxis dataKey="mes" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#00C49F" /></BarChart></ResponsiveContainer></CardBody></Card>
            </Grid>

            <Heading my={8}>Seção Ichigen List</Heading>
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                <Card><CardBody><Text>Status Aberto</Text><Heading>{statusCounts.aberto}</Heading></CardBody></Card>
                <Card><CardBody><Text>Status Fechado</Text><Heading>{statusCounts.fechado}</Heading></CardBody></Card>
                <Card><CardBody><Text>Total</Text><Heading>{statusCounts.total}</Heading></CardBody></Card>
                <Card><CardBody><Text>% Abertos por Mês</Text><ResponsiveContainer width="100%" height={200}><BarChart data={averageByMonthDate(filteredIchigenData, "abertura")}><XAxis dataKey="mes" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#0088FE" /></BarChart></ResponsiveContainer></CardBody></Card>
                <Card>
                    <CardBody>
                        <Text>% por Shop</Text>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={percentageByField(filteredIchigenData, "shop")}>
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total">
                                    {percentageByField(filteredIchigenData, "shop").map((_, index: any) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Text>% por Área</Text>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={percentageByField(filteredIchigenData, "area")}>
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total">
                                    {percentageByField(filteredIchigenData, "area").map((_, index: any) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>

            </Grid>

            <Heading my={8}>Tabela de Itens Filtrados</Heading>
            <Table variant="simple">
                <Thead>
                    <Tr bg={colors.sc}>
                        <Th color={colors.white}>Shop</Th>
                        <Th color={colors.white}>Área</Th>
                        <Th color={colors.white}>Confirmação</Th>
                        <Th color={colors.white}>Observação</Th>
                        <Th color={colors.white}>Ação</Th>
                        <Th color={colors.white}>Responsável</Th>
                        <Th color={colors.white}>Abertura</Th>
                        <Th color={colors.white}>Status</Th>
                    </Tr>
                </Thead>
                <Tbody >
                    {filteredIchigenData.map((item: any, idx: number) => (
                        <Tr key={idx}>
                            <Td>{item.shop}</Td>
                            <Td>{item.area}</Td>
                            <Td>{item.confirmacao}</Td>
                            <Td>{item.observacao}</Td>
                            <Td>{item.acao}</Td>
                            <Td>{item.responsavel}</Td>
                            <Td>{item.abertura}</Td>
                            <Td><Card padding={3} textAlign={"center"} borderRadius={10} bg={item.status == "Aberto" ? "red.300" : "green.300"} fontWeight={"bold"}>{item.status}</Card></Td>

                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
};

export default DashboardPHC;