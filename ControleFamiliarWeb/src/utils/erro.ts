type ErroHttp = {
  response?: {
    status?: number;
    data?: { message?: string };
  };
};

export function mensagemDeErro(erro: unknown): string {
  const e = erro as ErroHttp;

  // Caso normal: a API responde com { success, data, message } e a message já
  // é escrita para o usuário final.
  const mensagem = e?.response?.data?.message;
  if (mensagem) return mensagem;

  // O rate limiter da API responde 429 sem corpo (só RejectionStatusCode),
  // então não existe message para mostrar. Sem este caso, a causa mais fácil
  // de resolver — esperar um minuto — aparecia como um erro genérico.
  if (e?.response?.status === 429)
    return "Muitas tentativas em pouco tempo. Aguarde um minuto e tente de novo.";

  // Sem response nenhum: a requisição não chegou a ser respondida (queda de
  // rede, CORS, API fora do ar). É diferente de "seus dados estão errados", e
  // dizer isso evita o usuário ficar repetindo uma tentativa que não tem como
  // dar certo.
  if (!e?.response)
    return "Não foi possível falar com o servidor. Verifique sua conexão e tente de novo.";

  return "Não foi possível concluir a ação.";
}
