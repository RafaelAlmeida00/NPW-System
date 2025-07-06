// routes.tsx
import { createBrowserRouter } from "react-router";
import Root from "./pages/Root.tsx";
import Auth from "./pages/Auth.tsx";
import System from "./pages/System.tsx";
import Treinamentos from "./pages/system/Treinamentos.tsx";
import Turmas from "./pages/system/Turmas.tsx";
import TreinamentosAdmin from "./pages/admin/Treinamentos.tsx";
import TurmasAdmin from "./pages/admin/Turmas.tsx";
import RegistroPresencaPage from "./pages/admin/Presenca.tsx";
import AcessosRapidos from "./pages/system/Acessos.tsx";
import DatabasePHC from "./pages/admin/Databasephc.tsx";
import IchigenList from "./pages/admin/IchigenList.tsx";
import DashboardPHC from "./pages/system/Dashboardphc.tsx";
import DashboardSSD from "./pages/system/Dashboardssd.tsx";
import UsersAdmin from "./pages/admin/Users.tsx";
import HKAdmin from "./pages/admin/HKAdmin.tsx";
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Auth },
      {
        path: "system",
        Component: System,
        children: [
          { path: "treinamentos", Component: Treinamentos },
          { path: "turmas", Component: Turmas },
          { path: "acessos", Component: AcessosRapidos },
          { path: "phc/database", Component: DatabasePHC },
          { path: "phc/ichigenlist", Component: IchigenList },
          { path: "phc/dashboard", Component: DashboardPHC },
          { path: "ssd/dashboard", Component: DashboardSSD },
          {
            path: "admin",
            Component: System,
            children: [
              { path: "treinamentos", Component: TreinamentosAdmin },
              { path: "turmas", Component: TurmasAdmin },
              { path: "users", Component: UsersAdmin },
              { path: "hk", Component: HKAdmin },
              { path: "presenca/:id", Component: RegistroPresencaPage }, // 👈 SEPARADO AQUI
            ],
          },
        ],
      },
    ],
  },
]);


export default router;


/* {
 path: "auth",
 Component: AuthLayout,
 children: [
   { path: "login", Component: Login },
   { path: "register", Component: Register },
 ],
}, 
{
 path: "concerts",
 children: [
   { index: true, Component: ConcertsHome },
   { path: ":city", Component: ConcertsCity },
   { path: "trending", Component: ConcertsTrending },
 ],
},*/