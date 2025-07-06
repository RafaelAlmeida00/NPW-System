import {
    Box,
    Button,
    Flex,
    Heading,
    Input,
    Link,
    Stack,
    Text,
    Container,
    AlertIcon,
    AlertTitle,
    AlertDescription
} from "@chakra-ui/react";
import { colors } from "../utils/colors";
import supabase from "../utils/supabase";
import { useState } from "react";
import { Alert } from "@chakra-ui/react"
import { encryptData } from "../utils/cripto";
import { decryptData } from "../utils/cripto";

export default function LoginPage() {
    const [isLogin, setLogin] = useState(false);
    const [dataUser, setData] = useState<any>({});
    const [alert, setAlert] = useState("");
    const [status, setStatus] = useState<any>("");

    async function sign() {
        const encryptedPayload = {
            name: encryptData(dataUser.name),
            matricula: encryptData(dataUser.matricula),
            email: dataUser.email,
            senha: encryptData(dataUser.password),
        }

        const { data, error } = await supabase.from('users').insert(encryptedPayload);

        console.log(encryptedPayload);
        console.log(dataUser);


        if (error) {
            handleError(error.message);

            return;
        }

        console.log(data);

        handleSuccess("Usuário cadastrado com sucesso");

        handlerLogin();
        await login();
    }

    async function login() {

        const { data, error } = await supabase.from('users')
            .select('*')
            .eq('email', dataUser.email);

        if (error) {
            handleError(error.message);
            return;
        }

        if (!data || data.length === 0) {
            handleError("Usuário não encontrado");
            return;
        }

        const decryptedPassword = decryptData(data[0].senha);
        console.log(data);
        console.log(data[0].senha);
        console.log(decryptedPassword);

        if (decryptedPassword !== dataUser.password) {
            handleError("Senha ou email incorretos");
            return;
        }

        if (!data[0].active) {
            handleError("Usuário inativo no sistema");
            return;
        }

        // Usuário autenticado com sucesso
        handleSuccess("Logado com sucesso");

        const user = {
            ...data[0],
            name: decryptData(data[0].name),
            matricula: decryptData(data[0].matricula),
        };

        localStorage.setItem("custom_user", encryptData(JSON.stringify(user)));
        window.location.reload();
    }

    // Funções auxiliares para reduzir repetição
    function handleError(message: string) {
        setStatus("error");
        setAlert(message);
        setTimeout(() => {
            setStatus("");
            setAlert("");
        }, 4000);
    }

    function handleSuccess(message: string) {
        setStatus("success");
        setAlert(message);
        setTimeout(() => {
            setStatus("");
            setAlert("");
        }, 4000);
    }


    const handlerLogin = () => {
        setLogin(!isLogin)
    }

    return (
        <Flex minH="100vh" align="center" justify="center" bg="gray.200">
            <Box
                rounded="md"
                bg="white"
                boxShadow="lg"
                p={8}
                maxW="md"
                w="full"
            >
                <Stack >
                    <Box textAlign="center" marginBottom={5}>
                        {!isLogin ? <Heading size="lg" color={colors.pm}>
                            Faça login na sua conta
                        </Heading> : <Heading size="lg" color={colors.pm}>
                            Cadastre sua conta
                        </Heading>}
                    </Box>
                    <Stack >
                        {isLogin ? (
                            <><Box id="name" marginBottom={5}>
                                <Container>Nome</Container>
                                <Input type="text" color={colors.black} onChange={(e) => setData((prev: any) => ({ ...prev, name: e.target.value }))} />
                            </Box>
                                <Box id="matricula" marginBottom={5}>
                                    <Container>Matrícula</Container>
                                    <Input type="text" color={colors.black} onChange={(e) => setData((prev: any) => ({ ...prev, matricula: e.target.value }))} />
                                </Box> </>) : <></>}
                        <Box id="email" marginBottom={5}>
                            <Container>Email</Container>
                            <Input type="email" color={colors.black} onChange={(e) => {
                                function toLowerCase(str: string): string {
                                    return str.toLowerCase();
                                }
                                setData((prev: any) => ({ ...prev, email: toLowerCase(e.target.value) }))
                            }} />
                        </Box>
                        <Box id="password" marginBottom={5}>
                            <Container>Senha</Container>
                            <Input type="password" color={colors.black} onChange={(e) => setData((prev: any) => ({ ...prev, password: e.target.value }))} />
                        </Box>

                        {alert && <Alert status={status}>
                            <AlertIcon />
                            <AlertTitle>Mensagem</AlertTitle>
                            <AlertDescription>{alert}</AlertDescription>
                        </Alert>}

                        {!isLogin ? (<Button
                            type="submit"
                            bg={colors.pm}
                            color="white"
                            _hover={{ bg: colors.pm }}
                            onClick={login}
                        >
                            Entrar
                        </Button>) : (<Button
                            type="submit"
                            bg={colors.pm}
                            color="white"
                            _hover={{ bg: colors.pm }}
                            onClick={sign}
                        >
                            Cadastrar
                        </Button>)}
                        <Stack
                            direction={{ base: "column", sm: "row" }}
                            justify="space-between"
                            fontSize="sm"
                            marginTop={2}
                        >
                            {!isLogin ? <Text>
                                Não tem uma conta?{" "}
                                <Link color={colors.pm} onClick={handlerLogin}>Cadastre-se</Link>
                            </Text> :
                                <Text>
                                    Já tem uma conta?{" "}
                                    <Link color={colors.pm} onClick={handlerLogin}>Entre</Link>
                                </Text>}
                        </Stack>
                    </Stack>
                </Stack>
            </Box>
        </Flex>
    );
}
