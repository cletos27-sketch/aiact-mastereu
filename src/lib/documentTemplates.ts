export type DocumentType = 
  | "transparencia"
  | "logs"
  | "tecnica"
  | "literacia"
  | "impacto"
  | "supervisao";

export const documentTemplates: Record<DocumentType, { title: string; sections: string[] }> = {
  transparencia: {
    title: "Política de Transparência em IA",
    sections: [
      "1. OBJETIVO",
      "Esta política estabelece as diretrizes para garantir transparência no uso de sistemas de Inteligência Artificial, em conformidade com o Regulamento Europeu de IA (EU AI Act).",
      "",
      "2. ÂMBITO DE APLICAÇÃO",
      "Aplica-se a todos os sistemas de IA utilizados pela organização que interajam direta ou indiretamente com cidadãos da União Europeia.",
      "",
      "3. PRINCÍPIOS DE TRANSPARÊNCIA",
      "• Informar claramente quando um sistema de IA está em uso",
      "• Explicar as finalidades do sistema de IA",
      "• Disponibilizar informações sobre a lógica de funcionamento",
      "• Comunicar limitações conhecidas do sistema",
      "",
      "4. OBRIGAÇÕES ESPECÍFICAS",
      "• Sistemas de chatbot: Informar que o usuário está interagindo com IA",
      "• Sistemas de reconhecimento de emoções: Obter consentimento prévio",
      "• Conteúdo gerado por IA: Marcar claramente como artificial",
      "",
      "5. RESPONSABILIDADES",
      "O Responsável pela Conformidade de IA deve garantir a implementação desta política.",
    ],
  },
  logs: {
    title: "Estrutura de Registro de Logs de Auditoria",
    sections: [
      "1. REQUISITOS DE LOGGING (Artigo 12)",
      "Os sistemas de IA de alto risco devem manter logs automáticos durante todo o ciclo de vida.",
      "",
      "2. INFORMAÇÕES A REGISTRAR",
      "• Data e hora de cada utilização",
      "• Identificação do operador/usuário",
      "• Dados de entrada processados",
      "• Decisões/outputs gerados",
      "• Tempo de processamento",
      "• Eventuais erros ou anomalias",
      "",
      "3. PERÍODO DE RETENÇÃO",
      "• Mínimo: Duração especificada na documentação técnica",
      "• Sistemas de Alto Risco: Conforme requisitos regulatórios específicos",
      "",
      "4. FORMATO DE ARMAZENAMENTO",
      "• Formato estruturado (JSON/XML)",
      "• Criptografia em repouso",
      "• Backup regular",
      "• Rastreabilidade garantida",
      "",
      "5. ACESSO AOS LOGS",
      "• Autoridades de fiscalização: Acesso integral",
      "• Equipe interna: Conforme perfil de acesso",
    ],
  },
  tecnica: {
    title: "Documentação Técnica do Sistema de IA",
    sections: [
      "1. DESCRIÇÃO GERAL DO SISTEMA",
      "• Nome do sistema:",
      "• Versão:",
      "• Finalidade principal:",
      "• Classificação de risco EU AI Act:",
      "",
      "2. ARQUITETURA TÉCNICA",
      "• Modelo de IA utilizado:",
      "• Framework/biblioteca:",
      "• Infraestrutura de hospedagem:",
      "• Integrações com outros sistemas:",
      "",
      "3. DADOS DE TREINAMENTO",
      "• Fontes de dados:",
      "• Volume de dados:",
      "• Período de coleta:",
      "• Metodologia de validação:",
      "",
      "4. MÉTRICAS DE DESEMPENHO",
      "• Acurácia:",
      "• Precisão:",
      "• Recall:",
      "• Outras métricas relevantes:",
      "",
      "5. GESTÃO DE RISCOS",
      "• Riscos identificados:",
      "• Medidas de mitigação:",
      "• Testes realizados:",
      "",
      "6. MANUTENÇÃO E ATUALIZAÇÕES",
      "• Frequência de atualização:",
      "• Processo de validação pós-atualização:",
    ],
  },
  literacia: {
    title: "Material de Literacia em IA (Artigo 4)",
    sections: [
      "1. INTRODUÇÃO À LITERACIA EM IA",
      "O Artigo 4 do EU AI Act exige que provedores e operadores garantam que sua equipe tenha conhecimento suficiente sobre IA.",
      "",
      "2. CONCEITOS FUNDAMENTAIS",
      "• O que é Inteligência Artificial",
      "• Tipos de sistemas de IA",
      "• Diferença entre IA generativa e discriminativa",
      "• Limitações dos sistemas de IA",
      "",
      "3. EU AI ACT - VISÃO GERAL",
      "• Objetivos do regulamento",
      "• Classificação de riscos (Mínimo, Limitado, Alto, Inaceitável)",
      "• Obrigações por categoria de risco",
      "• Prazos de implementação",
      "",
      "4. BOAS PRÁTICAS",
      "• Validação de outputs de IA",
      "• Identificação de vieses",
      "• Supervisão humana adequada",
      "• Reportar anomalias",
      "",
      "5. RESPONSABILIDADES DA EQUIPE",
      "• Entender como os sistemas de IA funcionam",
      "• Conhecer suas limitações",
      "• Saber quando escalar decisões",
      "• Manter documentação atualizada",
    ],
  },
  impacto: {
    title: "Avaliação de Impacto em Direitos Fundamentais",
    sections: [
      "1. IDENTIFICAÇÃO DO SISTEMA",
      "• Nome do sistema:",
      "• Operador responsável:",
      "• Data da avaliação:",
      "",
      "2. ANÁLISE DE DIREITOS IMPACTADOS",
      "• Dignidade humana:",
      "• Liberdade e autonomia:",
      "• Não-discriminação:",
      "• Privacidade e proteção de dados:",
      "• Acesso à justiça:",
      "",
      "3. GRUPOS VULNERÁVEIS",
      "• Identificação de grupos afetados:",
      "• Impactos específicos por grupo:",
      "• Medidas de proteção:",
      "",
      "4. AVALIAÇÃO DE RISCOS",
      "• Probabilidade de impacto negativo:",
      "• Gravidade potencial:",
      "• Reversibilidade do dano:",
      "",
      "5. MEDIDAS DE MITIGAÇÃO",
      "• Ações preventivas:",
      "• Mecanismos de correção:",
      "• Processo de monitoramento:",
      "",
      "6. CONCLUSÃO E RECOMENDAÇÕES",
      "• Parecer final:",
      "• Condições para operação:",
      "• Revisões futuras necessárias:",
    ],
  },
  supervisao: {
    title: "Política de Supervisão Humana",
    sections: [
      "1. OBJETIVO",
      "Estabelecer diretrizes para garantir supervisão humana adequada dos sistemas de IA, conforme Artigo 14 do EU AI Act.",
      "",
      "2. PRINCÍPIOS DE SUPERVISÃO",
      "• Capacidade de compreender o funcionamento do sistema",
      "• Capacidade de monitorar a operação",
      "• Capacidade de intervir ou interromper o sistema",
      "• Capacidade de ignorar outputs do sistema",
      "",
      "3. PAPÉIS E RESPONSABILIDADES",
      "• Operador de IA: Monitoramento diário",
      "• Supervisor de IA: Revisão de decisões críticas",
      "• Responsável de Conformidade: Auditoria periódica",
      "• Gestão: Aprovação de mudanças significativas",
      "",
      "4. PROCEDIMENTOS DE INTERVENÇÃO",
      "• Critérios para intervenção manual",
      "• Processo de escalação",
      "• Documentação de intervenções",
      "",
      "5. TREINAMENTO NECESSÁRIO",
      "• Capacitação inicial obrigatória",
      "• Atualizações periódicas",
      "• Avaliação de competências",
      "",
      "6. REGISTRO E AUDITORIA",
      "• Documentação de todas as intervenções",
      "• Relatórios periódicos de supervisão",
      "• Indicadores de desempenho",
    ],
  },
};

