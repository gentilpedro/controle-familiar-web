export function mensagemDeErro(erro: unknown): string {
  const resposta = (erro as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return resposta ?? "Não foi possível concluir a ação.";
}
