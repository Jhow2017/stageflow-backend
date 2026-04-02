# Funcionalidades Futuras

Este documento lista funcionalidades planejadas para implementação futura no sistema ReservaEstudio.

## 🔐 Autenticação e Segurança

### Verificação de Email (Email Verification)

**Status:** 📋 Planejado  
**Prioridade:** Média

**Descrição:**

- Enviar email de confirmação após registro
- Adicionar campo `emailVerified` no modelo `User`
- Criar rota `/auth/verify-email` para confirmar email via token
- Bloquear acesso a funcionalidades sensíveis até email ser verificado
- Permitir reenvio de email de verificação

**Benefícios:**

- Garante que o email é válido
- Reduz criação de contas falsas
- Melhora a segurança do sistema

**Implementação sugerida:**

- Adicionar `emailVerified: boolean` no `User` entity
- Criar `EmailVerificationToken` similar ao `ResetPasswordToken`
- Criar use case `VerifyEmailUseCase`
- Criar use case `ResendVerificationEmailUseCase`
- Adicionar guard opcional para verificar se email foi confirmado

---

### Sessões Múltiplas (Multiple Sessions)

**Status:** 📋 Planejado  
**Prioridade:** Baixa

**Descrição:**

- Permitir que usuário tenha vários dispositivos logados simultaneamente
- Armazenar tokens ativos por usuário
- Criar rota para listar sessões ativas
- Permitir encerrar sessões específicas
- Mostrar informações do dispositivo (IP, user agent, última atividade)

**Benefícios:**

- Melhor experiência do usuário (usar em celular, tablet e PC)
- Controle sobre sessões ativas
- Segurança adicional (usuário pode ver e revogar sessões suspeitas)

**Implementação sugerida:**

- Criar modelo `UserSession` no Prisma
- Armazenar `refreshToken`, `deviceInfo`, `ipAddress`, `lastActivity`
- Criar use case `ListSessionsUseCase`
- Criar use case `RevokeSessionUseCase`
- Atualizar `RefreshTokenUseCase` para atualizar `lastActivity`

---

### Autenticação de Dois Fatores (2FA)

**Status:** 📋 Planejado  
**Prioridade:** Alta

**Descrição:**

- Implementar 2FA usando TOTP (Time-based One-Time Password)
- Permitir ativar/desativar 2FA no perfil
- Gerar QR code para configurar app autenticador (Google Authenticator, Authy)
- Solicitar código 2FA no login após credenciais válidas
- Permitir códigos de backup para recuperação

**Benefícios:**

- Segurança adicional significativa
- Proteção contra acesso não autorizado mesmo com senha comprometida
- Padrão de segurança moderno

**Implementação sugerida:**

- Usar biblioteca `speakeasy` ou `otplib` para TOTP
- Adicionar `twoFactorEnabled: boolean` e `twoFactorSecret: string | null` no `User`
- Criar use case `Enable2FAUseCase` (gera QR code)
- Criar use case `Disable2FAUseCase`
- Criar use case `Verify2FACodeUseCase`
- Modificar `AuthenticateUserUseCase` para solicitar código 2FA quando ativado
- Criar rota `/auth/verify-2fa` para validar código após login

---

## 🎯 Funcionalidades do Sistema

### Gigs (Eventos/Shows)

**Status:** 📋 Planejado  
**Prioridade:** Alta

**Descrição:**

- CRUD completo de Gigs (eventos/shows)
- Relacionamento com usuários (criador, participantes)
- Status de gigs (rascunho, publicado, cancelado, concluído)
- Filtros e busca
- Upload de imagens/flyers

**Implementação sugerida:**

- Criar domínio `gigs` seguindo clean architecture
- Entidade `Gig` com campos: título, descrição, data/hora, local, preço, status
- Use cases: `CreateGigUseCase`, `ListGigsUseCase`, `GetGigUseCase`, `UpdateGigUseCase`, `DeleteGigUseCase`
- Controllers REST com Swagger
- Validações e permissões (apenas criador pode editar)

---

## 📝 Notas de Implementação

### Ordem Sugerida de Implementação:

1. **Verificação de Email** - Funcionalidade básica de segurança
2. **Gigs** - Funcionalidade core do sistema
3. **2FA** - Segurança avançada
4. **Sessões Múltiplas** - Melhoria de UX

### Considerações Técnicas:

- Manter padrão de Clean Architecture
- Seguir estrutura de domínio existente
- Adicionar logs de auditoria para novas ações
- Documentar endpoints no Swagger
- Criar testes para novos use cases

---

**Última atualização:** 2024-12-08
