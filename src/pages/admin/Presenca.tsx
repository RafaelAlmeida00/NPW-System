'use client';

import {
    Box,
    Heading,
    Text,
    Button,
    Spinner,
    useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../../utils/authprovider';
import supabase from '../../utils/supabase';
import { colors } from '../../utils/colors';

interface Turma {
    id: number;
    treinamento_id: number;
    data: string;
    turno: 'Manhã' | 'Tarde' | 'Noite';
    status: 'Aberta' | 'Fechada';
}

interface Treinamento {
    id: number;
    treinamento: string;
}

export default function RegistroPresencaPage() {
    const { user }: any = useAuth();
    const router = useNavigate();
    const toast = useToast();
    const { id: turmaId } = useParams<{ id: string }>();

    const [turma, setTurma] = useState<Turma | null>(null);
    const [treinamento, setTreinamento] = useState<Treinamento | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        console.log(`Turma ID: ${turmaId}`);

        if (!turmaId) return;

        const fetchDados = async () => {
            setLoading(true);
            try {
                const { data: turmaData, error: turmaError } = await supabase
                    .from('turmas')
                    .select('id, treinamento_id, data, turno, status')
                    .eq('id', turmaId)
                    .single();

                if (turmaError || !turmaData) throw turmaError;

                setTurma(turmaData);

                const { data: treinamentoData, error: treinamentoError } =
                    await supabase
                        .from('treinamentos')
                        .select('id, treinamento')
                        .eq('id', turmaData.treinamento_id)
                        .single();

                if (treinamentoError) throw treinamentoError;

                setTreinamento(treinamentoData);
            } catch (err) {
                toast({
                    title: 'Erro ao carregar dados da turma',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDados();
    }, [turmaId]);

    const registrarPresenca = async () => {
        if (!user?.id || !turmaId) return;

        setSubmitting(true);

        try {
            // Verifica se já registrou presença
            const { data: existing, error: findError } = await supabase
                .from('presenca')
                .select('*')
                .eq('turmaid', turmaId)
                .eq('userid', user.id)
                .single();

            if (findError && findError.code !== 'PGRST116') throw findError;

            if (existing) {
                toast({
                    title: 'Presença já registrada!',
                    status: 'info',
                    duration: 3000,
                    isClosable: true,
                });
                router('/system');
                return;
            }

            const { error: insertError } = await supabase.from('presenca').insert([
                {
                    turmaid: parseInt(turmaId),
                    userid: user.id,
                    data: new Date().toISOString(),
                },
            ]);

            if (insertError) throw insertError;

            toast({
                title: 'Presença registrada com sucesso!',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            router('/system');
        } catch (error) {
            toast({
                title: 'Erro ao registrar presença',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box p={8} ml="20vw">
                <Spinner size="xl" />
            </Box>
        );
    }

    return (
        <Box p={8} bg={colors.white} minH="100vh" ml="20vw">
            <Heading size="lg" color={colors.pm} mb={4}>
                Registro de Presença
            </Heading>

            <Text fontSize="lg" mb={2}>
                <strong>Treinamento:</strong> {treinamento?.treinamento}
            </Text>
            <Text fontSize="lg" mb={2}>
                <strong>Data:</strong>{' '}
                {new Date(turma?.data || '').toLocaleDateString('pt-BR')}
            </Text>
            <Text fontSize="lg" mb={6}>
                <strong>Turno:</strong> {turma?.turno}
            </Text>

            <Button
                colorScheme="green"
                size="lg"
                onClick={registrarPresenca}
                isLoading={submitting}
            >
                Confirmar Presença
            </Button>
        </Box>
    );
}
