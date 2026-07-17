import { useAuth } from "../context/AuthContext";

export default function MinhaFamilia() {
  const { usuario, familia } = useAuth();

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Minha Família</h1>
          <p className="page-subtitle">
            Compartilhe o código abaixo para outras pessoas entrarem e verem os mesmos dados.
          </p>
        </div>
      </div>

      <div className="card">
        <p className="summary-label">Família</p>
        <h2 style={{ marginTop: 0 }}>{familia?.nome}</h2>

        <p className="summary-label">Código de convite</p>
        <span className="invite-code">{familia?.codigoConvite}</span>
      </div>

      <div className="card">
        <h2 className="section-title">Membros</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
              </tr>
            </thead>
            <tbody>
              {familia?.membros.map((membro) => (
                <tr key={membro}>
                  <td>
                    {membro}
                    {membro === usuario?.nome && " (você)"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
