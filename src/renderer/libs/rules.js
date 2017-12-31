// Libreria utilizada para ejecutar validacion de reglas sobre un Formulario siguiendo una estructura especifica de matriz
// con las validaciones o utilizar las validaciones por separado
// -----------------------------------------------------------------------------------------------
// ESTRUCTURA DEL ARBOL DE REGLAS LA CUAL FUNCIONA COMO ARGUMENTO PARA 'rules'--------------------
// matrizreglas: {
//   nombre: {
//     result: '',
//     rules: [
//       {
//         prop: '',
//         typevalidation: '',
//         message: '',
//         args: {
//           children: '' ó [],
//           comparation: ''
//         }
//       }
//     ]
//   }
// }
// -----------------------------------------------------------------------------------------------
// GLOSARIO DEL ARBOL DE REGLAS ------------------------------------------------------------------
// * nombre: se reemplaza por el valor en la propiedad prop del objeto a validarse en un FormItem
//  * result: este campo se deja tal cual como esta para inicializarse sin resultados
//  * rules: este campo contiene la coleccion de reglas validarsen en el FormItem y sus hijos, cada regla contiene las siguientes propiedades:
//    * prop: nuevamente el valor de la propiedad prop delobjeto a validarse en un Formitem
//    * typevalidation: es el tipo de validacion que se puede ejecutar:
//      - content-null => valida que el contenido no este vacio o nulo, es de required en true
//      - type => valida el tipo del valor, esta validacion requiere que en el campo de argumentos, en el argumento 'comparation' tenga el nombre del tipo que debe tener el valor
//      - characters => valida que el contenido cumpla con un minimo y un maximo de caracteres, en el argumento 'compartion' se envia una coleccion con el minimo y el maximo para esta validacion
//      - comparation => valida que el valor sea menor, igual, mayor que el valor dado en el argumento 'comparation', en donde se envia una coleccion con el valor de la comparacion y el subtipo de la misma
//    * message: es el mensaje que se almacenada en result en caso de que la validacion arroje algun resultado negativo
//    * args: estos son los argumentos de la regla de validacion los cuales se especifican si son necesarios de la siguiente manera:
//      * children: este argumento hace que el evaluador revice los subitems dentro del FormItem dependiendo del argumento que se envie:
//        - 'all': en caso que se quiera que se aplique la regla a todos los subitems de la misma
//        - []: una coleccion con los indices de los items que son objeto de la validacion, siendo asi: [0, 1, 3, 6, 9], solamente los items cuyos indices coincidan con esta coleccion seran objeto de la validacion
//      * comparation: este argumento se utiliza como apoyo a las validaciones
//        - en el caso de que el tipo de validacion sea type solamente como string se especifica el nombre del tipo
//        - en el caso de que el tipo de validacion sea characters se envia un objeto con las siguientes propiedades:
//          { min: ?, max: ? }
//        - en el caso de que el tipo de validacion sea comparation se envia un objeto con las siguientes propiedades:
//          {
//            valc: es el valor de la comparacion,
//            type: 'less' : 'higher' : 'equals'
//          }
// -----------------------------------------------------------------------------------------------
const q = require('q')

// -----------------------------------------------------------------------------------------------------------
exports._rules_verification_getType = (obj) => {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

// -----------------------------------------------------------------------------------------------------------
exports._rules_contentNull = (val) => {
  // --------------------------| Description |--------------------------
  // Description: Ejecuta la validacion del contenido de un campo en especifico
  // Parameters:
  // * val = es el valor a evualuarse
  // return: retorna true en caso que apruebe la validacion, o false en caso que no
  // ------------------------| End Description |------------------------
  if (val !== '' && val !== ' ' && val !== 0 && val !== '0' && val !== null && val !== undefined) {
    return true
  } else {
    return false
  }
}

// -----------------------------------------------------------------------------------------------------------
exports._rules_characters = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Ejecuta la validacion de la cantidad de caracteres
  // Parameters:
  // * configuracion. min = valor de caracteres minimo que debe tener la cadena
  // * configuracion. max = valor de caracteres maximo que debe tener la cadena
  // * configuracion. val = valor a evaluarse
  // return: retorna true en caso que apruebe la validacion, o false en caso que no
  // ------------------------| End Description |------------------------
  if (configuracion.val.length >= configuracion.min && configuracion.val.length <= configuracion.max) {
    return true
  } else {
    return false
  }
}

// -----------------------------------------------------------------------------------------------------------
exports._rules_comparation = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Ejecuta la validacion de la cantidad de caracteres
  // Parameters:
  // * configuracion. type = tipo de verificacion 'less' : 'higher' : 'equals'
  // * configuracion. val = valor a evuluarse
  // * configuracion. valc = el valor de comparacion
  // return: retorna true en caso que apruebe la validacion, o false en caso que no
  // ------------------------| End Description |------------------------
  switch (configuracion.type) {
    case 'less':
      if (configuracion.val < configuracion.valc) {
        return true
      } else {
        return false
      }
    case 'higher':
      if (configuracion.val > configuracion.valc) {
        return true
      } else {
        return false
      }
    case 'equals':
      if (configuracion.val === configuracion.valc) {
        return true
      } else {
        return false
      }
  }
}

