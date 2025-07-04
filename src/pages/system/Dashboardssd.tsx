import { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Heading,
    Text,
    Card,
    CardBody,
    Select,
} from "@chakra-ui/react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { decryptData } from "../../utils/cripto";
import supabase from "../../utils/supabase";
import { colors } from "../../utils/colors";

const DashboardSSD = () => {
    const [phcData, setPhcData] = useState([]);
    const [filteredShop, setFilteredShop] = useState("");
    const [filteredArea, setFilteredArea] = useState("");

    useEffect(() => {
        fetchPHC();
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

    const averageByShop = (data: any, key: any) => {
        const grouped: any = {};
        const counts: any = {};
        data.forEach((item: any) => {
            const shop: any = item.shop;
            if (!grouped[shop]) {
                grouped[shop] = 0;
                counts[shop] = 0;
            }
            grouped[shop] += parseFloat(item[key] || 0);
            counts[shop]++;
        });
        return Object.entries(grouped).map(([shop, total]: any) => ({ shop, total: total / counts[shop] }));
    };




    const filteredPhcData = applyFilters(phcData);
    const uniqueShops = Array.from(new Set([...phcData].map((item: any) => item.shop)));
    const uniqueAreas = Array.from(new Set([...phcData].map((item: any) => item.area)));

    return (
        <Box p={8} bg={colors.white} minH="100vh" marginLeft={"20vw"}>
            <Heading size="lg" color={colors.pm} mb={6}>
                Dashboard SSD
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
            <Heading my={8}>Level por Mês - Plant</Heading>

            <Grid templateColumns="repeat(3, 1fr)" gap={6}>

                <Card><CardBody><Text>% Level 1 - SSD</Text><ResponsiveContainer width="100%" height={200}><BarChart data={averageByMonth(filteredPhcData, "level_1")}><XAxis dataKey="mes" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#3182CE" /></BarChart></ResponsiveContainer></CardBody></Card>
                <Card><CardBody><Text>% Level 2 - SSD</Text><ResponsiveContainer width="100%" height={200}><BarChart data={averageByMonth(filteredPhcData, "level_2")}><XAxis dataKey="mes" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#8884d8" /></BarChart></ResponsiveContainer></CardBody></Card>
                <Card><CardBody><Text>% Level 3 - SSD</Text><ResponsiveContainer width="100%" height={200}><BarChart data={averageByMonth(filteredPhcData, "level_3")}><XAxis dataKey="mes" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#82ca9d" /></BarChart></ResponsiveContainer></CardBody></Card>
                <Card><CardBody><Text>% Level 4 - SSD</Text><ResponsiveContainer width="100%" height={200}><BarChart data={averageByMonth(filteredPhcData, "level_4")}><XAxis dataKey="mes" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#FF8042" /></BarChart></ResponsiveContainer></CardBody></Card>
                <Card><CardBody><Text>% Level 5 - SSD</Text><ResponsiveContainer width="100%" height={200}><BarChart data={averageByMonth(filteredPhcData, "level_5")}><XAxis dataKey="mes" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#FFBB28" /></BarChart></ResponsiveContainer></CardBody></Card>



            </Grid>
            {/* % por shop*/}
            <Heading my={8}>Level por Shop - Plant</Heading>

            <Grid templateColumns="repeat(3, 1fr)" gap={6}>

                <Card><CardBody><Text>% Level 1 - SSD</Text><ResponsiveContainer width="100%" height={200}><BarChart data={averageByShop(filteredPhcData, "level_1")}><XAxis dataKey="shop" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#3182CE" /></BarChart></ResponsiveContainer></CardBody></Card>
                <Card><CardBody><Text>% Level 2 - SSD</Text><ResponsiveContainer width="100%" height={200}><BarChart data={averageByShop(filteredPhcData, "level_2")}><XAxis dataKey="shop" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#8884d8" /></BarChart></ResponsiveContainer></CardBody></Card>
                <Card><CardBody><Text>% Level 3 - SSD</Text><ResponsiveContainer width="100%" height={200}><BarChart data={averageByShop(filteredPhcData, "level_3")}><XAxis dataKey="shop" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#82ca9d" /></BarChart></ResponsiveContainer></CardBody></Card>
                <Card><CardBody><Text>% Level 4 - SSD</Text><ResponsiveContainer width="100%" height={200}><BarChart data={averageByShop(filteredPhcData, "level_4")}><XAxis dataKey="shop" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#FF8042" /></BarChart></ResponsiveContainer></CardBody></Card>
                <Card><CardBody><Text>% Level 5 - SSD</Text><ResponsiveContainer width="100%" height={200}><BarChart data={averageByShop(filteredPhcData, "level_5")}><XAxis dataKey="shop" /><YAxis /><Tooltip /><Bar dataKey="total" fill="#FFBB28" /></BarChart></ResponsiveContainer></CardBody></Card>
            </Grid>
        </Box>
    );  
};

export default DashboardSSD;