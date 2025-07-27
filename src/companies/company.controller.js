import Company from './company.model.js';
import { subirImagenEmpresa } from '../services/upload.service.js';

// Crear nueva empresa
export const createCompany = async (req, res) => {
  try {
    const { name, industry, location, description } = req.body;
    const userId = req.user.id;

    const existe = await Company.findOne({ name });
    if (existe) {
      return res.status(400).json({ msg: 'Ya existe una empresa con ese nombre' });
    }

    let logoUrl = null;
    if (req.file) {
      logoUrl = await subirImagenEmpresa(req.file.path);
    }

    const nueva = new Company({
      name,
      industry,
      location,
      description,
      logoUrl,
      createdBy: userId
    });

    await nueva.save();
    res.status(201).json(nueva);
  } catch (error) {
    console.error('❌ Error al crear la empresa:', error);
    res.status(500).json({ msg: 'Error al crear la empresa' });
  }
};

// Obtener empresas _id y name para dropdown
export const getCompaniesSelect = async (req, res) => {
  try {
    const empresas = await Company
      .find({ estado: true })
      .select('_id name');
    res.json(empresas);
  } catch (error) {
    console.error('❌ Error al obtener lista de empresas:', error);
    res.status(500).json({ msg: 'Error al obtener la lista de empresas' });
  }
};

// Obtener todas las empresas activas
export const getCompanies = async (req, res) => {
  try {
    const empresas = await Company.find({ estado: true });
    res.json(empresas);
  } catch (error) {
    console.error('❌ Error al obtener empresas:', error);
    res.status(500).json({ msg: 'Error al obtener las empresas' });
  }
};

// Obtener empresa por ID
export const getCompanyById = async (req, res) => {
  try {
    const empresa = await Company.findById(req.params.id);
    if (!empresa || !empresa.estado) {
      return res.status(404).json({ msg: 'Empresa no encontrada' });
    }
    res.json(empresa);
  } catch (error) {
    console.error('❌ Error al obtener la empresa:', error);
    res.status(500).json({ msg: 'Error al obtener la empresa' });
  }
};

// Actualizar empresa (solo creador)
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const empresa = await Company.findById(id);
    if (!empresa || !empresa.estado) {
      return res.status(404).json({ msg: 'Empresa no encontrada' });
    }
    if (empresa.createdBy.toString() !== userId) {
      return res.status(403).json({ msg: 'No tienes permiso para editar esta empresa' });
    }

    const data = { ...req.body };
    if (req.file) {
      data.logoUrl = await subirImagenEmpresa(req.file.path);
    }

    const updated = await Company.findByIdAndUpdate(id, data, { new: true });
    res.json(updated);
  } catch (error) {
    console.error('❌ Error al actualizar la empresa:', error);
    res.status(500).json({ msg: 'Error al actualizar la empresa' });
  }
};

// Eliminar empresa (soft delete, solo creador)
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const empresa = await Company.findById(id);
    if (!empresa || !empresa.estado) {
      return res.status(404).json({ msg: 'Empresa no encontrada' });
    }
    if (empresa.createdBy.toString() !== userId) {
      return res.status(403).json({ msg: 'No tienes permiso para eliminar esta empresa' });
    }

    empresa.estado = false;
    await empresa.save();

    res.json({ msg: 'Empresa eliminada', empresa });
  } catch (error) {
    console.error('❌ Error al eliminar la empresa:', error);
    res.status(500).json({ msg: 'Error al eliminar la empresa' });
  }
};
