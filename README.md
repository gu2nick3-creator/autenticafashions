# AUTENTICA FASHIONF - Front + API PHP + MySQL

Este projeto foi refatorado para sair de mock/localStorage e passar a usar backend real em PHP + MySQL.

## Estrutura

- `src/` frontend React/Vite ajustado para consumir API real
- `backend/public/index.php` entrypoint da API
- `backend/database.sql` schema MySQL inicial + seed básico
- `backend/.env.example` variáveis do backend
- `.env.example` variável do frontend

## O que foi convertido

- autenticação real por API
- login admin via `.env`
- cadastro/login de clientes
- perfil e endereços no banco
- carrinho no banco
- wishlist no banco
- pedidos no banco
- painel admin consumindo API
- produtos/categorias/cupons/pedidos/clientes via API
- múltiplas imagens por produto
- fluxo revenda com 10 tamanhos no pedido
- backend preparado para upload e para futuras credenciais Cloudinary / InfinitePay

## Configuração rápida

### Banco
1. Crie o banco MySQL
2. Rode `backend/database.sql`

### Backend
1. Copie `backend/.env.example` para `backend/.env`
2. Preencha banco, JWT, CORS e admin
3. Publique a pasta `backend/public` como diretório público do servidor PHP
4. Garanta que a URL pública aponte para `backend/public/index.php`

### Frontend
1. Copie `.env.example` para `.env`
2. Ajuste `VITE_API_URL`
3. Instale dependências e rode/build normalmente

## Observações

- a integração real da InfinitePay precisa das credenciais oficiais
- o upload atual já funciona em modo local e está preparado para evolução para Cloudinary
- o backend usa cookie HTTP-only com JWT para autenticação
