import { Link } from "react-router-dom";

export default function Privacidade() {
  return (
    <div className="page" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Política de Privacidade</h1>
          <p className="page-subtitle">Última atualização: julho de 2026.</p>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Quem trata os seus dados</h2>
        <p className="page-subtitle">
          O Controle Financeiro é operado por Pedro Gentil. Somos o controlador dos dados pessoais
          tratados nesta plataforma, nos termos da Lei nº 13.709/2018 (LGPD).
        </p>
      </div>

      <div className="card">
        <h2 className="section-title">Quais dados coletamos</h2>
        <p className="page-subtitle">
          <b>Da sua conta:</b> nome, e-mail e senha (armazenada apenas como hash — nunca em texto plano).
        </p>
        <p className="page-subtitle">
          <b>Da sua família:</b> nome das pessoas cadastradas (podem incluir dependentes menores de idade)
          e a idade de cada uma, usada para aplicar as regras de negócio do sistema (por exemplo, menores de
          18 anos só podem ter despesas registradas em nome deles).
        </p>
        <p className="page-subtitle">
          <b>Dados financeiros:</b> descrição, valor, tipo e categoria das transações que você e os membros
          da sua família registram.
        </p>
        <p className="page-subtitle">
          Não coletamos CPF, telefone, endereço ou dados de geolocalização.
        </p>
      </div>

      <div className="card">
        <h2 className="section-title">Por que tratamos esses dados</h2>
        <p className="page-subtitle">
          Usamos seus dados para viabilizar o cadastro, a autenticação e o funcionamento do controle
          financeiro familiar — com base na execução do contrato de uso do serviço (art. 7º, V, da LGPD).
        </p>
        <p className="page-subtitle">
          Quando você convida alguém por e-mail para entrar na sua família, enviamos uma mensagem a essa
          pessoa com base em nosso legítimo interesse em viabilizar esse recurso (art. 7º, IX) — a mensagem
          deixa claro quem convidou e que pode ser ignorada sem nenhuma conta ser criada.
        </p>
      </div>

      <div className="card">
        <h2 className="section-title">Com quem compartilhamos</h2>
        <p className="page-subtitle">
          Usamos um provedor de e-mail transacional para enviar confirmações de cadastro e convites de
          família. Não compartilhamos seus dados com serviços de publicidade, analytics ou redes sociais —
          esta aplicação não usa nenhuma ferramenta desse tipo.
        </p>
      </div>

      <div className="card">
        <h2 className="section-title">Seus direitos</h2>
        <p className="page-subtitle">
          Você pode, a qualquer momento, na tela <b>Meus Dados</b>:
        </p>
        <ul className="page-subtitle" style={{ paddingLeft: 20 }}>
          <li>Acessar e corrigir seu nome e e-mail;</li>
          <li>Baixar uma cópia de todos os dados que tratamos em seu nome (portabilidade);</li>
          <li>Excluir definitivamente sua conta.</li>
        </ul>
        <p className="page-subtitle">
          Se você é o único membro da sua família, excluir a conta remove também as pessoas, categorias e
          transações associadas — não sobra nenhum dado órfão. Se a família é compartilhada, apenas a sua
          conta é removida; os dados continuam disponíveis para os demais membros.
        </p>
      </div>

      <div className="card">
        <h2 className="section-title">Retenção</h2>
        <p className="page-subtitle">
          Mantemos seus dados enquanto sua conta estiver ativa. Ao excluí-la, os dados pessoais são apagados
          de forma definitiva e irreversível, conforme descrito acima.
        </p>
      </div>

      <div className="card">
        <h2 className="section-title">Contato</h2>
        <p className="page-subtitle">
          Dúvidas sobre esta política ou sobre o tratamento dos seus dados podem ser enviadas para o e-mail
          de contato informado no cadastro do responsável pela aplicação.
        </p>
      </div>

      <p className="page-subtitle">
        <Link to="/login">Voltar para o login</Link>
      </p>
    </div>
  );
}
