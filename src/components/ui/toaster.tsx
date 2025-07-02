import { createStandaloneToast } from "@chakra-ui/react";

const { toast } = createStandaloneToast();

export const toaster = {
  success: (title: string, description?: string) =>
    toast({
      title,
      description,
      status: "success",
      duration: 4000,
      isClosable: true,
      position: "bottom-right",
    }),

  error: (title: string, description?: string) =>
    toast({
      title,
      description,
      status: "error",
      duration: 4000,
      isClosable: true,
      position: "bottom-right",
    }),

  warning: (title: string, description?: string) =>
    toast({
      title,
      description,
      status: "warning",
      duration: 4000,
      isClosable: true,
      position: "bottom-right",
    }),

  info: (title: string, description?: string) =>
    toast({
      title,
      description,
      status: "info",
      duration: 4000,
      isClosable: true,
      position: "bottom-right",
    }),

  loading: (title: string, description?: string) =>
    toast({
      title,
      description,
      status: "loading", // Chakra trata como info se não houver status real
      duration: null, // permanece até ser fechado
      isClosable: true,
      position: "bottom-right",
    }),
};