export const documentPDFContent: Record<number, { title: string; sections: { heading: string; items: string[] }[] }> = {
  1: {
    title: "Dossiê Técnico — Anexo IV do Regulamento (UE) 2024/1689",
    sections: [
      {
        heading: "1. DESCRIÇÃO GERAL DO SISTEMA DE IA",
        items: [
          "Nome do sistema de IA e versão de lançamento",
          "Nome comercial e identidade jurídica do fornecedor (incluindo endereço da sede e contactos)",
          "Descrição clara e detalhada da finalidade pretendida do sistema de IA",
          "Data de colocação no mercado ou entrada em serviço e histórico de versões",
          "Descrição de como o sistema de IA interage com hardware ou software não integrado"
        ]
      },
      {
        heading: "2. ARQUITETURA E ALGORITMOS",
        items: [
          "Arquitetura geral do sistema com diagrama explicativo dos componentes principais",
          "Descrição detalhada dos elementos do sistema, incluindo algoritmos, modelos e processos computacionais",
          "Técnicas de machine learning utilizadas (supervisionado, não-supervisionado, por reforço, etc.)",
          "Metodologia de design e escolhas técnicas fundamentais",
          "Recursos computacionais necessários (hardware, tempo de processamento, memória)",
          "Especificações de inputs e outputs do sistema com formatos e limitações"
        ]
      },
      {
        heading: "3. GESTÃO DE RISCOS — Artigo 9",
        items: [
          "Sistema de gestão de riscos implementado e metodologia de identificação de perigos",
          "Identificação e análise de riscos conhecidos e razoavelmente previsíveis para a saúde, segurança ou direitos fundamentais",
          "Avaliação dos riscos que podem surgir quando o sistema é utilizado conforme a finalidade prevista e em condições de utilização indevida razoavelmente previsível",
          "Medidas de gestão de riscos adotadas, incluindo soluções técnicas e organizacionais",
          "Riscos residuais aceitáveis com justificação documentada",
          "Testes e validação das medidas de mitigação implementadas",
          "Procedimentos de monitorização contínua de riscos e atualização da avaliação"
        ]
      },
      {
        heading: "4. DADOS DE TREINAMENTO E GOVERNANÇA — Artigo 10",
        items: [
          "Descrição detalhada dos conjuntos de dados de treino, validação e teste utilizados",
          "Origem e proveniência dos dados, incluindo critérios de seleção e fontes",
          "Práticas de governança de dados implementadas (recolha, preparação, rotulagem, limpeza)",
          "Análise de vieses potenciais nos dados e medidas de mitigação",
          "Medidas de qualidade dos dados: completude, representatividade e adequação ao contexto geográfico/demográfico",
          "Descrição de lacunas ou deficiências conhecidas nos conjuntos de dados",
          "Procedimentos de proteção de dados pessoais conforme RGPD quando aplicável"
        ]
      },
      {
        heading: "5. MEDIDAS DE SUPERVISÃO HUMANA — Artigo 14",
        items: [
          "Descrição das medidas de interface homem-máquina que permitem supervisão efetiva",
          "Funcionalidades técnicas que permitem a uma pessoa singular compreender as capacidades e limitações do sistema",
          "Mecanismos que permitem monitorizar a operação do sistema de IA",
          "Capacidade de interpretar corretamente os outputs do sistema",
          "Funcionalidade de interrupção (botão de paragem) ou intervenção imediata",
          "Procedimentos para decidir não utilizar o sistema ou anular decisões automatizadas",
          "Formação requerida para operadores humanos e competências mínimas"
        ]
      },
      {
        heading: "6. DESEMPENHO E ROBUSTEZ — Artigo 15",
        items: [
          "Métricas de desempenho utilizadas e valores obtidos em testes",
          "Níveis esperados de precisão, incluindo métricas específicas por grupo demográfico",
          "Medidas de robustez face a erros, falhas ou inconsistências nos inputs",
          "Medidas de resiliência contra tentativas de manipulação por terceiros (adversarial attacks)",
          "Comportamento do sistema em situações não previstas (edge cases)",
          "Requisitos e medidas de cibersegurança implementadas"
        ]
      },
      {
        heading: "7. LOGGING E RASTREABILIDADE — Artigo 12",
        items: [
          "Capacidades de registo automático (logging) ao longo do ciclo de vida",
          "Dados registados para cada operação (timestamp, inputs, outputs, identificadores)",
          "Período mínimo de conservação dos registos e formato de armazenamento",
          "Procedimentos de acesso aos logs para fins de auditoria",
          "Mecanismos que garantem a integridade e autenticidade dos registos"
        ]
      }
    ]
  },
  2: {
    title: "Instruções de Uso — Artigo 13 do Regulamento (UE) 2024/1689",
    sections: [
      {
        heading: "1. INFORMAÇÕES DE IDENTIFICAÇÃO",
        items: [
          "Nome, endereço e contactos do fornecedor do sistema de IA",
          "Nome e versão do sistema de IA",
          "Data de emissão destas instruções e número de revisão"
        ]
      },
      {
        heading: "2. FINALIDADE PRETENDIDA E CONTEXTO DE UTILIZAÇÃO",
        items: [
          "Descrição clara da finalidade para a qual o sistema foi desenvolvido",
          "Contexto(s) específico(s) de utilização previstos pelo fornecedor",
          "Setores de atividade ou domínios de aplicação",
          "Grupos-alvo de utilizadores finais (operadores, afetados, público)",
          "Cenários de utilização aprovados e não aprovados"
        ]
      },
      {
        heading: "3. CAPACIDADES E LIMITAÇÕES DO SISTEMA",
        items: [
          "Descrição detalhada das capacidades funcionais do sistema",
          "LIMITAÇÕES CONHECIDAS: situações em que o sistema pode falhar ou ter desempenho inferior",
          "Circunstâncias previsíveis que podem afetar a precisão ou fiabilidade",
          "Condições de operação ideais e degradação esperada fora dessas condições",
          "Riscos conhecidos para saúde, segurança ou direitos fundamentais mesmo em uso correto",
          "Especificações de hardware/software necessário para funcionamento adequado"
        ]
      },
      {
        heading: "4. NÍVEIS DE PRECISÃO E MÉTRICAS DE DESEMPENHO",
        items: [
          "Métricas de precisão declaradas pelo fornecedor com metodologia de teste",
          "Desagregação de métricas por subgrupos relevantes (idade, género, origem, etc.)",
          "Taxa de falsos positivos e falsos negativos para o contexto de aplicação",
          "Intervalos de confiança ou margens de erro dos outputs",
          "Condições sob as quais as métricas foram obtidas (laboratório vs. campo)"
        ]
      },
      {
        heading: "5. COMO INTERPRETAR OS RESULTADOS — EVITAR VIÉS DE AUTOMAÇÃO",
        items: [
          "ATENÇÃO: Os outputs deste sistema são AUXILIARES e não substituem o julgamento humano",
          "Nunca aceite automaticamente uma decisão do sistema sem análise crítica",
          "Verifique sempre se o resultado faz sentido no contexto específico da situação",
          "Compare o output com outras fontes de informação disponíveis",
          "Considere fatores contextuais que o sistema pode não ter considerado",
          "Em caso de dúvida, consulte um especialista humano antes de prosseguir",
          "Documente suas razões quando aceitar ou rejeitar uma recomendação do sistema"
        ]
      },
      {
        heading: "6. SUPERVISÃO HUMANA REQUERIDA",
        items: [
          "Nível de supervisão humana obrigatório para cada tipo de decisão",
          "Competências e formação mínima exigida para operadores",
          "Procedimentos de intervenção quando o sistema apresenta outputs suspeitos",
          "Como utilizar a funcionalidade de interrupção de emergência",
          "Procedimentos de escalação para decisões de alto impacto"
        ]
      },
      {
        heading: "7. MANUTENÇÃO E ATUALIZAÇÕES",
        items: [
          "Frequência esperada de atualizações pelo fornecedor",
          "Como identificar a versão atual do sistema",
          "Procedimentos para instalação de atualizações de segurança",
          "Contactos de suporte técnico do fornecedor"
        ]
      }
    ]
  },
  3: {
    title: "Guia de Literacia em IA — Artigo 4 do Regulamento (UE) 2024/1689",
    sections: [
      {
        heading: "1. OBRIGAÇÃO LEGAL DE LITERACIA EM IA",
        items: [
          "O Artigo 4 do EU AI Act exige que provedores e operadores garantam literacia suficiente em IA",
          "Esta formação é OBRIGATÓRIA para todos os colaboradores que utilizam ou supervisionam sistemas de IA",
          "A literacia deve considerar: conhecimentos técnicos, experiência, educação e contexto de utilização",
          "O incumprimento pode resultar em sanções administrativas significativas"
        ]
      },
      {
        heading: "2. O QUE É INTELIGÊNCIA ARTIFICIAL",
        items: [
          "IA são sistemas computacionais que realizam tarefas normalmente requerendo inteligência humana",
          "Machine Learning: sistemas que aprendem padrões a partir de dados",
          "Deep Learning: redes neurais complexas para reconhecimento de padrões avançados",
          "IA Generativa: sistemas que criam conteúdo novo (texto, imagem, código)",
          "IMPORTANTE: A IA não tem consciência, compreensão real ou intenções próprias"
        ]
      },
      {
        heading: "3. SEUS DIREITOS COMO COLABORADOR",
        items: [
          "Direito a ser informado quando interage com um sistema de IA",
          "Direito a formação adequada sobre os sistemas de IA que utiliza",
          "Direito a compreender como as decisões de IA afetam seu trabalho",
          "Direito a questionar outputs de IA que pareçam incorretos ou injustos",
          "Direito a escalar preocupações sobre o funcionamento da IA",
          "Direito a não ser exclusivamente avaliado por decisões automatizadas"
        ]
      },
      {
        heading: "4. SUAS RESPONSABILIDADES",
        items: [
          "Utilizar os sistemas de IA conforme as diretrizes e formação recebida",
          "Manter supervisão crítica sobre todas as decisões assistidas por IA",
          "Reportar comportamentos inesperados ou resultados questionáveis",
          "Proteger dados sensíveis ao interagir com sistemas de IA",
          "Participar de formações e atualizações sobre literacia em IA",
          "Documentar incidentes ou anomalias conforme procedimentos internos"
        ]
      },
      {
        heading: "5. COMO IDENTIFICAR VIÉS (BIAS) EM OUTPUTS DE IA",
        items: [
          "Viés: erros sistemáticos que resultam em tratamento injusto de grupos ou indivíduos",
          "SINAIS DE ALERTA:",
          "- Padrões sistemáticos de resultados diferentes para grupos demográficos",
          "- Resultados que reforçam estereótipos conhecidos",
          "- Inconsistências para dados similares apresentados de formas diferentes",
          "- Dificuldade do sistema com nomes, idiomas ou referências culturais diversas",
          "CHECKLIST: O resultado é consistente? Há padrões suspeitos? Faz sentido no contexto?"
        ]
      },
      {
        heading: "6. PROCEDIMENTO DE REPORTE DE ERROS DE IA",
        items: [
          "PASSO 1: Documentar — capture screenshots, anote data/hora, inputs e outputs problemáticos",
          "PASSO 2: Classificar severidade — menor (não afeta decisões), moderado (pode afetar), crítico (dano potencial)",
          "PASSO 3: Reportar — utilize o canal oficial de compliance ou formulário de incidentes",
          "PASSO 4: Suspender uso se crítico — aguarde orientação da equipe técnica",
          "PASSO 5: Acompanhar — verifique se medidas corretivas foram implementadas",
          "PROTEÇÃO: A organização garante proteção a quem reportar incidentes de boa-fé"
        ]
      },
      {
        heading: "7. BOAS PRÁTICAS DIÁRIAS",
        items: [
          "ANTES: verifique formação, compreenda limitações, confirme qualidade dos dados de entrada",
          "DURANTE: mantenha supervisão crítica, não aceite tudo automaticamente, compare com seu conhecimento",
          "APÓS: revise qualidade das decisões, forneça feedback, mantenha-se atualizado",
          "PRINCÍPIO: A IA é ferramenta de apoio — VOCÊ é responsável pelas decisões finais"
        ]
      },
      {
        heading: "8. NÍVEIS DE RISCO DO EU AI ACT",
        items: [
          "RISCO INACEITÁVEL (PROIBIDO): manipulação subliminar, exploração de vulnerabilidades, pontuação social",
          "ALTO RISCO: recrutamento, educação, serviços essenciais (crédito/saúde), aplicação da lei",
          "RISCO LIMITADO: chatbots, deepfakes — requer transparência sobre natureza artificial",
          "RISCO MÍNIMO: filtros de spam, jogos — sem obrigações específicas além de boas práticas"
        ]
      }
    ]
  },
  4: {
    title: "Registro de Logs de Auditoria — Artigo 12 EU AI Act",
    sections: [
      {
        heading: "1. REQUISITOS DE LOGGING",
        items: [
          "Sistemas de IA de alto risco devem manter registos automáticos durante todo o ciclo de vida",
          "Os logs devem permitir rastrear o funcionamento do sistema e facilitar monitorização pós-comercialização"
        ]
      },
      {
        heading: "2. INFORMAÇÕES A REGISTRAR",
        items: [
          "Data e hora de cada utilização do sistema",
          "Identificação do operador/utilizador responsável",
          "Dados de entrada fornecidos ao sistema",
          "Outputs/decisões gerados pelo sistema",
          "Período mínimo de conservação dos registos: conforme regulamentação setorial aplicável"
        ]
      },
      {
        heading: "3. PROCEDIMENTOS DE ACESSO",
        items: [
          "Definir quem tem autorização para aceder aos logs",
          "Mecanismos de integridade para evitar adulteração",
          "Procedimentos de backup e recuperação"
        ]
      }
    ]
  },
  5: {
    title: "Avaliação de Impacto em Direitos Fundamentais — Artigo 27 EU AI Act",
    sections: [
      {
        heading: "1. IDENTIFICAÇÃO DO SISTEMA",
        items: [
          "Nome do sistema de IA",
          "Operador responsável pela implantação",
          "Data da avaliação"
        ]
      },
      {
        heading: "2. DIREITOS FUNDAMENTAIS IMPACTADOS",
        items: [
          "Dignidade humana — análise de impacto",
          "Liberdade e autonomia — análise de impacto",
          "Não-discriminação — análise de impacto",
          "Proteção de dados pessoais — análise de impacto",
          "Outros direitos relevantes ao contexto"
        ]
      },
      {
        heading: "3. MEDIDAS DE MITIGAÇÃO",
        items: [
          "Salvaguardas técnicas e organizacionais implementadas",
          "Procedimentos de supervisão humana",
          "Mecanismos de recurso para afetados"
        ]
      },
    ]
  },
  6: {
    title: "Política de Supervisão Humana — Artigo 14 EU AI Act",
    sections: [
      {
        heading: "1. OBJETIVO",
        items: [
          "Estabelecer diretrizes para supervisão humana adequada conforme Artigo 14 do EU AI Act"
        ]
      },
      {
        heading: "2. PRINCÍPIOS DE SUPERVISÃO",
        items: [
          "Capacidade de compreender o funcionamento do sistema",
          "Capacidade de monitorar a operação em tempo real",
          "Capacidade de intervir, corrigir ou interromper o sistema",
          "Capacidade de decidir não utilizar o sistema em casos específicos"
        ]
      },
      {
        heading: "3. RESPONSABILIDADES",
        items: [
          "Designação formal de responsáveis pela supervisão",
          "Formação obrigatória e certificação dos supervisores",
          "Procedimentos de escalação para decisões críticas",
          "Documentação de todas as intervenções humanas"
        ]
      }
    ]
  }
};

