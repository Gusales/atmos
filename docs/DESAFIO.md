# Desafio Técnico - Front-end Júnior

## Objetivo

Desenvolver uma aplicação web simples para consulta de condições climáticas utilizando uma API pública de previsão do tempo.

O objetivo deste desafio é avaliar conhecimentos fundamentais de desenvolvimento Front-end, incluindo:

- HTML, CSS e JavaScript/TypeScript;
- Consumo de APIs REST;
- Estruturação de componentes;
- Tratamento de estados da aplicação;
- Boas práticas de desenvolvimento.

## Cenário

Imagine que você está desenvolvendo uma funcionalidade para que usuários possam consultar rapidamente informações meteorológicas de uma cidade de interesse.

Sua aplicação deverá permitir que o usuário informe um local e visualize informações atualizadas sobre o clima da região.

Para obtenção dos dados meteorológicos, utilize a API: **Visual Crossing Weather API**.

## Requisitos Funcionais

### RF01 - Consulta por Local

O usuário deverá conseguir informar:

- Nome da cidade;
- Cidade e estado;
- Cidade e país.

Exemplos:

- São Paulo
- Campinas, SP
- Rio de Janeiro, Brasil

Ao clicar em "Buscar", a aplicação deverá consultar a API e exibir os resultados.

### RF02 - Exibição das Condições Atuais

A aplicação deverá apresentar pelo menos as informações abaixo do dia atual:

- Temperatura atual;
- Temperatura mínima e máxima do dia;
- Sensação térmica;
- Umidade;
- Probabilidade de chuva;
- Condição climática atual (ex: Ensolarado, Parcialmente nublado, Nublado ou Chuvoso).

### RF03 - Previsão horária

Exibir informações referentes à previsão de temperatura em algumas horas do dia. Não é necessário construir gráficos complexos.

Uma lista ou cards contendo:

- Hora;
- Temperatura;
- Condição climática.

Exemplo:

| Horário | Temperatura | Condição |
| :--- | :--- | :--- |
| 08:00 | 18°C | Nublado |
| 09:00 | 20°C | Ensolarado |
| 10:00 | 22°C | Ensolarado |

### RF04 - Atualizar Informações

A aplicação deverá possuir uma forma simples de atualizar os dados exibidos.

Exemplos:

- Botão "Atualizar";
- Reexecutar a consulta realizada anteriormente.

### RF05 - Tratamento de Erros

A aplicação deverá tratar situações como:

- Cidade não encontrada;
- Falha na comunicação com a API;
- Campo vazio.

O usuário deve receber mensagens claras e amigáveis.

Exemplo: *Não foi possível localizar a cidade informada.*