// -----------------------------------------------------------------------------------------------------------
exports._rules_type = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Ejecuta la validacion del tipo de dato a comparar
  // Parameters:
  // * configuracion. val = valor original de la comparacion
  // * configuracion. type = nombre del tipo que debe ser el valor
  // return: retorna true en caso que apruebe la validacion, o false en caso que no
  // ------------------------| End Description |------------------------
  if (this._rules_verification_getType(configuracion.val) === configuracion.type) {
    return true
  } else {
    return false
  }
}

// -----------------------------------------------------------------------------------------------------------
exports.validateRulesFormField = (Form, rules) => {
  // --------------------------| Description |--------------------------
  // Description: Funcion utilizada para generar la validacion de un grupo de reglas sobre un formulario
  // Parameters:
  // * Form = Formulario sobre el que se aplicaran las validaciones
  // * rules = Reglas a aplicarsen sobre el formulario
  // ------------------------| End Description |------------------------
  let defered = q.defer()
  let resultValidation = true
  try {
    // Verficacion de que el formulario tenga subitems, y se recorren
    for (let i = 0; i < Form.$children.length; i++) {
      // Se verifica que exista la propiedad de regla del item que se esta verificando
      if (rules[Form.$children[i].prop]) {
        let tick = true
        // En caso que exista reglas para el item:
        // Se recorren todos los items de reglas que tenga lapropiedad del prop dentro de rules
        for (let j = 0; j < rules[Form.$children[i].prop].rules.length; j++) {
          // Se verifican los argumentos de cantidad de elementos a validarse con cada regla
          if (rules[Form.$children[i].prop].rules[j].args['children']) {
            // en caso que tenga estos argumentos se ejecutara la validacion de la siguiente manera
            if (rules[Form.$children[i].prop].rules[j].args.children === 'all') {
              // en caso de que el argumento de children sea all se ejecuta la verificacion de todos los subitems del item dentro del formitem
              for (let k = 0; k < Form.$children[i].$children.length; k++) {
                // verificacion del contenido
                if (rules[Form.$children[i].prop].rules[j].typevalidation === 'content-null') {
                  if (this._rules_contentNull(Form.$children[i].$children[k].value) === true) {
                    rules[Form.$children[i].prop].result = ''
                  } else {
                    rules[Form.$children[i].prop].result = rules[Form.$children[i].prop].rules[j].message
                    tick = false
                    resultValidation = false
                    break
                  }
                // verificacion del tipo
                } else if (rules[Form.$children[i].prop].rules[j].typevalidation === 'type') {
                  if (this._rules_type({ val: Form.$children[i].$children[k].value, type: rules[Form.$children[i].prop].rules[j].args.comparation }) === true) {
                    rules[Form.$children[i].prop].result = ''
                  } else {
                    rules[Form.$children[i].prop].result = rules[Form.$children[i].prop].rules[j].message
                    tick = false
                    resultValidation = false
                    break
                  }
                // verificacion de caracteres
                } else if (rules[Form.$children[i].prop].rules[j].typevalidation === 'characters') {
                  if (this._rules_characters({ val: Form.$children[i].$children[k].value, min: rules[Form.$children[i].prop].rules[j].args.comparation.min, max: rules[Form.$children[i].prop].rules[j].args.comparation.max }) === true) {
                    rules[Form.$children[i].prop].result = ''
                  } else {
                    rules[Form.$children[i].prop].result = rules[Form.$children[i].prop].rules[j].message
                    tick = false
                    resultValidation = false
                    break
                  }
                // verificacion de comparacion
                } else if (rules[Form.$children[i].prop].rules[j].typevalidation === 'comparation') {
                  if (this._rules_comparation({ val: Form.$children[i].$children[k].value, type: rules[Form.$children[i].prop].rules[j].args.comparation.type, valc: rules[Form.$children[i].prop].rules[j].args.comparation.valc }) === true) {
                    rules[Form.$children[i].prop].result = ''
                  } else {
                    rules[Form.$children[i].prop].result = rules[Form.$children[i].prop].rules[j].message
                    tick = false
                    resultValidation = false
                    break
                  }
                }
              }
            } else {
              // en caso de que el argumento especifique a cuales subitems del Formitem se les debe aplicar la regla
              for (let k = 0; k < rules[Form.$children[i].prop].rules[j].args.children.length; k++) {
                // verificacion del contenido
                if (rules[Form.$children[i].prop].rules[j].typevalidation === 'content-null') {
                  if (this._rules_contentNull(Form.$children[i].$children[rules[Form.$children[i].prop].rules[j].args.children[k]].value) === true) {
                    // en caso de pasar la validacion
                    rules[Form.$children[i].prop].result = ''
                  } else {
                    // en caso de no pasar la validacion, se guarda el resultado del mensaje enla validacion y el tick se define en falso
                    rules[Form.$children[i].prop].result = rules[Form.$children[i].prop].rules[j].message
                    tick = false
                    resultValidation = false
                    break
                  }
                } else if (rules[Form.$children[i].prop].rules[j].typevalidation === 'type') {
                  if (this._rules_type({ val: Form.$children[i].$children[rules[Form.$children[i].prop].rules[j].args.children[k]].value, type: rules[Form.$children[i].prop].rules[j].args.comparation })) {
                    // en caso de pasar la validacion
                    rules[Form.$children[i].prop].result = ''
                  } else {
                    // en caso de no pasar la validacion, se guarda el resultado del mensaje enla validacion y el tick se define en falso
                    rules[Form.$children[i].prop].result = rules[Form.$children[i].prop].rules[j].message
                    tick = false
                    resultValidation = false
                    break
                  }
                } else if (rules[Form.$children[i].prop].rules[j].typevalidation === 'characters') {
                  if (this._rules_characters({ val: Form.$children[i].$children[rules[Form.$children[i].prop].rules[j].args.children[k]].value, min: rules[Form.$children[i].prop].rules[j].args.comparation.min, max: rules[Form.$children[i].prop].rules[j].args.comparation.max }) === true) {
                    rules[Form.$children[i].prop].result = ''
                  } else {
                    rules[Form.$children[i].prop].result = rules[Form.$children[i].prop].rules[j].message
                    tick = false
                    resultValidation = false
                    break
                  }
                } else if (rules[Form.$children[i].prop].rules[j].typevalidation === 'comparation') {
                  if (this._rules_comparation({ val: Form.$children[i].$children[rules[Form.$children[i].prop].rules[j].args.children[k]].value, type: rules[Form.$children[i].prop].rules[j].args.comparation.type, valc: rules[Form.$children[i].prop].rules[j].args.comparation.valc }) === true) {
                    rules[Form.$children[i].prop].result = ''
                  } else {
                    rules[Form.$children[i].prop].result = rules[Form.$children[i].prop].rules[j].message
                    tick = false
                    resultValidation = false
                    break
                  }
                }
              }
            }
          } else {
            // en caso no tenga argumentos adicionales en las reglas
            // en caso de que la regla a verificarse sea de contenido nulo
            if (rules[Form.$children[i].prop].rules[j].typevalidation === 'content-null') {
              // se ejecuta la validacion de contenido
              if (this._rules_contentNull(Form.$children[i].$children[0].value) === true) {
                // en caso de pasar la validacion
                rules[Form.$children[i].prop].result = ''
              } else {
                // en caso de no pasar la validacion, se guarda el resultado del mensaje enla validacion y el tick se define en falso
                rules[Form.$children[i].prop].result = rules[Form.$children[i].prop].rules[j].message
                tick = false
                resultValidation = false
              }
            } else if (rules[Form.$children[i].prop].rules[j].typevalidation === 'type') {
              if (this._rules_type({ val: Form.$children[i].$children[0].value, type: rules[Form.$children[i].prop].rules[j].args.comparation })) {
                // en caso de pasar la validacion
                rules[Form.$children[i].prop].result = ''
              } else {
                // en caso de no pasar la validacion, se guarda el resultado del mensaje enla validacion y el tick se define en falso
                rules[Form.$children[i].prop].result = rules[Form.$children[i].prop].rules[j].message
                tick = false
                resultValidation = false
              }
            } else if (rules[Form.$children[i].prop].rules[j].typevalidation === 'characters') {
              if (this._rules_characters({ val: Form.$children[i].$children[0].value, min: rules[Form.$children[i].prop].rules[j].args.comparation.min, max: rules[Form.$children[i].prop].rules[j].args.comparation.max }) === true) {
                rules[Form.$children[i].prop].result = ''
              } else {
                rules[Form.$children[i].prop].result = rules[Form.$children[i].prop].rules[j].message
                tick = false
                resultValidation = false
              }
            } else if (rules[Form.$children[i].prop].rules[j].typevalidation === 'comparation') {
              if (this._rules_comparation({ val: Form.$children[i].$children[0].value, type: rules[Form.$children[i].prop].rules[j].args.comparation.type, valc: rules[Form.$children[i].prop].rules[j].args.comparation.valc }) === true) {
                rules[Form.$children[i].prop].result = ''
              } else {
                rules[Form.$children[i].prop].result = rules[Form.$children[i].prop].rules[j].message
                tick = false
                resultValidation = false
              }
            }
          }
          // Verifica el tick, en caso de que este en falso, se sale de las reglas, ya que no pasaria la validacion
          if (tick === false) {
            break
          }
        }
      }
    }
    defered.resolve({resultValidation, rules})
  } catch (error) {
    // En caso de ocurrir un error, se envia al usuario
    defered.reject(error)
    console.log(error)
  }
  return defered.promise
}
