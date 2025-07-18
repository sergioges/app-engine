// order-translation-keys.js
// Script to alphabetically sort the top-level keys of translation files.
import fs from 'fs'
import path from 'path'

const files = [path.join('src', 'locales', 'en.json'), path.join('src', 'locales', 'es.json')]

files.forEach(filePath => {
  const absPath = path.resolve(filePath)
  if (!fs.existsSync(absPath)) {
    console.warn(`No se encontró el archivo: ${filePath}`)
    return
  }
  const content = fs.readFileSync(absPath, 'utf8')
  let json
  try {
    json = JSON.parse(content)
  } catch (e) {
    console.error(`Error al parsear ${filePath}:`, e)
    return
  }
  const ordered = {}
  Object.keys(json)
    .sort()
    .forEach(key => {
      ordered[key] = json[key]
    })
  fs.writeFileSync(absPath, JSON.stringify(ordered, null, 2) + '\n', 'utf8')
  console.log(`Archivo ordenado: ${filePath}`)
})
