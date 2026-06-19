# Regras do repositório MDH 3D

- Nunca tratar placeholder como foto real.
- Nunca declarar tarefa concluída sem lint, typecheck, build, validate:assets e test:images.
- Nunca expor SKU BLOCKED, placeholder ou needs_review no catálogo público.
- Sempre trabalhar a partir do working tree atual.
- Sempre listar arquivos alterados, testes rodados, commit e push.
- Se houver conflito entre estética e honestidade, escolher honestidade.
- Para execuções do marketplace MDH 3D nível Apple/ML/AliExpress/Shopee, seguir `docs/CODEX_EXECUTION_PROTOCOL.md`: executar a Fase 0 antes das demais, manter `RELATORIO-EXECUCAO-MARKETPLACE.md` incremental e nunca marcar fase como 100% sem evidência objetiva em código, comandos e validação local/produção.
