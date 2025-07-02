"use client";

import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Spinner,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import supabase from "../../utils/supabase";
import { colors } from "../../utils/colors";

interface Treinamento {
  id: number;
  treinamento: string;
  link: string;
}

export default function Treinamentos() {
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchTreinamentos() {
    setLoading(true);
    const { data, error } = await supabase
      .from("treinamentos")
      .select("id, treinamento, link");

    if (!error && data) {
      setTreinamentos(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchTreinamentos();
  }, []);

  if (loading) {
    return (
      <Box p={8} marginLeft={"20vw"}>
        <Spinner size="xl" color={colors.pm} />
      </Box>
    );
  }

  return (
    <Box p={8} bg={colors.white} minH="100vh" marginLeft={"20vw"}>
      <Heading size="lg" color={colors.pm} mb={6}>
        Treinamentos Disponíveis
      </Heading>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
        {treinamentos.map((treino) => (
          <Box
            key={treino.id}
            borderRadius="lg"
            boxShadow="md"
            p={6}
            bg={colors.scs}
            _hover={{ boxShadow: "lg", transform: "scale(1.02)" }}
            transition="all 0.2s ease-in-out"
          >
            <Text fontWeight="bold" fontSize="lg" color={colors.black}>
              {treino.treinamento}
            </Text>
            <ChakraLink
              href={treino.link}
              target="_blank"
              rel="noopener noreferrer"
              mt={2}
              display="inline-block"
              fontSize="sm"
              color={colors.black}
              _hover={{ textDecoration: "underline" }}
            >
              Clique para abrir o treinamento
            </ChakraLink>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
