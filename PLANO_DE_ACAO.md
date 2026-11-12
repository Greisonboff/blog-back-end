# Plano de ação e melhorias: gBlog Backend

Levantamento feito a partir da leitura do código em 10/11/2026. Os itens estão agrupados por prioridade. Cada um aponta o arquivo, o problema e a correção sugerida.

---

## Fase 1: Segurança crítica (fazer primeiro)

### 1.1 Qualquer pessoa pode apagar qualquer usuário
- **Arquivo:** `routes/person/delete/index.js`
- **Problema:** `DELETE /person/:id` não tem `authMiddleware` nem verificação de dono. Uma requisição anônima apaga qualquer conta.
- **Correção:** exigir `authMiddleware` e permitir apagar só a própria conta (`req.user.id`) ou um admin (`ADMIN_ID`). Ao apagar, remover também a imagem no Cloudinary e decidir o que fazer com os posts do usuário.

### 1.2 Hash de senha e e-mail vazam no feed público
- **Arquivo:** `routes/post/getAllPosts/index.js`
- **Problema:** `.populate("comments.user")` traz o documento `Person` inteiro, incluindo `password` (hash bcrypt) e `email`, para todo autor de comentário. O `GET /post` é público.
- **Correção:** `.populate("comments.user", "name img avatarColar")`. Também adicionar `select: false` no campo `password` do model `Person` como proteção extra.

### 1.3 Qualquer usuário logado edita qualquer post
- **Arquivo:** `routes/post/updatePost/index.js`
- **Problema:** `PATCH /post/:id` não confere se `post.user === req.user.id`.
- **Correção:** buscar o post, retornar 404 se não existir e 403 se não for o dono, igual ao `deletePost`.

### 1.4 Qualquer usuário logado apaga qualquer comentário
- **Arquivo:** `routes/post/comment/commentPostDelete/index.js`
- **Problema:** o `$pull` não filtra pelo autor do comentário.
- **Correção:** usar `$pull: { comments: { _id: commentId, user: req.user.id } }` e retornar 404 quando nada for removido. Opcional: permitir que o dono do post também apague.

### 1.5 Lista pública de todos os e-mails
- **Arquivo:** `routes/person/getAll/index.js`
- **Problema:** `GET /person` não exige login e retorna `email` de todos os usuários.
- **Correção:** remover a rota, ou protegê-la (admin) e tirar o `email` do `select`.

### 1.6 `/weekly-save` liberado se `CRON_SECRET` não estiver definido
- **Arquivo:** `routes/weekly-save/index.js`
- **Problema:** se a variável estiver ausente e o header também, `undefined !== undefined` é falso e a rota executa.
- **Correção:** recusar quando `CRON_SECRET` estiver vazio e comparar com `crypto.timingSafeEqual`. Remover o `console.log(response)`.

---

## Fase 2: Bugs funcionais

| # | Arquivo | Problema | Correção |
|---|---------|----------|----------|
| 2.1 | `routes/post/likePost/index.js` | `$addToSet` não impede curtidas duplicadas: cada subdocumento ganha `_id` e `likedAt` próprios, então nunca é igual a outro. | `findOneAndUpdate({ _id: id, "likes.userId": { $ne: userId } }, { $push: { likes: { userId } } })`. Corrigir também a mensagem "post discutido" para "post descurtido". |
| 2.2 | `routes/post/getAllPosts/index.js` + `utils/formatPostData.js` | O populate usa `-_id`, então `post.user._id` não existe e `isMyPost` é sempre `false` no feed. | Manter o `_id` no populate ou comparar pelo `post.user` antes do populate. |
| 2.3 | `routes/post/getAllPosts/index.js` | `jwt.verify` lança erro com token expirado ou inválido e o feed público inteiro retorna 500. | Envolver em `try/catch` e tratar como visitante (`{ id: null }`). |
| 2.4 | `routes/person/getById/index.js` | A rota não usa `authMiddleware`, então `req.user` é `undefined` e ela sempre quebra. | Adicionar `authMiddleware`, ou remover a rota, porque o `isAuth` já faz o mesmo. |
| 2.5 | `routes/person/isAuth/index.js` | Se o usuário foi apagado, `person` é `null` e a rota dá 500 em vez de 401. Há também o typo `suscess`. | Retornar 401 quando `!person` e corrigir a chave. |
| 2.6 | `routes/person/logout/index.js` | O cookie é criado com `sameSite: "none"`, mas o `clearCookie` usa `"strict"`. Em contexto cross-site, o navegador pode ignorar e o logout falha. | Usar as mesmas opções do login (`sameSite: "none"`, `secure: true`). |
| 2.7 | `models/Person.js` | `email` sem índice `unique`. O tratamento de `duplicate key error` no cadastro nunca dispara e há condição de corrida entre a verificação e o insert. | `email: { type: String, unique: true, lowercase: true, trim: true }`. Normalizar o e-mail também no login e no update. |
| 2.8 | `getAllPosts` / `getMyPosts` | Sem `page`, o `skip` vira `NaN`. O `limit` não tem teto (`?limit=100000`). | Valores padrão (`page=1`) e teto (ex.: `limit ≤ 50`). |
| 2.9 | Rotas com `:id` | Um ObjectId inválido gera `CastError` e retorna 500. | Validar com `mongoose.isValidObjectId` e retornar 400. |
| 2.10 | `routes/post/updatePost/index.js` | `updatedAt` nunca é atualizado. | Usar `timestamps: true` no schema (ver 4.3). |
| 2.11 | `routes/person/update/index.js` | `img === "null"` grava `person.img = undefined`, uma lógica confusa. | Definir um contrato claro: arquivo novo substitui, `img=delete` remove e apaga no Cloudinary. |

