import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

// Clave secreta para la encriptación (debe mantenerse segura)
const secretKey = import.meta.env.PUBLIC_SECRET_ENCRYPT || 'secreto';

const key = createHash('sha256').update(String(secretKey)).digest('base64')
const key_in_bytes = Buffer.from(key, 'base64')

// Función para encriptar datos
export const encryptData = (text) => {

  const iv = randomBytes(16); // Vector de inicialización aleatorio
  const cipher = createCipheriv('aes-256-cbc', key_in_bytes, iv)
  let encrypted = cipher.update(JSON.stringify(text))
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return `${iv.toString('hex')}--${encrypted.toString('hex')}`

}

// Función para desencriptar datos
export const decryptData = (text) => {
  const [ivHex, encryptedTextHex] = text.split('--')
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = createDecipheriv('aes-256-cbc', key_in_bytes, iv)
  const encryptedText = Buffer.from(encryptedTextHex, 'hex')
  let decrypted = decipher.update(encryptedText)

  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}


// Funcion para crear slug de url

export const crearSlug = (texto) => {
  return texto
      .toString()                     // Convertir a string
      .normalize('NFD')               // Descomponer acentos y diacríticos
      .replace(/[\u0300-\u036f]/g, '') // Eliminar los diacríticos
      .toLowerCase()                  // Convertir a minúsculas
      .trim()                         // Eliminar espacios al inicio y al final
      .replace(/\s+/g, '-')           // Reemplazar espacios con guiones
      .replace(/[^\w\-]+/g, '')       // Eliminar todos los caracteres que no sean palabras, dígitos o guiones
      .replace(/\-\-+/g, '-');        // Reemplazar múltiples guiones por uno solo
}

// Función para convertir la fecha
export const convertirFechaALocalString = (fechaISO) => {
  // Crear un objeto de fecha a partir del string ISO
  var fecha = new Date(fechaISO);

  // Verificar si la fecha es válida
  if (!(fecha instanceof Date) || isNaN(fecha)) {
    return 'N/A';
  }

  // Convertir la fecha a un formato local de fecha y hora
  return fecha.toLocaleString();
};


export const formatArrayForSelect = (array,idAttributte, nameAttributte) => {
  const newArray = []
  for (const item of array) {
    newArray.push({
      value: item[idAttributte],
      name: item[nameAttributte]
    })
  }

  return newArray
}

export const convertirAPesosColombianos = (numero) => {
  // Asegúrate de que el número es un número válido
  let numeroConvertido = Number(numero);
  if (isNaN(numeroConvertido)) {
    return 'Número inválido';
  }

  // Utiliza Intl.NumberFormat para el formato de moneda colombiana
  let formateador = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
  });

  return formateador.format(numeroConvertido);
}

export const validaTipo = (tipo, valor) => {

  let nuevoValor = valor

  switch(tipo) {
    case 'fecha':
      nuevoValor = convertirFechaALocalString(nuevoValor)
    break
    case 'dinero':
      nuevoValor = convertirAPesosColombianos(nuevoValor)
    break
  }

  return nuevoValor

}

export const accederAtributoAnidado = (objeto, ruta) => {
  let atributos = ruta.split('.');
  let actual = objeto;

  for (const atributo of atributos) {

    let parte = atributo;

    if (parte.includes('[')) {
      // Extrae el nombre del atributo y el índice del arreglo
      let [nombreAtributo, indiceArreglo] = parte.split('[');
      indiceArreglo = parseInt(indiceArreglo.replace(']', ''), 10);

      if (actual[nombreAtributo] === undefined || !Array.isArray(actual[nombreAtributo])) {
        return 'N/A'; // O manejar el error de alguna manera
      }

      actual = actual[nombreAtributo][indiceArreglo];
    } else {
      if (actual[parte] === undefined) {
        return 'N/A'; // O manejar el error de alguna manera
      }
      actual = actual[parte];
    }

    if (actual === undefined) {
      return 'N/A'; // O manejar el error de alguna manera
    }
  }

  return actual;
}
