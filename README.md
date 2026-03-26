# Autentica FashionF - Frontend + API PHP + MySQL

## O que foi trocado
- autenticação saiu do localStorage e foi para API com cookie HTTP-only + JWT
- carrinho saiu do localStorage e foi para o MySQL
- wishlist saiu do localStorage e foi para o MySQL
- endereços saíram do localStorage e foram para o MySQL
- pedidos saíram do localStorage e foram para o MySQL
- produtos/categorias/cupons/clientes/pedidos do admin agora têm rotas reais

## Estrutura
- `src/` frontend React/Vite
- `backend/public/index.php` entrada da API
- `backend/src/Controllers` módulos da API
- `backend/src/Core` autenticação, JWT e conexão PDO
- `backend/database.sql` schema do MySQL
- `backend/.env.example` exemplo de variáveis do backend
- `.env.example` exemplo do frontend

## Rotas principais da API
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/catalog/products`
- `GET /api/catalog/categories`
- `GET /api/cart/items`
- `POST /api/cart/items`
- `GET /api/wishlist`
- `POST /api/wishlist/toggle`
- `POST /api/orders`
- `GET /api/orders/my`
- `POST /api/coupons/validate`
- `GET /api/admin/dashboard`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `GET /api/admin/categories`
- `GET /api/admin/clients`
- `GET /api/admin/coupons`
- `GET /api/admin/orders`

## Como subir o backend
1. importe `backend/database.sql` no MySQL
2. copie `backend/.env.example` para `backend/.env`
3. ajuste banco, JWT, CORS, admin e Cloudinary
4. aponte o documento público do servidor para `backend/public`
5. garanta que a pasta `backend/storage/uploads` tenha permissão de escrita

## Como ligar o frontend
1. copie `.env.example` para `.env`
2. defina `VITE_API_URL=https://SEU_BACKEND/api`
3. rode `npm install`
4. rode `npm run build`

## Integrações
- Cloudinary: backend preparado via variáveis `CLOUDINARY_*`
- InfinitePay: frontend deixou a estrutura preparada e o checkout já cria pedido real; a etapa de cobrança/webhook precisa ser conectada com suas credenciais reais no backend

## Limitação honesta
Eu consegui validar a sintaxe de todos os arquivos PHP. O build final do React não foi validado aqui porque o ambiente não tinha `node_modules` instalados.
