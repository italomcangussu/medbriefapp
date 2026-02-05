export const DEFAULT_WEBHOOK_URL = (import.meta.env && import.meta.env.VITE_N8N_WEBHOOK_URL) || ''; // User must configure this or use ENV
console.log('🔧 DEFAULT_WEBHOOK_URL loaded:', DEFAULT_WEBHOOK_URL);
export const STORAGE_KEY_SETTINGS = 'medbrief_settings_v1';
export const STORAGE_KEY_AUTH_MODE = 'medbrief_auth_mode'; // 'USER' | 'ADMIN'

// A sample placeholder if the user hasn't set one up, usually we'd keep this empty or point to a demo
export const DEMO_RESPONSE = `
💧 **SALSA Trial** - Hypertonic Saline Strategies

🟦 **Objetivo e Critérios**
📌 Comparar a segurança e eficácia de Bolus Rápido vs Infusão Lenta.
✅ Pacientes > 18 anos com hiponatremia sintomática grave.

🟦 **Como eles fizeram**
💉 Randomizado: Bolus Intermitente Rápido (RIB) ou Infusão Contínua Lenta (SCI).
🎯 Solução salina hipertônica a 3%.

🟦 **Principais Resultados**
📊 Sem diferença significativa na correção excessiva entre os grupos.
💊 Grupo Bolus teve menor incidência de necessidade de re-tratamento (41% vs 57%).

🟦 **Aplicações na Emergência**
🚨 Ambos os métodos são seguros.
💡 Bolus é preferível pela eficácia inicial e facilidade de administração.
`;

export const TERMS_OF_USE_TEXT = `
**Termos de Uso do MedBrief**

1. **Objetivo do Aplicativo**: O MedBrief é uma ferramenta de produtividade destinada a profissionais de saúde. Ele utiliza inteligência artificial para resumir literatura médica.

2. **Isenção de Responsabilidade Médica (Medical Disclaimer)**: 
   O CONTEÚDO GERADO PELO MEDBRIEF É APENAS PARA FINS INFORMATIVOS E EDUCACIONAIS. NÃO SUBSTITUI O JULGAMENTO CLÍNICO PROFISSIONAL, DIAGNÓSTICO OU TRATAMENTO. O USUÁRIO RECONHECE QUE A INTELIGÊNCIA ARTIFICIAL PODE COMETER ERROS E DEVE SEMPRE VERIFICAR AS INFORMAÇÕES NA FONTE ORIGINAL (ARTIGO CIENTÍFICO) ANTES DE TOMAR DECISÕES CLÍNICAS.

3. **Uso de Dados**: Ao enviar documentos PDF ou textos, você concorda que estes dados serão processados por serviços de terceiros (n8n, LLMs) para geração do resumo. Não envie dados identificáveis de pacientes (HIPAA/LGPD Compliance).

4. **Responsabilidade**: Os desenvolvedores do MedBrief não se responsabilizam por danos diretos ou indiretos resultantes do uso deste aplicativo.

5. **Aceite**: Ao criar uma conta, você concorda integralmente com estes termos.
`;

export const PRIVACY_POLICY_TEXT = `
**Política de Privacidade**

1. **Coleta de Dados**: Coletamos seu nome, e-mail e telefone para gerenciamento de conta e segurança.

2. **Processamento de Arquivos**: Os arquivos (PDFs) e textos enviados para resumo são transmitidos de forma criptografada para nossos servidores de processamento. Não armazenamos o conteúdo dos seus arquivos permanentemente após a geração do resumo.

3. **Compartilhamento**: Não vendemos seus dados pessoais para terceiros.

4. **Exclusão de Conta**: Você pode solicitar a exclusão da sua conta e de todos os dados associados a qualquer momento através das configurações do aplicativo.

5. **Contato**: Para questões de privacidade, entre em contato com o suporte técnico.
`;
