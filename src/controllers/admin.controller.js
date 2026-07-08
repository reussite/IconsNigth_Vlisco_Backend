const { login,getStats, listGuests, createGuest, updateGuest, deleteGuest, } = require('../services/admin.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');


async function adminLogin(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return errorResponse(res, 400, "Nom d'utilisateur et mot de passe requis.");
    }

    const result = login(username, password);
    return successResponse(res, 200, "Connexion réussie.", result);
  } catch (error) {
    next(error);
  }
}

// Route de vérification : permet au frontend de savoir si le token est encore valide
async function adminMe(req, res) {
  return successResponse(res, 200, "Token valide.", { username: req.admin.username });
}
async function adminStats(req, res, next) {
  try {
    const stats = await getStats();
    return successResponse(res, 200, "Statistiques récupérées.", stats);
  } catch (error) {
    next(error);
  }
}

// ... adminLogin, adminMe, adminStats déjà présents ...

async function adminListGuests(req, res, next) {
  try {
    const guests = await listGuests();
    return successResponse(res, 200, "Liste des invités.", guests);
  } catch (e) { next(e); }
}

async function adminCreateGuest(req, res, next) {
  try {
    const guest = await createGuest(req.body);
    return successResponse(res, 201, "Invité ajouté.", guest);
  } catch (e) { next(e); }
}

async function adminUpdateGuest(req, res, next) {
  try {
    const guest = await updateGuest(req.params.id, req.body);
    return successResponse(res, 200, "Invité modifié.", guest);
  } catch (e) { next(e); }
}

async function adminDeleteGuest(req, res, next) {
  try {
    const result = await deleteGuest(req.params.id);
    return successResponse(res, 200, "Invité supprimé.", result);
  } catch (e) { next(e); }
}

module.exports = {
  adminLogin, adminMe, adminStats,
  adminListGuests, adminCreateGuest, adminUpdateGuest, adminDeleteGuest,
};

