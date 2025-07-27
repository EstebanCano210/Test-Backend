import Company from '../company/company.model.js';

export const validarAdminRole = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ msg: 'No autorizado: se requiere rol ADMIN' });
  }
  next();
};


// Solo el dueño puede editar
export const validarDuenoCompany = async (req, res, next) => {
  const { uid } = req.user;
  const { id } = req.params;

  const company = await Company.findById(id);
  if (!company) {
    return res.status(404).json({ msg: 'Empresa no encontrada' });
  }

  if (company.owner.toString() !== uid) {
    return res.status(403).json({ msg: 'No autorizado: debes ser el dueño de la empresa' });
  }

  next();
};

// El dueño o un admin puede desactivarla
export const validarDuenoOAdminCompany = async (req, res, next) => {
  const { uid, role } = req.user;
  const { id } = req.params;

  const company = await Company.findById(id);
  if (!company) {
    return res.status(404).json({ msg: 'Empresa no encontrada' });
  }

  const esDueno = company.owner.toString() === uid;
  const esAdmin = role === 'ADMIN';

  if (!esDueno && !esAdmin) {
    return res.status(403).json({ msg: 'No autorizado: solo el dueño o un admin puede hacer esta acción' });
  }

  next();
};

export const hasRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !rolesPermitidos.includes(user.role)) {
      return res.status(403).json({
        success: false,
        msg: 'No tiene permisos para realizar esta acción'
      });
    }

    next();
  };
};
