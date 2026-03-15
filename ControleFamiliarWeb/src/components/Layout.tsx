import { Link, Outlet } from "react-router-dom";

export default function Layout() {

  return (

    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Menu lateral */}
      <aside
        style={{
          width: "220px",
          background: "#1e293b",
          color: "white",
          padding: "20px"
        }}
      >

        <h2>Financeiro</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

          <Link to="/" style={{ color: "white" }}>Home</Link>

          <Link to="/pessoas" style={{ color: "white" }}>Pessoas</Link>

          <Link to="/categorias" style={{ color: "white" }}>Categorias</Link>

          <Link to="/transacoes" style={{ color: "white" }}>Transações</Link>

          <Link to="/relatorios" style={{ color: "white" }}>Relatórios</Link>

        </nav>

      </aside>

      {/* Conteúdo */}
      <main style={{ flex: 1, padding: "30px" }}>

        <Outlet />

      </main>

    </div>

  );

}