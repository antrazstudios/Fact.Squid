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