export const generateComplianceBadge = (riskLevel: string) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [80, 50] // Tamanho de um cartão/badge
  });

  const isSafe = riskLevel.includes('MINIMAL') || riskLevel.includes('LOW');
  const color = isSafe ? [0, 128, 0] : [255, 140, 0]; // Verde ou Laranja

  // Fundo
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, 80, 50, 'F');

  // Borda colorida
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(2);
  doc.rect(2, 2, 76, 46);

  // Texto do Selo
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('EU AI ACT PRE-ASSESSMENT', 40, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(riskLevel, 40, 28, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text('Verified by AIACT Master', 40, 42, { align: 'center' });

  doc.save('AI_Compliance_Badge.pdf');
};


<problem file="src/pages/Dashboard.tsx" line="43" column="46" code="2307">Cannot find module '@/types/dashboard' or its corresponding type declarations.</problem>
<problem file="src/pages/Dashboard.tsx" line="44" column="36" code="2307">Cannot find module '@/lib/documentTemplates' or its corresponding type declarations.</problem>
 Os erros `TS2307: Cannot find module '@/types/dashboard'` e `TS2307: Cannot find module '@/lib/documentTemplates'` indicam que o compilador TypeScript não está conseguindo resolver os caminhos de importação que usam `@/`.

Isso geralmente acontece quando o `tsconfig.json` principal do projeto (não o das funções Supabase) não está configurado corretamente para mapear o alias `@/` para a pasta `src`.

Vou corrigir o `tsconfig.json` principal do projeto para incluir o mapeamento de caminhos para `@/`.

<dyad-write path="tsconfig.json" description="Atualizando tsconfig.json para incluir o mapeamento de caminhos para o alias '@/' e resolver erros de importação.">
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path Aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "vite.config.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}