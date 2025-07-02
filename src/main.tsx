// main.tsx ou index.tsx
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { RouterProvider } from "react-router";
import router from "./routes.tsx"; // ajuste conforme seu path
import "./index.css"
import { Provider } from "./components/ui/provider.tsx";

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <StrictMode>
      <Provider > {/* ✅ Import correto aqui */}
        <RouterProvider router={router} />
      </Provider>
  </StrictMode>
);
