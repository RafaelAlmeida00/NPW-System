import { createContext, useContext, useEffect, useState } from "react";
import supabase from "./supabase";
import { useLocation, useNavigate } from "react-router";

const AuthContext = createContext({});

export function AuthProvider({ children }: any) {
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Função de verificação
    async function verifyUser() {
        const userData = localStorage.getItem("custom_user");
        if (!userData) {
            setUser(null);
            navigate("/");
            return;
        }

        try {
            const dataUser = JSON.parse(userData);
            console.log(dataUser);

            const { data, error } = await supabase
                .from("users") // ou o nome real da sua tabela
                .select("*")
                .eq("email", dataUser.email)
                .single(); // retorna só 1 resultado

            if (error || !data) {
                console.warn("Usuário não encontrado ou erro na verificação.");
                localStorage.removeItem("custom_user");
                setUser(null);
                navigate("/");
            } else {
                if (location.pathname.startsWith("/system")) {
                    setUser(data);
                } else {
                    setUser(data);
                    navigate("/system");
                }

            }
        } catch (err) {
            console.error("Erro ao verificar usuário:", err);
            localStorage.removeItem("custom_user");
            setUser(null);
            navigate("/");
        }
    }


    // Verifica ao carregar e a cada mudança de rota
    useEffect(() => {
        verifyUser();
    }, [location.pathname]);

    // Revalida a cada 1 hora
    useEffect(() => {
        const interval = setInterval(() => {
            verifyUser();
        }, 60 * 60 * 1000); // 1 hora

        return () => clearInterval(interval);
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook para usar auth
export function useAuth() {
    return useContext(AuthContext);
}
