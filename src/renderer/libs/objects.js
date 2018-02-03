exports.createUser = (vid, videntificacion, vtipoidentificacion, vprimernombre, vsegundonombre, vprimerapellido, vsegundoapellido, vusername, vpassword, vidcargo, vfechanacimiento, vimagenperfil, vidoficina, visactive, vcreatedtime, vcreateduser, vupdatedtime, vupdateduser) => {
  return {
    // Propiedades
    id: vid,
    identificacion: videntificacion,
    tipoidentificacion: vtipoidentificacion,
    primernombre: vprimernombre,
    segundonombre: vsegundonombre,
    primerapellido: vprimerapellido,
    segundoapellido: vsegundoapellido,
    username: vusername,
    password: vpassword,
    idcargo: vidcargo,
    fechanacimiento: vfechanacimiento,
    imagenperfil: vimagenperfil,
    idoficina: vidoficina,
    isactive: visactive,
    createdtime: vcreatedtime,
    createduser: vcreateduser,
    updatedtime: vupdatedtime,
    updateduser: vupdateduser,
    // Procedimientos
    getFullName () {
      return this.primernombre + ' ' + this.segundonombre + ' ' + this.primerapellido + ' ' + this.segundoapellido
    }
  }
}

exports.createUserToken = (vid, videntificacion, vtipoidentificacion, vprimernombre, vsegundonombre, vprimerapellido, vsegundoapellido, vusername, vcargo, vfechanacimiento, vimagenperfil, voficina, visactive, vpermissions) => {
  return {
    // Propiedades
    id: vid,
    identificacion: videntificacion,
    tipoidentificacion: vtipoidentificacion,
    primernombre: vprimernombre,
    segundonombre: vsegundonombre,
    primerapellido: vprimerapellido,
    segundoapellido: vsegundoapellido,
    username: vusername,
    cargo: vcargo,
    fechanacimiento: vfechanacimiento,
    imagenperfil: 'data:image/png;base64, ' + vimagenperfil.toString('base64').replace('data:image/png;base64, ', ''),
    oficina: voficina,
    isactive: visactive,
    permissions: vpermissions,
    // Procedimientos
    getFullName () {
      return this.primernombre + ' ' + this.segundonombre + ' ' + this.primerapellido + ' ' + this.segundoapellido
    },
    verifyPermission (namePermission) {
      let access = false
      for (var i = 0; i < this.permissions.length; i++) {
        if (this.permissions[i].name === namePermission) {
          access = true
        } else if (this.permissions[i].name === 'ROOT') {
          access = true
        }
      }
      return access
    }
  }
}

exports.createPermissionsToken = (vnombre, vdescription) => {
  return {
    // Propiedades
    name: vnombre,
    description: vdescription
  }
}

exports.createTiposIdentificacion = (vid, vnombre, vdescripcion) => {
  return {
    id: vid,
    nombre: vnombre,
    descripcion: vdescripcion
  }
}

exports.createTerceros = (vid, vtipoidentificacion, videntificacion, vactive) => {
  return {
    id: vid,
    tipoidentificacion: vtipoidentificacion,
    identificacion: videntificacion,
    active: vactive
  }
}

exports.createTercerosJuridica = (vid, vnombre, vrepresentantelegal, vtercero) => {
  return {
    id: vid,
    nombre: vnombre,
    representantelegal: vrepresentantelegal,
    tercero: vtercero
  }
}

exports.createTercerosNatural = (vid, vprimernombre, vsegundonombre, vprimerapellido, vsegundoapellido, vtercero) => {
  return {
    id: vid,
    primernombre: vprimernombre,
    segundonombre: vsegundonombre,
    primerapellido: vprimerapellido,
    segundoapellido: vsegundoapellido,
    tercero: vtercero,
    getFullName () {
      let name = this.primernombre
      if (this.segundonombre) {
        name = name + ' ' + this.segundonombre
      }
      name = name + ' ' + this.primerapellido
      if (this.segundoapellido) {
        name = name + ' ' + this.segundoapellido
      }
      return name
    }
  }
}

exports.createDireccion = (vid, vtipodireccion, vdependencia, vdireccion, vdireccionjson, vciudad, vwebstring, visactive) => {
  let jquery = require('jquery')
  vdireccionjson = jquery.parseJSON(vdireccionjson)
  return {
    id: vid,
    tipodireccion: vtipodireccion,
    dependencia: vdependencia,
    direccion: vdireccion,
    direccionjson: vdireccionjson,
    ciudad: vciudad,
    webstring: vwebstring,
    isactive: visactive
  }
}

exports.createTipoDireccion = (vid, vnombre, vreqdependencia, vreqhorario, visactive) => {
  return {
    id: vid,
    nombre: vnombre,
    reqdependencia: vreqdependencia,
    reqhorario: vreqhorario,
    isactive: visactive
  }
}

exports.createCiudad = (vid, vnombre, vdepartamento) => {
  return {
    id: vid,
    nombre: vnombre,
    departamento: vdepartamento
  }
}

exports.createDepartamento = (vid, vnombre, vpais) => {
  return {
    id: vid,
    nombre: vnombre,
    pais: vpais
  }
}

exports.createPais = (vid, vnombre) => {
  return {
    id: vid,
    nombre: vnombre
  }
}

exports.createHorario = (vid, viddireccion, vdiainicio, vdiafinal, vhorainicio, vhorafinal) => {
  return {
    id: vid,
    iddireccion: viddireccion,
    diainicio: vdiainicio,
    diafinal: vdiafinal,
    horainicio: vhorainicio,
    horafinal: vhorafinal
  }
}

exports.createContacto = (vid, viddireccion, vnombre, vcargo, visactive) => {
  return {
    id: vid,
    iddireccion: viddireccion,
    nombre: vnombre,
    cargo: vcargo,
    isactive: visactive
  }
}

exports.createContactoEmail = (vid, vmail, visdefault, vidcontacto) => {
  return {
    id: vid,
    mail: vmail,
    isdefault: visdefault,
    idcontacto: vidcontacto
  }
}

exports.createContactoTelefono = (vid, vtipo, vnumero, vext, vidcontacto) => {
  return {
    id: vid,
    tipo: vtipo,
    numero: vnumero,
    ext: vext,
    idcontacto: vidcontacto
  }
}

exports.createNotifications = (vkey, vcontent, vfrom, vkind, vtime, vtype, vstate) => {
  return {
    key: vkey,
    content: vcontent,
    from: vfrom,
    kind: vkind,
    time: new Date(vtime),
    type: vtype,
    state: vstate
  }
}
