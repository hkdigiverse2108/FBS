import { apiResponse } from '../common';
import { userModel } from '../database';
import { responseMessage } from '../helper';

export const storeAccessMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json(new apiResponse(401, responseMessage?.unauthorizedAccess, {}, {}, {}))
    

    const user = await userModel.findById(userId);
    if (!user) return res.status(401).json(new apiResponse(401, responseMessage?.unauthorizedAccess, {}, {}, {}))

    // Super admin can access all data
    if (user.role === 'super_admin') {
      return next();
    }

    // Admin and salesman can only access their store's data
    if (user.role === 'admin' || user.role === 'salesman') {
      if (!user.storeId) return res.status(403).json(new apiResponse(403, responseMessage?.unauthorizedAccess, {}, {}, {}))

      req.storeId = user.storeId;
      return next();
    }

    return res.status(403).json(new apiResponse(403, responseMessage?.unauthorizedAccess, {}, {}, {}))
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error, {}))
  }
}; 