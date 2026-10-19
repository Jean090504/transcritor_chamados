import { GoogleGenerativeAI } from '@google/generative-ai'
import { configuracaoAmbiente } from './src/config/env.js'

const cliente = new GoogleGenerativeAI(configuracaoAmbiente.CHAVE_API_GEMINI)

async function listar() {
  try {
    const resposta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${configuracaoAmbiente.CHAVE_API_GEMINI}`
    )
    const dados = await resposta.json()
    console.log(
      dados.models
        .filter(m => m.supportedGenerationMethods.includes('generateContent'))
        .map(m => m.name.replace('models/', ''))
    )
  } catch (e) {
    console.error(e)
  }
}

listar()