---

## Fase 3: Robustez e hardening

- **Ordem dos middlewares de upload:** em `createPost` e `updatePost`, o `multer` roda antes do `authMiddleware`. Requisições anônimas fazem o servidor ler até 5 arquivos de 5 MB na memória. Colocar `authMiddleware` primeiro, como já acontece em `person/update`.
- **Upload de várias imagens:** a rota aceita `upload.array("images", 5)`, mas o `handleImageUpload` só envia o primeiro arquivo. Aceitar só 1 arquivo (`upload.single`) ou enviar todos.
- **Pasta do Cloudinary:** imagens de posts vão para a pasta `userAvatar`. Passar a pasta como parâmetro (`posts` / `avatars`).
- **Imagens órfãs:** ao atualizar ou apagar um post, a imagem antiga continua no Cloudinary. Guardar o `public_id` no post e chamar `destroy`.
- **Handler global de erros:** não há um. Erros do multer (`LIMIT_FILE_SIZE`) e exceções não tratadas caem no handler padrão do Express, que responde em HTML. Criar um middleware final que responda `{ success: false, message }` em JSON.
- **Rate limiting:** `/person/login` e `/person` (cadastro) estão sem limite contra força bruta. Adicionar `express-rate-limit`.
- **Headers de segurança:** adicionar `helmet`.
- **Política de senha:** não há tamanho mínimo. Exigir pelo menos 8 caracteres.
- **Validação de entrada:** centralizar com `zod` ou `express-validator` em vez de `if`s repetidos em cada rota.
- **Cliente do microserviço:** `services/news-client.js` não confere `response.ok` e não tem timeout. Usar `AbortSignal.timeout(10000)` e tratar status diferente de 2xx.
- **Status HTTP:** trocar `424` por `404` nos casos de "não encontrado" e padronizar `400`/`422`.

---

## Fase 4: Qualidade de código e manutenção

1. **Configuração:** porta (`3030`) e host do cluster Mongo estão fixos em `index.js`. Mover para `PORT` e `MONGODB_URI` no `.env`.
2. **Scripts:** `nodemon` está nas dependências de produção e no `start`. Mudar para `"start": "node index.js"` e `"dev": "nodemon index.js"`, com `nodemon` em `devDependencies`. Isso também corrige o `npm run dev` do README.
3. **Models:** migrar para `new mongoose.Schema({...}, { timestamps: true })`, remover os `createdAt`/`updatedAt` manuais e o campo `commentId` sem uso em `Post.comments`.
4. **Sistema de módulos:** o projeto mistura CommonJS e ESM (`handleImageUpload.js`, `news-client.js`) e depende do `require(esm)` do Node 22+. Escolher um padrão (recomendado: ESM com `"type": "module"`) e declarar `"engines": { "node": ">=22" }`.
5. **Código morto:** remover `utils/deleleOldImags.js`, o static `/uploads` e `public/uploads`, e os imports sem uso (`ObjectId`, `path`, `Person` em várias rotas). Com isso, a dependência `mongodb` pode sair.
6. **Lockfiles:** existem `package-lock.json` e `yarn.lock`. Manter só um.
7. **Rotas REST:** `POST /post/my-posts` é leitura e deveria ser `GET`. Comentar e curtir usam `PATCH` em rotas genéricas: considerar `POST /post/:id/comments` e `POST|DELETE /post/:id/like`. Isso exige alinhar com o frontend.
8. **Duplicação:** a configuração do `multer` e o objeto de cookie se repetem em várias rotas. Extrair para `middleware/upload.js` e `utils/cookieOptions.js`.
9. **Consulta do `/weekly-save`:** faz um `findOne` por artigo dentro do loop. Trocar por um único `Post.find({ title: { $in: titles } })`.
10. **Lint e formatação:** adicionar ESLint e Prettier.

---

## Fase 5: Testes e documentação

- **Testes:** configurar `node:test` ou Jest com `supertest` e `mongodb-memory-server`. Prioridade de cobertura: autenticação, regras de dono (1.1, 1.3, 1.4), curtidas (2.1) e `/weekly-save` com o microserviço mockado.
- **CI:** GitHub Actions rodando lint e testes em cada PR.
- **README:** está salvo em UTF-16 (aparece corrompido em várias ferramentas). Converter para UTF-8, corrigir os scripts e completar a tabela de endpoints e as variáveis de ambiente (faltam `CLOUD_*` e `CURRENT_SITE_URL_NEW`).
- **Documentação da API:** opcionalmente, um OpenAPI/Swagger.

---

## Ordem sugerida de execução

1. Fase 1 inteira, um commit por item.
2. Itens 2.1 a 2.7 da Fase 2.
3. Handler global de erros, ordem dos middlewares e rate limit (Fase 3).
4. Estrutura de testes (Fase 5), antes das refatorações maiores.
5. Fase 4 e o restante das Fases 2 e 3, já protegidos pelos testes.
