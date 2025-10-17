# EAFC Leaks - Sistema de Monitoramento de Tweets

Sistema automatizado que monitora contas do Twitter (X) e envia notificações instantâneas via Telegram quando novos tweets são publicados.

## 🎯 Como Funciona

A aplicação funciona em 3 componentes principais trabalhando em conjunto:

### 1. **Monitor de Tweets (Producer)**

- Monitora periodicamente uma lista de contas do Twitter
- Verifica a cada 60 minutos se há novos tweets
- Utiliza Redis para armazenar cache e evitar duplicatas
- Quando encontra novos tweets, envia para a fila do RabbitMQ

### 2. **Worker do Telegram (Consumer)**

- Fica constantemente escutando a fila do RabbitMQ
- Recebe os tweets da fila e envia para o canal/grupo do Telegram
- Implementa rate limiting de 1 segundo entre mensagens
- Confirma o processamento de cada mensagem (ACK)

### 3. **RabbitMQ (Message Queue)**

- Gerencia a fila de mensagens entre o Producer e Consumer
- Garante que nenhuma mensagem seja perdida
- Permite processamento assíncrono e escalável

## 🔄 Fluxo de Execução

```
1. Monitor verifica contas do Twitter a cada 60min
        ↓
2. Novos tweets encontrados? → Envia para fila RabbitMQ
        ↓
3. Worker recebe da fila
        ↓
4. Envia notificação para Telegram (com rate limit de 1s)
        ↓
5. Confirma processamento (ACK)
```

## 🛠️ Tecnologias

- **Node.js + TypeScript** - Runtime e linguagem
- **Twitter API v2** - Busca de tweets
- **Telegram Bot API** - Envio de notificações
- **RabbitMQ** - Sistema de filas de mensagens
- **Redis** - Cache e controle de duplicatas
- **Docker** - Containerização dos serviços

## ⚙️ Como Usar

### 1. Pré-requisitos

```bash
# Instalar dependências
pnpm install
```

### 2. Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar .env com suas credenciais:
# - TWITTER_BEARER_TOKEN (Twitter API)
# - TELEGRAM_TOKEN (Bot do Telegram)
# - TELEGRAM_CHAT_ID (ID do canal/grupo)
# - Credenciais do Redis e RabbitMQ
```

### 3. Subir serviços auxiliares

```bash
# Inicia Redis e RabbitMQ
docker-compose up -d
```

### 4. Iniciar aplicação

```bash
# Inicia o sistema completo
pnpm start
```

## 📊 Output Esperado

Ao iniciar, você verá:

- ✅ Conexão com RabbitMQ e Redis
- 🔍 Monitor iniciado com lista de contas
- 👷 Worker aguardando mensagens
- 📤 Mensagens sendo processadas e enviadas

## 🔒 Segurança

- O arquivo `.env` **não** é versionado (protegido pelo `.gitignore`)
- Nunca compartilhe suas credenciais de API
- Use o arquivo `env.example` como referência

## 📝 Estrutura do Projeto

```
src/
├── api/              # Integração com APIs externas
├── configs/          # Configurações (contas, Redis, RabbitMQ)
├── interfaces/       # Tipos TypeScript
├── queue/            # Serviços de Producer/Consumer
├── services/         # Lógica de negócio
├── workflows/        # Orquestração dos processos
└── start.ts          # Ponto de entrada da aplicação
```

## 🚀 Monitoramento

O sistema monitora continuamente e exibe logs em tempo real:

- ⏰ Horário das verificações
- 📊 Quantidade de tweets encontrados
- 📤 Mensagens publicadas na fila
- ⏳ Tempo até próxima verificação
- ✅ Status de processamento

---

**Desenvolvido para monitoramento automatizado de leaks e notícias do EA FC**
